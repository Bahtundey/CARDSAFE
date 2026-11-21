/**
 * Optional seed script. Clearly separated from production logic — it is only run
 * explicitly via `npm run seed`. It bootstraps:
 *   1. A single ADMIN account (from SEED_ADMIN_* env vars).
 *   2. A set of sample gift-card brands and trading rates (dev data only — admins
 *      manage the real catalogue through the GraphQL API; the app never depends on
 *      this script).
 *   3. Convergence of the catalogue onto the current schema: Nigeria is removed
 *      from supported countries and card types are normalized to PHYSICAL/E_CODE.
 * Running it is never required to start the app.
 */
import { env } from '../src/config/env';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User, GiftCardBrand, TradingRate } from '../src/models';
import { hashPassword } from '../src/utils/password';
import { DEFAULT_CARD_CURRENCY, DEFAULT_PAYOUT_CURRENCY, CardType } from '../src/constants/trade';
import { SUPPORTED_COUNTRIES } from '../src/constants/countries';

// E-code rates trade slightly below their physical counterpart.
const ECODE_DISCOUNT = 0.97;

interface SeedBrand {
  name: string;
  slug: string;
  category: string;
  baseRate: number;
  cardTypes: CardType[];
}

const SEED_BRANDS: SeedBrand[] = [
  { name: 'Apple', slug: 'apple', category: 'Retail', baseRate: 780, cardTypes: ['PHYSICAL', 'E_CODE'] },
  { name: 'Amazon', slug: 'amazon', category: 'Retail', baseRate: 720, cardTypes: ['PHYSICAL', 'E_CODE'] },
  { name: 'Steam', slug: 'steam', category: 'Gaming', baseRate: 800, cardTypes: ['E_CODE'] },
  { name: 'Google Play', slug: 'google-play', category: 'Entertainment', baseRate: 700, cardTypes: ['E_CODE'] },
  { name: 'eBay', slug: 'ebay', category: 'Retail', baseRate: 690, cardTypes: ['E_CODE'] },
  { name: 'Razer Gold', slug: 'razer-gold', category: 'Gaming', baseRate: 750, cardTypes: ['E_CODE'] },
  { name: 'Sephora', slug: 'sephora', category: 'Beauty', baseRate: 660, cardTypes: ['PHYSICAL', 'E_CODE'] },
  { name: 'Walmart', slug: 'walmart', category: 'Retail', baseRate: 710, cardTypes: ['PHYSICAL', 'E_CODE'] },
  { name: 'Visa', slug: 'visa', category: 'Financial', baseRate: 730, cardTypes: ['PHYSICAL', 'E_CODE'] },
  { name: 'Mastercard', slug: 'mastercard', category: 'Financial', baseRate: 730, cardTypes: ['PHYSICAL', 'E_CODE'] },
];

function rateFor(cardType: CardType, baseRate: number): number {
  if (cardType === 'E_CODE') return Math.round(baseRate * ECODE_DISCOUNT);
  return baseRate;
}

async function seedAdmin(): Promise<void> {
  if (!env.seed.adminEmail || !env.seed.adminPassword) {
    console.warn('[seed] SEED_ADMIN_* not set — skipping admin creation.');
    return;
  }

  const email = env.seed.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'ADMIN';
    existing.isActive = true;
    existing.isVerified = true;
    await existing.save();
    console.log(`[seed] Existing user promoted to ADMIN: ${email}`);
  } else {
    await User.create({
      name: env.seed.adminName || 'Administrator',
      email,
      passwordHash: await hashPassword(env.seed.adminPassword),
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    });
    console.log(`[seed] Created ADMIN account: ${email}`);
  }
}

async function convergeCatalogue(): Promise<void> {
  // Drop legacy rates: Nigeria has been removed and card types are normalized.
  const legacyRates = await TradingRate.deleteMany({
    $or: [{ country: 'NG' }, { cardType: { $nin: ['PHYSICAL', 'E_CODE'] } }],
  });
  if (legacyRates.deletedCount > 0) {
    console.log(`[seed] Removed ${legacyRates.deletedCount} legacy/Nigeria rate records.`);
  }

  // Strip Nigeria (and unknown codes) from any existing brand's supported countries.
  const brands = await GiftCardBrand.find();
  for (const brand of brands) {
    const supported = brand.supportedCountries.filter((c) =>
      SUPPORTED_COUNTRIES.some((s) => s.code === c.code) && c.code !== 'NG'
    );
    if (supported.length !== brand.supportedCountries.length) {
      brand.supportedCountries = supported;
      await brand.save();
    }
  }
}

async function seedBrandsAndRates(): Promise<void> {
  let brands = 0;
  let rates = 0;

  for (const spec of SEED_BRANDS) {
    let brand = await GiftCardBrand.findOne({ slug: spec.slug });
    if (!brand) {
      brand = await GiftCardBrand.create({
        name: spec.name,
        slug: spec.slug,
        category: spec.category,
        supportedCountries: SUPPORTED_COUNTRIES,
        logo: null,
        isActive: true,
      });
      brands += 1;
    } else {
      // Keep the admin's catalogue in sync with the supported-country list.
      brand.supportedCountries = SUPPORTED_COUNTRIES;
      await brand.save();
    }

    for (const cardType of spec.cardTypes) {
      const rate = rateFor(cardType, spec.baseRate);
      for (const country of SUPPORTED_COUNTRIES) {
        const filter = {
          brand: brand._id,
          country: country.code,
          cardType,
          cardCurrency: DEFAULT_CARD_CURRENCY,
        };
        const update = {
          currency: DEFAULT_PAYOUT_CURRENCY,
          rate,
          minAmount: 25,
          maxAmount: 1000,
          isActive: true,
        };
        const result = await TradingRate.findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true });
        if (result) rates += 1;
      }
    }
  }

  console.log(`[seed] Brands: ${brands} created (${SEED_BRANDS.length} total in set)`);
  console.log(`[seed] Rates: ${rates} upserted`);
}

async function seed(): Promise<void> {
  await connectDatabase();
  await seedAdmin();
  await convergeCatalogue();
  await seedBrandsAndRates();
  await disconnectDatabase();
  console.log('[seed] Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
