import { Types, FilterQuery, PopulateOptions } from 'mongoose';
import { GiftCard, Trade, Media, ITrade, IUser, ITradingRate, IGiftCard } from '../models';
import { Errors } from '../utils/errors';
import { round2 } from '../utils/money';
import { DEFAULT_CARD_CURRENCY, normalizeCardType, CardType } from '../constants/trade';
import { encryptSecret, decryptSecret, maskCode } from '../utils/crypto';
import * as brandService from './brand.service';
import * as rateService from './rate.service';
import * as walletService from './wallet.service';
import * as notificationService from './notification.service';
import * as auditService from './audit.service';

export interface SubmitTradeInput {
  brandId: string;
  country: string;
  cardType: string;
  value: number;
  currency?: string | null;
  imageMediaId?: string | null;
  code?: string | null;
  notes?: string | null;
}

export interface EstimateInput {
  brandId: string;
  country: string;
  cardType: string;
  value: number;
  currency?: string | null;
}

export interface TradeEstimate {
  rate: number;
  currency: string;
  cardCurrency: string;
  cardValue: number;
  estimatedValue: number;
  minAmount: number;
  maxAmount: number;
}

const TRADE_POPULATE: PopulateOptions[] = [
  { path: 'user' },
  { path: 'brand' },
  { path: 'rate', populate: { path: 'brand' } },
  { path: 'giftCard', populate: [{ path: 'brand' }, { path: 'owner' }] },
];

async function loadTrade(id: string | Types.ObjectId): Promise<ITrade | null> {
  const doc = await Trade.findById(id).populate(TRADE_POPULATE);
  return doc as unknown as ITrade | null;
}

async function loadTrades(filter: FilterQuery<ITrade>): Promise<ITrade[]> {
  const docs = await Trade.find(filter).sort({ createdAt: -1 }).populate(TRADE_POPULATE);
  return docs as unknown as ITrade[];
}

interface ResolvedRate {
  brand: NonNullable<Awaited<ReturnType<typeof brandService.getBrandById>>>;
  cardCurrency: string;
  cardType: CardType;
  rate: ITradingRate;
}

async function resolveRate(input: {
  brandId: string;
  country: string;
  cardType: string;
  currency?: string | null;
}): Promise<ResolvedRate> {
  const brand = await brandService.getBrandById(input.brandId);
  if (!brand || !brand.isActive) {
    throw Errors.badInput('This brand is not available.');
  }

  const supported = brand.supportedCountries.some((c) => c.code === input.country);
  if (!supported) {
    throw Errors.badInput('This brand is not available in the selected country.');
  }

  const cardType = normalizeCardType(input.cardType);
  if (!cardType) {
    throw Errors.badInput('Invalid card type.');
  }

  const cardCurrency = (input.currency ?? DEFAULT_CARD_CURRENCY).toUpperCase();
  const rate = await rateService.findActiveRate(input.brandId, input.country, cardType, cardCurrency);
  if (!rate) {
    throw Errors.badInput('No active rate for this card. Try a different card type or country.');
  }

  return { brand, cardCurrency, cardType, rate };
}

function parseCardValue(value: number, rate: ITradingRate): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw Errors.badInput('Enter a valid card value.');
  }
  if (parsed < rate.minAmount) {
    throw Errors.badInput(`The minimum card value is ${rate.currency} ${rate.minAmount}.`);
  }
  if (parsed > rate.maxAmount) {
    throw Errors.badInput(`The maximum card value is ${rate.currency} ${rate.maxAmount}.`);
  }
  return parsed;
}

export async function estimate(input: EstimateInput): Promise<TradeEstimate> {
  const { cardCurrency, rate } = await resolveRate(input);
  const cardValue = Number(input.value);
  if (!Number.isFinite(cardValue) || cardValue <= 0) {
    throw Errors.badInput('Enter a valid card value.');
  }
  return {
    rate: rate.rate,
    currency: rate.currency,
    cardCurrency,
    cardValue,
    estimatedValue: round2(cardValue * rate.rate),
    minAmount: rate.minAmount,
    maxAmount: rate.maxAmount,
  };
}

export async function createTrade(input: SubmitTradeInput, user: IUser): Promise<ITrade> {
  const { brand, cardCurrency, cardType, rate } = await resolveRate(input);
  const value = parseCardValue(input.value, rate);

  let image = null;
  let codeCipher: string | null = null;
  let codeMask: string | null = null;

  if (cardType === 'E_CODE') {
    // E-codes use the dedicated code-entry workflow — no image upload required.
    const code = input.code?.trim() ?? '';
    if (!code) {
      throw Errors.badInput('Enter the gift card code.');
    }
    if (code.length < 4 || code.length > 200) {
      throw Errors.badInput('The gift card code must be between 4 and 200 characters.');
    }
    codeCipher = encryptSecret(code);
    codeMask = maskCode(code);
  } else {
    // Physical cards require an image already uploaded as a Media document.
    const media = await Media.findById(input.imageMediaId);
    if (!media) {
      throw Errors.badInput('A card image is required.');
    }
    if (media.owner.toString() !== user._id.toString()) {
      throw Errors.forbidden('Invalid card image.');
    }
    image = { url: media.url, publicId: media.publicId };
  }

  const giftCard = await GiftCard.create({
    owner: user._id,
    brand: brand._id,
    country: input.country,
    cardType,
    value,
    currency: cardCurrency,
    image,
    codeCipher,
    codeMask,
    notes: input.notes?.trim() || null,
  });

  const trade = await Trade.create({
    user: user._id,
    giftCard: giftCard._id,
    brand: brand._id,
    rate: rate._id,
    status: 'PENDING',
    cardValue: value,
    cardCurrency,
    estimatedValue: round2(value * rate.rate),
    payoutAmount: null,
    currency: rate.currency,
  });

  await notificationService.notify(
    user._id,
    'TRADE_SUBMITTED',
    'Trade submitted',
    `Your ${brand.name} card trade was submitted for review.`,
    { tradeId: trade._id.toString() }
  );

  const hydrated = await loadTrade(trade._id);
  if (!hydrated) throw Errors.notFound('Trade not found.');
  return hydrated;
}

