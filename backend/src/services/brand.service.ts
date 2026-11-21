import { GiftCardBrand, IGiftCardBrand, BrandLogo, BrandCountry } from '../models';
import { Errors } from '../utils/errors';
import { SUPPORTED_COUNTRIES } from '../constants/countries';
import { destroyMedia } from './cloudinary/cloudinary.service';

export interface CreateBrandInput {
  name: string;
  slug?: string;
  category: string;
  supportedCountries?: BrandCountry[];
  logo?: BrandLogo | null;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  category?: string;
  supportedCountries?: BrandCountry[];
  logo?: BrandLogo | null;
}

function normalizeSlug(slug: string | undefined, name: string): string {
  const value = (slug ?? name).toLowerCase().trim().replace(/\s+/g, '-');
  if (!/^[a-z0-9-]+$/.test(value)) {
    throw Errors.badInput('Slug must contain only lowercase letters, numbers and hyphens.');
  }
  return value;
}

/**
 * Validate a brand's supported countries against the platform's master list and
 * hard-reject Nigeria — it has been removed as a trading country.
 */
function sanitizeCountries(countries: BrandCountry[] | undefined): BrandCountry[] {
  const list = countries ?? [];
  const seen = new Set<string>();
  const out: BrandCountry[] = [];

  for (const c of list) {
    if (c.code === 'NG') {
      throw Errors.badInput('Nigeria is no longer a supported trading country.');
    }
    if (!SUPPORTED_COUNTRIES.some((s) => s.code === c.code)) {
      throw Errors.badInput(`Unknown country code: ${c.code}.`);
    }
    if (seen.has(c.code)) continue;
    seen.add(c.code);
    out.push({ code: c.code, name: c.name });
  }
  return out;
}

export async function listBrands(): Promise<IGiftCardBrand[]> {
  return GiftCardBrand.find().sort({ name: 1 });
}

export async function listActiveBrands(): Promise<IGiftCardBrand[]> {
  return GiftCardBrand.find({ isActive: true }).sort({ name: 1 });
}

export async function getBrandBySlug(slug: string): Promise<IGiftCardBrand | null> {
  return GiftCardBrand.findOne({ slug: slug.toLowerCase() });
}

export async function getBrandById(id: string): Promise<IGiftCardBrand | null> {
  return GiftCardBrand.findById(id);
}

export async function createBrand(input: CreateBrandInput): Promise<IGiftCardBrand> {
  const name = input.name?.trim();
  if (!name) throw Errors.badInput('Brand name is required.');
  if (!input.category?.trim()) throw Errors.badInput('Brand category is required.');

  const slug = normalizeSlug(input.slug, name);
  const existing = await GiftCardBrand.findOne({ slug });
  if (existing) throw Errors.conflict('A brand with this slug already exists.');

  return GiftCardBrand.create({
    name,
    slug,
    category: input.category.trim(),
    supportedCountries: sanitizeCountries(input.supportedCountries),
    logo: input.logo ?? null,
    isActive: true,
  });
}

export async function updateBrand(id: string, input: UpdateBrandInput): Promise<IGiftCardBrand> {
  const brand = await GiftCardBrand.findById(id);
  if (!brand) throw Errors.notFound('Brand not found.');

  let oldLogoPublicId: string | null = null;

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw Errors.badInput('Brand name cannot be empty.');
    brand.name = name;
  }
  if (input.category !== undefined) {
    const category = input.category.trim();
    if (!category) throw Errors.badInput('Brand category cannot be empty.');
    brand.category = category;
  }
  if (input.slug !== undefined) {
    const slug = normalizeSlug(input.slug, brand.name);
    const clash = await GiftCardBrand.findOne({ slug, _id: { $ne: brand._id } });
    if (clash) throw Errors.conflict('A brand with this slug already exists.');
    brand.slug = slug;
  }
  if (input.supportedCountries !== undefined) {
    brand.supportedCountries = sanitizeCountries(input.supportedCountries);
  }
  if ('logo' in input) {
    const nextLogo = input.logo ?? null;
    oldLogoPublicId = brand.logo?.publicId ?? null;
    brand.logo = nextLogo;
  }

  await brand.save();

  // Only after the new logo reference is persisted do we delete the old
  // Cloudinary asset — a failed update never loses the existing logo.
  if (oldLogoPublicId && (!brand.logo || brand.logo.publicId !== oldLogoPublicId)) {
    await destroyMedia(oldLogoPublicId).catch(() => {
      // Best effort: orphaned assets are harmless; never fail the update.
    });
  }

  return brand;
}

export async function setBrandActive(id: string, isActive: boolean): Promise<IGiftCardBrand> {
  const brand = await GiftCardBrand.findById(id);
  if (!brand) throw Errors.notFound('Brand not found.');
  brand.isActive = isActive;
  await brand.save();
  return brand;
}

export async function disableBrand(id: string): Promise<IGiftCardBrand> {
  return setBrandActive(id, false);
}
