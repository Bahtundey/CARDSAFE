import { TradingRate, ITradingRate, IUser } from '../models';
import { Errors } from '../utils/errors';
import {
  DEFAULT_CARD_CURRENCY,
  DEFAULT_PAYOUT_CURRENCY,
  normalizeCardType,
  CARD_TYPE_LABELS,
  CardType,
} from '../constants/trade';
import * as auditService from './audit.service';

export interface UpsertRateInput {
  brandId: string;
  country: string;
  cardType: string;
  cardCurrency?: string;
  currency?: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  isActive?: boolean;
}

export async function listRates(brandId?: string): Promise<ITradingRate[]> {
  const filter = brandId ? { brand: brandId } : {};
  return TradingRate.find(filter).sort({ brand: 1, country: 1, cardType: 1 }).populate('brand');
}

export async function listActiveRates(brandId?: string): Promise<ITradingRate[]> {
  const filter = brandId ? { brand: brandId, isActive: true } : { isActive: true };
  return TradingRate.find(filter).sort({ brand: 1, country: 1, cardType: 1 }).populate('brand');
}

export async function findActiveRate(
  brandId: string,
  country: string,
  cardType: string,
  cardCurrency: string
): Promise<ITradingRate | null> {
  const normalized = normalizeCardType(cardType);
  if (!normalized) return null;
  return TradingRate.findOne({
    brand: brandId,
    country,
    cardType: normalized,
    cardCurrency: cardCurrency.toUpperCase(),
    isActive: true,
  });
}

/**
 * Enforce the business rule that an E_CODE rate must always be lower than the
 * matching PHYSICAL rate for the same (brand, country, cardCurrency) whenever
 * both rate categories are active. We never silently adjust a rate — instead we
 * reject the write with a helpful message for the admin.
 */
async function assertECodeLower(
  brandId: string,
  country: string,
  cardCurrency: string,
  cardType: CardType,
  rate: number
): Promise<void> {
  const counterpartType: CardType = cardType === 'E_CODE' ? 'PHYSICAL' : 'E_CODE';
  const counterpart = await TradingRate.findOne({
    brand: brandId,
    country,
    cardType: counterpartType,
    cardCurrency,
    isActive: true,
  });

  if (!counterpart) return;

  if (cardType === 'E_CODE' && rate >= counterpart.rate) {
    throw Errors.badInput(
      `E-code rate (${rate}) must be lower than the active physical rate (${counterpart.rate}) for this brand and country.`
    );
  }
  if (cardType === 'PHYSICAL' && rate <= counterpart.rate) {
    throw Errors.badInput(
      `Physical rate (${rate}) must be higher than the active E-code rate (${counterpart.rate}) for this brand and country.`
    );
  }
}

export async function upsertRate(input: UpsertRateInput, admin?: IUser | null, ip?: string | null): Promise<ITradingRate> {
  const cardCurrency = (input.cardCurrency ?? DEFAULT_CARD_CURRENCY).toUpperCase();
  const currency = (input.currency ?? DEFAULT_PAYOUT_CURRENCY).toUpperCase();

  if (!input.brandId) throw Errors.badInput('Brand is required.');
  if (!input.country?.trim()) throw Errors.badInput('Country is required.');

  const cardType = normalizeCardType(input.cardType);
  if (!cardType) {
    throw Errors.badInput(`Card type must be one of: ${Object.values(CARD_TYPE_LABELS).join(', ')}.`);
  }

  if (!Number.isFinite(input.rate) || input.rate <= 0) throw Errors.badInput('Rate must be a positive number.');
  if (!Number.isFinite(input.minAmount) || input.minAmount < 0) throw Errors.badInput('Minimum amount is invalid.');
  if (!Number.isFinite(input.maxAmount) || input.maxAmount <= input.minAmount) {
    throw Errors.badInput('Maximum amount must be greater than the minimum.');
  }

  await assertECodeLower(input.brandId, input.country, cardCurrency, cardType, input.rate);

  const result = await TradingRate.findOneAndUpdate(
    { brand: input.brandId, country: input.country, cardType, cardCurrency },
    {
      $set: {
        currency,
        rate: input.rate,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        isActive: input.isActive ?? true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('brand');

  if (admin) {
    await auditService.log({
      action: 'rate_changed',
      actorId: admin._id,
      targetId: result._id,
      targetType: 'TradingRate',
      metadata: {
        brandId: input.brandId,
        country: input.country,
        cardType,
        rate: input.rate,
      },
      ip,
    });
  }

  return result;
}