export async function getMyTrades(user: IUser): Promise<ITrade[]> {
  return loadTrades({ user: user._id });
}

export async function listAllTrades(): Promise<ITrade[]> {
  return loadTrades({});
}

export async function getTradeById(id: string, user: IUser): Promise<ITrade | null> {
  const trade = await loadTrade(id);
  if (!trade) return null;

  const isAdmin = user.role === 'ADMIN';
  const isOwner = trade.user._id.toString() === user._id.toString();
  if (!isAdmin && !isOwner) {
    throw Errors.forbidden('You do not have access to this trade.');
  }
  return trade;
}

/**
 * Admin-only access to the full, decrypted e-code for review workflows.
 * Codes are encrypted at rest and never returned through general queries;
 * this is the single gate for authorized reviewers, and every reveal is audited.
 */
export async function revealGiftCardCode(
  giftCardId: string,
  admin: IUser,
  ip?: string | null
): Promise<string | null> {
  const card = (await GiftCard.findById(giftCardId).select('+codeCipher')) as
    | (IGiftCard & { codeCipher?: string | null })
    | null;
  if (!card) throw Errors.notFound('Gift card not found.');
  if (!card.codeCipher) throw Errors.badInput('This card does not have a stored e-code.');

  await auditService.log({
    action: 'gift_card_code_revealed',
    actorId: admin._id,
    targetId: card._id,
    targetType: 'GiftCard',
    metadata: { cardOwner: card.owner.toString() },
    ip,
  });

  return decryptSecret(card.codeCipher);
}

export async function cancelTrade(id: string, user: IUser): Promise<ITrade> {
  const trade = await Trade.findById(id);
  if (!trade) throw Errors.notFound('Trade not found.');
  if (trade.user.toString() !== user._id.toString()) {
    throw Errors.forbidden('You cannot cancel this trade.');
  }
  if (trade.status !== 'PENDING') {
    throw Errors.badInput('Only pending trades can be cancelled.');
  }

  trade.status = 'CANCELLED';
  await trade.save();

  const hydrated = await loadTrade(id);
  if (!hydrated) throw Errors.notFound('Trade not found.');
  return hydrated;
}

export async function approveTrade(id: string, admin: IUser, ip?: string | null): Promise<ITrade> {
  const trade = await Trade.findById(id);
  if (!trade) throw Errors.notFound('Trade not found.');

  if (trade.status === 'APPROVED' || trade.status === 'COMPLETED') {
    throw Errors.badInput('This trade has already been processed.');
  }
  if (trade.status !== 'PENDING' && trade.status !== 'UNDER_REVIEW') {
    throw Errors.badInput('This trade cannot be approved.');
  }

  const payout = trade.estimatedValue;

  // Credit the seller's wallet and record the transaction. Only ever done here.
  await walletService.credit(trade.user, payout, {
    type: 'TRADE_CREDIT',
    description: 'Gift card trade payout',
    tradeId: trade._id,
  });

  trade.status = 'APPROVED';
  trade.payoutAmount = payout;
  trade.reviewedBy = admin._id;
  await trade.save();

  await notificationService.notify(
    trade.user,
    'TRADE_APPROVED',
    'Trade approved',
    `Your trade was approved and ${payout.toLocaleString()} ${trade.currency} was credited to your wallet.`,
    { tradeId: trade._id.toString() }
  );
  await auditService.log({
    action: 'trade_approved',
    actorId: admin._id,
    targetId: trade._id,
    targetType: 'Trade',
    metadata: { payout },
    ip,
  });

  const hydrated = await loadTrade(id);
  if (!hydrated) throw Errors.notFound('Trade not found.');
  return hydrated;
}

export async function rejectTrade(id: string, admin: IUser, reason: string, ip?: string | null): Promise<ITrade> {
  const trade = await Trade.findById(id);
  if (!trade) throw Errors.notFound('Trade not found.');

  if (['APPROVED', 'COMPLETED', 'REJECTED'].includes(trade.status)) {
    throw Errors.badInput('This trade has already been processed.');
  }

  trade.status = 'REJECTED';
  trade.reviewNote = reason?.trim() || null;
  trade.reviewedBy = admin._id;
  await trade.save();

  await notificationService.notify(
    trade.user,
    'TRADE_REJECTED',
    'Trade rejected',
    reason?.trim() || 'Your trade was rejected.',
    { tradeId: trade._id.toString() }
  );
  await auditService.log({
    action: 'trade_rejected',
    actorId: admin._id,
    targetId: trade._id,
    targetType: 'Trade',
    metadata: { reason },
    ip,
  });

  const hydrated = await loadTrade(id);
  if (!hydrated) throw Errors.notFound('Trade not found.');
  return hydrated;
}
