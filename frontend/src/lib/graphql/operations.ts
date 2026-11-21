import { gql } from '@apollo/client';

// ─── Auth types ─────────────────────────────────────────────────────
export interface Avatar {
  id: string;
  url: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  avatar: Avatar | null;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResult {
  success: boolean;
  message: string;
}

// ─── Trading types ──────────────────────────────────────────────────
export interface BrandLogo {
  url: string;
  publicId: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface GiftCardBrand {
  id: string;
  name: string;
  slug: string;
  category: string;
  supportedCountries: Country[];
  logo: BrandLogo | null;
  isActive: boolean;
}

export interface TradingRate {
  id: string;
  brand: GiftCardBrand;
  country: string;
  cardType: string;
  cardCurrency: string;
  currency: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

export type TradeStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface GiftCardImage {
  url: string;
  publicId: string;
}

export interface GiftCard {
  id: string;
  owner: AuthUser;
  brand: GiftCardBrand;
  country: string;
  cardType: string;
  value: number;
  currency: string;
  image: GiftCardImage | null;
  notes: string | null;
  codeMask: string | null;
  hasCode: boolean;
  createdAt: string;
}

export interface Trade {
  id: string;
  user: AuthUser;
  giftCard: GiftCard;
  brand: GiftCardBrand;
  rate: TradingRate | null;
  status: TradeStatus;
  cardValue: number;
  cardCurrency: string;
  estimatedValue: number;
  payoutAmount: number | null;
  currency: string;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
}

// ─── Financial types ────────────────────────────────────────────────
export type TransactionType =
  | 'TRADE_CREDIT'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'ADJUSTMENT'
  | 'BONUS'
  | 'FEE';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Wallet {
  id: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  reference: string;
  status: TransactionStatus;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface Withdrawal {
  id: string;
  user: AuthUser;
  amount: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: WithdrawalStatus;
  reference: string;
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
}

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_CARD';

export interface KycStatusInfo {
  id: string;
  documentType: DocumentType;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface KycRecord {
  id: string;
  user: AuthUser;
  documentType: DocumentType;
  documentImage: { url: string; publicId: string };
  selfieImage: { url: string; publicId: string } | null;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export type TrustTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface TrustTierInfo {
  tier: TrustTier;
  minWithdrawal: number;
  maxWithdrawalPerRequest: number;
  maxWithdrawalPerDay: number;
  maxBalance: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingTrades: number;
  completedTrades: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  walletLiabilities: number;
  totalVolume: number;
}

export interface AuditLog {
  id: string;
  actorId: AuthUser | null;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: string | null;
  ip: string | null;
  createdAt: string;
}

// ─── Auth operations ────────────────────────────────────────────────
const USER_FIELDS = `
  id
  name
  email
  role
  isActive
  isVerified
  avatar { id url }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_QUERY_STRING = `
  mutation RefreshToken {
    refreshToken {
      accessToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql(REFRESH_TOKEN_QUERY_STRING);

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ${USER_FIELDS}
    }
  }
`;

// ─── Brand operations ───────────────────────────────────────────────
const BRAND_FIELDS = `
  id
  name
  slug
  category
  supportedCountries { code name }
  logo { url publicId }
  isActive
`;

export const GIFT_CARD_BRANDS = gql`
  query GiftCardBrands {
    giftCardBrands { ${BRAND_FIELDS} }
  }
`;

export const CREATE_GIFT_CARD_BRAND = gql`
  mutation CreateGiftCardBrand($input: CreateGiftCardBrandInput!) {
    createGiftCardBrand(input: $input) { ${BRAND_FIELDS} }
  }
`;

export const UPDATE_GIFT_CARD_BRAND = gql`
  mutation UpdateGiftCardBrand($id: ID!, $input: UpdateGiftCardBrandInput!) {
    updateGiftCardBrand(id: $id, input: $input) { ${BRAND_FIELDS} }
  }
`;

export const DISABLE_GIFT_CARD_BRAND = gql`
  mutation DisableGiftCardBrand($id: ID!) {
    disableGiftCardBrand(id: $id) { ${BRAND_FIELDS} }
  }
`;

export const SET_GIFT_CARD_BRAND_ACTIVE = gql`
  mutation SetGiftCardBrandActive($id: ID!, $isActive: Boolean!) {
    setGiftCardBrandActive(id: $id, isActive: $isActive) { ${BRAND_FIELDS} }
  }
`;

export const COUNTRIES = gql`
  query Countries {
    countries { code name }
  }
`;

// ─── Rate operations ────────────────────────────────────────────────
export const TRADING_RATES = gql`
  query TradingRates($brandId: ID) {
    tradingRates(brandId: $brandId) {
      id
      country
      cardType
      cardCurrency
      currency
      rate
      minAmount
      maxAmount
      isActive
      brand { id name slug }
    }
  }
`;

export const UPDATE_TRADING_RATE = gql`
  mutation UpdateTradingRate($input: UpdateTradingRateInput!) {
    updateTradingRate(input: $input) {
      id
      country
      cardType
      cardCurrency
      currency
      rate
      minAmount
      maxAmount
      isActive
    }
  }
`;

export const TRADE_ESTIMATE = gql`
  query TradeEstimate($input: TradeEstimateInput!) {
    tradeEstimate(input: $input) {
      rate
      currency
      cardCurrency
      cardValue
      estimatedValue
      minAmount
      maxAmount
    }
  }
`;

// ─── Trade operations ───────────────────────────────────────────────
const TRADE_FIELDS = `
  id
  status
  cardValue
  cardCurrency
  estimatedValue
  payoutAmount
  currency
  reviewNote
  createdAt
  updatedAt
  brand { id name slug logo { url } }
  giftCard {
    id
    cardType
    country
    value
    currency
    image { url publicId }
    notes
    codeMask
    hasCode
  }
`;

export const MY_TRADES = gql`
  query MyTrades {
    myTrades { ${TRADE_FIELDS} }
  }
`;

export const TRADE = gql`
  query Trade($id: ID!) {
    trade(id: $id) { ${TRADE_FIELDS} user { id name email } rate { id rate currency cardCurrency } }
  }
`;

export const ALL_TRADES = gql`
  query AllTrades {
    allTrades {
      ${TRADE_FIELDS}
      user { id name email }
    }
  }
`;

export const CREATE_TRADE = gql`
  mutation CreateTrade($input: SubmitTradeInput!) {
    createTrade(input: $input) { id status }
  }
`;

export const CANCEL_TRADE = gql`
  mutation CancelTrade($id: ID!) {
    cancelTrade(id: $id) { id status }
  }
`;

export const APPROVE_TRADE = gql`
  mutation ApproveTrade($id: ID!) {
    approveTrade(id: $id) { id status payoutAmount }
  }
`;

export const REJECT_TRADE = gql`
  mutation RejectTrade($id: ID!, $reason: String!) {
    rejectTrade(id: $id, reason: $reason) { id status }
  }
`;

export const REVEAL_GIFT_CARD_CODE = gql`
  mutation RevealGiftCardCode($giftCardId: ID!) {
    revealGiftCardCode(giftCardId: $giftCardId)
  }
`;

export const UPLOAD_GIFT_CARD_IMAGE = gql`
  mutation UploadGiftCardImage($base64Image: String!, $folder: String) {
    uploadGiftCardImage(base64Image: $base64Image, folder: $folder) {
      id
      url
      publicId
    }
  }
`;

// ─── Wallet operations ──────────────────────────────────────────────
export const WALLET = gql`
  query Wallet {
    wallet { id balance availableBalance pendingBalance currency }
  }
`;

export const TRANSACTIONS = gql`
  query Transactions($limit: Int, $offset: Int) {
    transactions(limit: $limit, offset: $offset) {
      id
      type
      amount
      currency
      reference
      status
      description
      balanceBefore
      balanceAfter
      createdAt
    }
  }
`;

export const MY_TRUST_TIER = gql`
  query MyTrustTier {
    myTrustTier { tier minWithdrawal maxWithdrawalPerRequest maxWithdrawalPerDay maxBalance }
  }
`;

// ─── Withdrawal operations ──────────────────────────────────────────
const WITHDRAWAL_FIELDS = `
  id
  amount
  currency
  bankName
  accountName
  accountNumber
  status
  reference
  rejectionReason
  processedAt
  createdAt
`;

export const WITHDRAWALS = gql`
  query Withdrawals {
    withdrawals { ${WITHDRAWAL_FIELDS} }
  }
`;

export const ALL_WITHDRAWALS = gql`
  query AllWithdrawals($status: WithdrawalStatus) {
    allWithdrawals(status: $status) {
      ${WITHDRAWAL_FIELDS}
      user { id name email }
    }
  }
`;

export const REQUEST_WITHDRAWAL = gql`
  mutation RequestWithdrawal($input: RequestWithdrawalInput!) {
    requestWithdrawal(input: $input) { ${WITHDRAWAL_FIELDS} }
  }
`;

export const CANCEL_WITHDRAWAL = gql`
  mutation CancelWithdrawal($id: ID!) {
    cancelWithdrawal(id: $id) { id status }
  }
`;

export const APPROVE_WITHDRAWAL = gql`
  mutation ApproveWithdrawal($id: ID!) {
    approveWithdrawal(id: $id) { id status }
  }
`;

export const COMPLETE_WITHDRAWAL = gql`
  mutation CompleteWithdrawal($id: ID!) {
    completeWithdrawal(id: $id) { id status }
  }
`;

export const REJECT_WITHDRAWAL = gql`
  mutation RejectWithdrawal($id: ID!, $reason: String!) {
    rejectWithdrawal(id: $id, reason: $reason) { id status }
  }
`;

// ─── KYC operations ─────────────────────────────────────────────────
export const KYC_STATUS = gql`
  query KycStatus {
    kycStatus { id documentType status rejectionReason reviewedAt createdAt }
  }
`;

export const ALL_KYC = gql`
  query AllKyc($status: KycStatus) {
    allKyc(status: $status) {
      id
      documentType
      status
      rejectionReason
      reviewedAt
      createdAt
      documentImage { url publicId }
      selfieImage { url publicId }
      user { id name email }
    }
  }
`;

export const SUBMIT_KYC = gql`
  mutation SubmitKYC($input: SubmitKycInput!) {
    submitKYC(input: $input) { id documentType status rejectionReason }
  }
`;

export const APPROVE_KYC = gql`
  mutation ApproveKYC($id: ID!) {
    approveKYC(id: $id) { id status }
  }
`;

export const REJECT_KYC = gql`
  mutation RejectKYC($id: ID!, $reason: String!) {
    rejectKYC(id: $id, reason: $reason) { id status }
  }
`;

// ─── Notification operations ────────────────────────────────────────
export const NOTIFICATIONS = gql`
  query Notifications($limit: Int) {
    notifications(limit: $limit) { id type title message read createdAt }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) { id read }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ─── Admin operations ───────────────────────────────────────────────
export const ADMIN_DASHBOARD_STATS = gql`
  query AdminDashboardStats {
    adminDashboardStats {
      totalUsers
      activeUsers
      pendingTrades
      completedTrades
      pendingWithdrawals
      pendingKyc
      walletLiabilities
      totalVolume
    }
  }
`;

export const ALL_USERS = gql`
  query AllUsers($search: String) {
    allUsers(search: $search) {
      id
      name
      email
      role
      isActive
      isVerified
      createdAt
    }
  }
`;

export const ALL_TRANSACTIONS = gql`
  query AllTransactions($limit: Int, $offset: Int) {
    allTransactions(limit: $limit, offset: $offset) {
      id
      type
      amount
      currency
      reference
      status
      description
      balanceBefore
      balanceAfter
      createdAt
      user { id name email }
    }
  }
`;

export const AUDIT_LOGS = gql`
  query AuditLogs($limit: Int) {
    auditLogs(limit: $limit) {
      id
      action
      targetType
      metadata
      ip
      createdAt
      actorId { id name email }
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($id: ID!) {
    suspendUser(id: $id) { id isActive }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) { id isActive }
  }
`;

export const ADJUST_WALLET = gql`
  mutation AdjustWallet($userId: ID!, $amount: Float!, $reason: String) {
    adjustWallet(userId: $userId, amount: $amount, reason: $reason) {
      id
      balance
      availableBalance
      pendingBalance
      currency
    }
  }
`;
