export type Language = 'en' | 'id';

export type CurrencyCode = 'SGD' | 'IDR' | 'USD';

export type AppMode = 'storefront' | 'crm';

export type CrmSection = 'events' | 'calendar' | 'calculator' | 'numbers' | 'studio';

export type CrmStage =
  | 'estimate'
  | 'lead'
  | 'proposal-sent'
  | 'contract-signed'
  | 'booked';

export type ProductCategory =
  | 'all'
  | 'sunset-reverie'
  | 'bespoke'
  | 'bouquets'
  | 'bloomboxes'
  | 'table-vase'
  | 'vase'
  | 'preserved';

export type ServiceScopeId =
  | 'corporate'
  | 'events'
  | 'weddings'
  | 'workshops'
  | 'flower-stand';

export type InfoModalTopic = 'blogs' | 'faq' | 'returns' | null;

export type PricingUnit = 'each' | 'counted' | 'per-guest' | 'per-foot';

export interface CalculatorBrandTheme {
  pageBg: string;
  cardBg: string;
  textColor: string;
  smallPrintColor: string;
  accentLineColor: string;
  estimateAccentColor: string;
  buttonBg: string;
  buttonText: string;
  headingFont: string;
  bodyFont: string;
}

export interface CalculatorPiece {
  id: string;
  groupLabel: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  enabled: boolean;
  pricingUnit?: PricingUnit;
  noFee?: boolean;
}

export interface CalculatorConfig {
  brandTheme: CalculatorBrandTheme;
  currencyLabel: string;
  localeFormat: string;
  customSymbol: string;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: 'comma' | 'period' | 'space';
  smallLabel: string;
  title: string;
  titleItalic: string;
  introSentence: string;
  sectionNotes: Record<string, string>;
  rentalSections: string[];
  feeLabel: string;
  feePercent: number;
  hideFeeLine: boolean;
  neverShowEach: boolean;
  maxQtyPerItem: number;
  minimumProjectSGD: number;
  minimumWarning: string;
  blockBelowMinimum: boolean;
  subtotalLabel: string;
  totalLabel: string;
  rentalsLabel: string;
  noteUnderTotal: string;
  downloadBtnLabel: string;
  copyBtnLabel: string;
  leadFormHeading: string;
  leadFormSubheading: string;
  submitBtnText: string;
  submitFooterNote: string;
  inquiryBtnText: string;
  inquiryBtnUrl: string;
  privacySentence: string;
  privacyLinkText: string;
  privacyUrl: string;
  thankYouHeading: string;
  thankYouMessage: string;
  pieces: CalculatorPiece[];
  lastPublishedAt: string;
}

export interface ProductSizeOption {
  id: 'petite' | 'classic' | 'grand';
  labelEn: string;
  labelId: string;
  dimensions: string;
  priceMultiplier: number;
}

export interface FloralProduct {
  id: string;
  slug: string;
  category: Exclude<ProductCategory, 'all' | 'sunset-reverie' | 'bespoke'>;
  isSunsetReverie?: boolean;
  isBespoke?: boolean;
  isVase?: boolean;
  categoryLabelEn: string;
  categoryLabelId: string;
  freshnessLabelEn: string;
  freshnessLabelId: string;
  nameEn: string;
  nameId: string;
  basePriceSGD: number;
  image: string;
  imageAlt: string;
  stemNotesEn: string;
  stemNotesId: string;
  descriptionEn: string;
  descriptionId: string;
  careGuideEn: string;
  careGuideId: string;
  availabilityTag?: string;
}

export interface SubscriptionPlan {
  id: 'weekly' | 'biweekly' | 'monthly';
  cadenceLabelEn: string;
  cadenceLabelId: string;
  deliveriesPerMonth: number;
  homePriceSGD: number;
  corporatePriceSGD: number;
  summaryEn: string;
  summaryId: string;
}

export interface SimulatorFormatOption {
  id: string;
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  baseFeeSGD: number;
  image: string;
}

export interface SimulatorStemOption {
  id: string;
  group: 'focal' | 'secondary' | 'foliage' | 'preserved';
  nameEn: string;
  nameId: string;
  originNote: string;
  pricePerStemSGD: number;
}

export interface SimulatorAddonOption {
  id: string;
  nameEn: string;
  nameId: string;
  priceSGD: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  categoryLabel: string;
  image: string;
  sizeId: 'petite' | 'classic' | 'grand';
  sizeLabel: string;
  palette: string;
  deliveryDate: string;
  cardMessage: string;
  unitPriceSGD: number;
  quantity: number;
  isSubscription?: boolean;
}

export interface OrderSubmission {
  orderNumber: string;
  createdAt: string;
  currency: CurrencyCode;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  recipientName: string;
  deliveryAddress: string;
  postalCode: string;
  deliverySlot: string;
  paymentMethod: 'bank-transfer' | 'card' | 'whatsapp-concierge';
  items: CartItem[];
  subtotalSGD: number;
  deliveryFeeSGD: number;
  totalSGD: number;
}

export interface WeddingInquiry {
  referenceId: string;
  hostName: string;
  email: string;
  phone: string;
  eventDate: string;
  venue: string;
  scope: string;
  budgetTier: string;
  notes: string;
  submittedAt: string;
}

export interface ProposalLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPriceSGD: number;
}

export interface CrmLead {
  id: string;
  referenceCode: string;
  source: 'simulator' | 'service-form' | 'manual';
  stage: CrmStage;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  palette: string;
  estimatedTotalSGD: number;
  depositPaidSGD: number;
  stemCounts: Record<string, number>;
  lineItems: ProposalLineItem[];
  studioNotes: string;
  contractSignedBy?: string;
  contractSignedAt?: string;
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  date: string;
  readTime: string;
  titleEn: string;
  titleId: string;
  excerptEn: string;
  excerptId: string;
  bodyEn: string;
  bodyId: string;
}

export interface FaqEntry {
  qEn: string;
  qId: string;
  aEn: string;
  aId: string;
}

export interface PublicProposalData {
  id: string;
  ownerId: string;
  studioName: string;
  referenceCode: string;
  clientFirstName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  palette: string;
  estimatedTotalSGD: number;
  depositPaidSGD: number;
  stage: CrmStage;
  lineItems: ProposalLineItem[];
  contractSignedBy?: string;
  contractSignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioAccessConfig {
  restrictToAllowedEmails: boolean;
  allowedEmails: string[];
}
