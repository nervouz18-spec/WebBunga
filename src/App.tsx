import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { FormEvent, Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CrmLoginScreen } from './components/CrmLoginScreen';
import { InfoDrawerModal } from './components/InfoDrawerModal';
import { IntegrationModal } from './components/IntegrationModal';
import { Navbar } from './components/Navbar';
import { PriceSimulator } from './components/PriceSimulator';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ResilientImage } from './components/ResilientImage';
import { normalizeCalculatorConfig, useFirebase } from './contexts/FirebaseContext';
import { formatPrice, siteConfig } from './config/siteConfig';
import {
  FLORAL_CATALOG,
  HERO_IMAGE,
  SUBSCRIPTION_PLANS,
  WEDDING_IMAGE,
} from './data/catalog';
import {
  INITIAL_CALCULATOR_CONFIG,
  INITIAL_CRM_LEADS,
  INITIAL_CRM_ORDERS,
} from './data/crmSeeds';
import { copy } from './data/translations';
import {
  AppMode,
  CalculatorConfig,
  CartItem,
  CrmLead,
  CurrencyCode,
  FloralProduct,
  InfoModalTopic,
  Language,
  OrderSubmission,
  ProductCategory,
  ServiceScopeId,
  StudioAccessConfig,
  SubscriptionPlan,
  WeddingInquiry,
} from './types/store';

// Load the heavy Studio CRM and shared proposal screens only when they are needed,
// keeping the public storefront bundle small.
const ClientProposalView = lazy(() =>
  import('./components/ClientProposalView').then((m) => ({ default: m.ClientProposalView }))
);
const CrmWorkspace = lazy(() =>
  import('./components/CrmWorkspace').then((m) => ({ default: m.CrmWorkspace }))
);

function LoadingFallback({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C211E] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#E5D5D1] border-t-[#A35047] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#5C615D]">{message}</p>
      </div>
    </div>
  );
}

const STORAGE_CART_KEY = 'bloom_botanica_cart_v1';
const STORAGE_LEADS_KEY = 'bloom_botanica_crm_leads_v1';
const STORAGE_ORDERS_KEY = 'bloom_botanica_crm_orders_v1';
const STORAGE_CALC_DRAFT_KEY = 'bloom_botanica_calc_draft_v1';
const STORAGE_CALC_PUB_KEY = 'bloom_botanica_calc_pub_v1';
const STORAGE_STUDIO_ACCESS_KEY = 'bloom_botanica_studio_access_v1';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('storefront');
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('SGD');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<FloralProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
  const [infoModalTopic, setInfoModalTopic] = useState<InfoModalTopic>(null);

  const [subscriptionSpace, setSubscriptionSpace] = useState<'home' | 'corporate'>('home');
  const [addedSubId, setAddedSubId] = useState<string | null>(null);
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceScopeId>('weddings');

  const [serviceForm, setServiceForm] = useState({
    hostName: '',
    email: '',
    phone: '',
    eventDate: '',
    venue: '',
    scope: 'Weddings',
    budgetTier: 'S$3,500 – S$6,000',
    notes: '',
  });
  const [submittedInquiry, setSubmittedInquiry] = useState<WeddingInquiry | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [crmLeads, setCrmLeads] = useState<CrmLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEADS_KEY);
      return saved ? (JSON.parse(saved) as CrmLead[]) : INITIAL_CRM_LEADS;
    } catch {
      return INITIAL_CRM_LEADS;
    }
  });

  const [crmOrders, setCrmOrders] = useState<OrderSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      return saved ? (JSON.parse(saved) as OrderSubmission[]) : INITIAL_CRM_ORDERS;
    } catch {
      return INITIAL_CRM_ORDERS;
    }
  });

  const [sharedProposalId, setSharedProposalId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('proposal');
    } catch {
      return null;
    }
  });

  const [studioAccess, setStudioAccess] = useState<StudioAccessConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDIO_ACCESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StudioAccessConfig>;
        return {
          restrictToAllowedEmails: Boolean(parsed.restrictToAllowedEmails),
          allowedEmails:
            Array.isArray(parsed.allowedEmails) && parsed.allowedEmails.length > 0
              ? parsed.allowedEmails
              : [siteConfig.studioOwnerEmail],
        };
      }
    } catch {
      // Ignore storage errors
    }
    return {
      restrictToAllowedEmails: false,
      allowedEmails: [siteConfig.studioOwnerEmail],
    };
  });

  const {
    user,
    authReady,
    isSigningIn,
    authError,
    cloudLeads,
    cloudOrders,
    cloudDraft,
    cloudPublished,
    signInWithGoogle,
    signOutStudio,
    createLeadInCloud,
    updateLeadInCloud,
    deleteLeadInCloud,
    createOrderInCloud,
    submitPublicLeadToCloud,
    submitPublicOrderToCloud,
    publishClientProposalInCloud,
    fetchClientProposalFromCloud,
    signClientProposalInCloud,
    saveDraftInCloud,
    publishCalculatorInCloud,
  } = useFirebase();

  const [calculatorDraft, setCalculatorDraft] = useState<CalculatorConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CALC_DRAFT_KEY);
      return saved
        ? normalizeCalculatorConfig(JSON.parse(saved) as Partial<CalculatorConfig>)
        : INITIAL_CALCULATOR_CONFIG;
    } catch {
      return INITIAL_CALCULATOR_CONFIG;
    }
  });

  const [publishedCalculator, setPublishedCalculator] = useState<CalculatorConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CALC_PUB_KEY);
      return saved
        ? normalizeCalculatorConfig(JSON.parse(saved) as Partial<CalculatorConfig>)
        : INITIAL_CALCULATOR_CONFIG;
    } catch {
      return INITIAL_CALCULATOR_CONFIG;
    }
  });

  const activeLeads = cloudLeads ?? crmLeads;
  const activeOrders = cloudOrders ?? crmOrders;
  const activeCalculatorDraft = cloudDraft ?? calculatorDraft;
  const activePublishedCalculator = cloudPublished ?? publishedCalculator;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(crmLeads));
    } catch {
      // Ignore storage quota errors
    }
  }, [crmLeads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(crmOrders));
    } catch {
      // Ignore storage quota errors
    }
  }, [crmOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CALC_DRAFT_KEY, JSON.stringify(calculatorDraft));
    } catch {
      // Ignore storage quota errors
    }
  }, [calculatorDraft]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CALC_PUB_KEY, JSON.stringify(publishedCalculator));
    } catch {
      // Ignore storage quota errors
    }
  }, [publishedCalculator]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STUDIO_ACCESS_KEY, JSON.stringify(studioAccess));
    } catch {
      // Ignore storage quota errors
    }
  }, [studioAccess]);

  const t = copy[language];

  const scrollToElement = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 30);
  };

  const handleNavigateCategory = (cat: ProductCategory) => {
    setAppMode('storefront');
    setActiveCategory(cat);
    scrollToElement('collections');
  };

  const handleNavigateSimulator = () => {
    setAppMode('storefront');
    scrollToElement('simulator');
  };

  const handleNavigateService = (scope: ServiceScopeId) => {
    setAppMode('storefront');
    setActiveServiceTab(scope);
    const tabMatch = t.services.tabs.find((item) => item.id === scope);
    if (tabMatch) {
      setServiceForm((prev) => ({ ...prev, scope: tabMatch.label }));
    }
    scrollToElement('services');
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FLORAL_CATALOG.filter((item) => {
      let matchesCategory = false;
      if (activeCategory === 'all') matchesCategory = true;
      else if (activeCategory === 'sunset-reverie') matchesCategory = Boolean(item.isSunsetReverie);
      else if (activeCategory === 'bespoke') matchesCategory = Boolean(item.isBespoke);
      else if (activeCategory === 'vase') matchesCategory = Boolean(item.isVase);
      else matchesCategory = item.category === activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;
      const haystack = [
        item.nameEn,
        item.nameId,
        item.stemNotesEn,
        item.stemNotesId,
        item.categoryLabelEn,
        item.categoryLabelId,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  const totalBagCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleAddSubscription = (plan: SubscriptionPlan) => {
    const price = subscriptionSpace === 'home' ? plan.homePriceSGD : plan.corporatePriceSGD;
    const spaceLabel =
      subscriptionSpace === 'home' ? t.subscriptions.homeSpace : t.subscriptions.corporateSpace;
    const cadenceLabel = language === 'en' ? plan.cadenceLabelEn : plan.cadenceLabelId;
    const nextTuesday = new Date();
    nextTuesday.setDate(nextTuesday.getDate() + 2);

    const subItem: CartItem = {
      cartItemId: `sub-${plan.id}-${subscriptionSpace}-${Date.now()}`,
      productId: `subscription-${plan.id}`,
      name: `${cadenceLabel} · ${spaceLabel}`,
      categoryLabel: language === 'en' ? 'Floral Subscription' : 'Langganan Bunga',
      image: HERO_IMAGE,
      sizeId: 'classic',
      sizeLabel: `${plan.deliveriesPerMonth} ${t.subscriptions.deliveriesLabel}`,
      palette: language === 'en' ? "Florist's Seasonal Choice" : 'Pilihan Musiman Studio',
      deliveryDate: nextTuesday.toISOString().split('T')[0],
      cardMessage: '',
      unitPriceSGD: price,
      quantity: 1,
      isSubscription: true,
    };

    setCartItems((prev) => [...prev, subItem]);
    setAddedSubId(plan.id);
    setTimeout(() => setAddedSubId(null), 2000);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleCreateCrmLead = (lead: CrmLead) => {
    setCrmLeads((prev) => [lead, ...prev]);
    if (user) {
      void createLeadInCloud(lead);
    } else {
      void submitPublicLeadToCloud(lead);
    }
  };

  const handleUpdateCrmLead = (updated: CrmLead) => {
    setCrmLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (user) {
      void updateLeadInCloud(updated);
    }
  };

  const handleDeleteCrmLead = (leadId: string) => {
    setCrmLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (user) {
      void deleteLeadInCloud(leadId);
    }
  };

  const handleServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const refCode = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: WeddingInquiry = {
      referenceId: refCode,
      ...serviceForm,
      submittedAt: new Date().toISOString(),
    };

    const budgetEstimateMap: Record<string, number> = {
      'S$500 – S$1,500': 1000,
      'S$1,500 – S$3,500': 2500,
      'S$3,500 – S$6,000': 4500,
      'S$6,000+': 7500,
    };
    const estValue = budgetEstimateMap[serviceForm.budgetTier] || 2000;

    const crmRecord: CrmLead = {
      id: `lead-${Date.now()}`,
      referenceCode: refCode,
      source: 'service-form',
      stage: 'lead',
      clientName: serviceForm.hostName,
      clientEmail: serviceForm.email,
      clientPhone: serviceForm.phone,
      eventTitle: `${serviceForm.scope} — ${serviceForm.venue}`,
      eventDate: serviceForm.eventDate,
      venue: serviceForm.venue,
      palette: "Florist's Seasonal Choice",
      estimatedTotalSGD: estValue,
      depositPaidSGD: 0,
      stemCounts: {
        'garden-rose': 20,
        ranunculus: 16,
        eucalyptus: 20,
      },
      lineItems: [
        {
          id: `li-srv-${Date.now()}`,
          title: `${serviceForm.scope} Floral Package`,
          description: serviceForm.notes || `Budget tier: ${serviceForm.budgetTier}`,
          quantity: 1,
          unitPriceSGD: estValue,
        },
      ],
      studioNotes: serviceForm.notes || `Submitted via Services (${serviceForm.budgetTier}).`,
      createdAt: new Date().toISOString(),
    };

    handleCreateCrmLead(crmRecord);

    if (siteConfig.webhookEndpoint) {
      try {
        await fetch(siteConfig.webhookEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'service_inquiry', data: record }),
        });
      } catch {
        // Store locally cleanly
      }
    }
    setSubmittedInquiry(record);
  };

  const categoryTabs: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: t.catalog.allTab },
    { id: 'sunset-reverie', label: t.catalog.sunsetTab },
    { id: 'bouquets', label: t.catalog.bouquetsTab },
    { id: 'bloomboxes', label: t.catalog.bloomboxesTab },
    { id: 'table-vase', label: t.catalog.vaseTab },
    { id: 'preserved', label: t.catalog.preservedTab },
  ];

  const activeServiceInfo =
    t.services.tabs.find((item) => item.id === activeServiceTab) || t.services.tabs[2];

  if (sharedProposalId) {
    return (
      <Suspense
        fallback={
          <LoadingFallback
            message={language === 'id' ? 'Memuat proposal...' : 'Loading proposal...'}
          />
        }
      >
        <ClientProposalView
          proposalId={sharedProposalId}
          language={language}
          currency={currency}
          localLeads={activeLeads}
          onSetLanguage={setLanguage}
          onSetCurrency={setCurrency}
          onFetchProposalFromCloud={fetchClientProposalFromCloud}
          onSignProposalInCloud={signClientProposalInCloud}
          onSignLocalLead={(leadId, signatureName) => {
            const signedAt = new Date().toISOString();
            setCrmLeads((prev) =>
              prev.map((l) =>
                l.id === leadId
                  ? {
                      ...l,
                      stage: 'contract-signed',
                      contractSignedBy: signatureName,
                      contractSignedAt: signedAt,
                    }
                  : l
              )
            );
          }}
          onReturnToStorefront={() => {
            setSharedProposalId(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('proposal');
              window.history.replaceState({}, '', url.pathname + url.search);
            } catch {
              // Ignore history state errors
            }
          }}
        />
      </Suspense>
    );
  }

  const isEmailAuthorizedForStudio = (() => {
    if (!user) return false;
    if (!studioAccess.restrictToAllowedEmails) return true;
    const email = (user.email || '').toLowerCase();
    if (!email) return false;
    if (email === siteConfig.studioOwnerEmail.toLowerCase()) return true;
    return studioAccess.allowedEmails.some((allowed) => allowed.toLowerCase() === email);
  })();

  if (appMode === 'crm') {
    if (!authReady) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#1C211E] flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#E5D5D1] border-t-[#A35047] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5C615D]">
              {language === 'id' ? 'Memuat sesi Studio CRM...' : 'Loading Studio CRM session...'}
            </p>
          </div>
        </div>
      );
    }

    if (!user || !isEmailAuthorizedForStudio) {
      return (
        <CrmLoginScreen
          language={language}
          isSigningIn={isSigningIn}
          authError={authError}
          unauthorizedEmail={user && !isEmailAuthorizedForStudio ? user.email || 'Unknown' : null}
          onSetLanguage={setLanguage}
          onSignInWithGoogle={signInWithGoogle}
          onSignOut={signOutStudio}
          onBackToStorefront={() => setAppMode('storefront')}
        />
      );
    }

    return (
      <Suspense
        fallback={
          <LoadingFallback
            message={language === 'id' ? 'Memuat Studio CRM...' : 'Loading Studio CRM...'}
          />
        }
      >
        <CrmWorkspace
          language={language}
          currency={currency}
          userEmail={user.email || ''}
          userDisplayName={user.displayName || 'Studio Florist'}
          leads={activeLeads}
          orders={activeOrders}
          calculatorDraft={activeCalculatorDraft}
          studioAccess={studioAccess}
          onUpdateStudioAccess={setStudioAccess}
          onPublishProposalLink={publishClientProposalInCloud}
          onSaveCalculatorDraft={(cfg) => {
            setCalculatorDraft(cfg);
            if (user) void saveDraftInCloud(cfg);
          }}
          onPublishCalculator={(cfg) => {
            setCalculatorDraft(cfg);
            setPublishedCalculator(cfg);
            if (user) void publishCalculatorInCloud(cfg);
          }}
          onSetLanguage={setLanguage}
          onSetCurrency={setCurrency}
          onBackToStorefront={() => setAppMode('storefront')}
          onSignOut={() => {
            void signOutStudio();
          }}
          onCreateLead={handleCreateCrmLead}
          onUpdateLead={handleUpdateCrmLead}
          onDeleteLead={handleDeleteCrmLead}
        />
      </Suspense>
    );
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#1C211E]">
      <Navbar
        language={language}
        cartCount={totalBagCount}
        crmLeadCount={activeLeads.length}
        isCrmAuthenticated={Boolean(user && isEmailAuthorizedForStudio)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCrm={() => setAppMode('crm')}
        onSelectCategory={handleNavigateCategory}
        onOpenSimulator={handleNavigateSimulator}
        onSelectService={handleNavigateService}
        onOpenInfoModal={(topic) => setInfoModalTopic(topic)}
      />

      <main className="flex-1">
        {/* 1. Storefront Hero */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-14 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center py-2 lg:py-6">
              <p className="text-xs tracking-wide text-[#5C615D] mb-4">{t.hero.kicker}</p>
              <h1
                className="font-serif font-normal text-[#1C211E] leading-[1.08] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)', textWrap: 'balance' }}
              >
                {t.hero.headline}
              </h1>
              <p className="text-base text-[#4D544F] leading-relaxed mb-8 max-w-lg">
                {t.hero.subcopy}
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <a
                  href="#collections"
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-white bg-[#A35047] hover:bg-[#8E433B] transition-colors duration-150 rounded-sm whitespace-nowrap min-h-[44px]"
                >
                  <span>{t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="#simulator"
                  className="text-sm font-medium text-[#1C211E] hover:text-[#A35047] underline underline-offset-4 transition-colors whitespace-nowrap py-2"
                >
                  {t.hero.secondaryCta}
                </a>
                <button
                  type="button"
                  onClick={() => setAppMode('crm')}
                  className="text-sm font-medium text-[#2D3B32] hover:text-[#1C211E] underline underline-offset-4 transition-colors whitespace-nowrap py-2 cursor-pointer"
                >
                  {t.hero.crmCta}
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[340px] bg-[#EFECE6] border border-[#E5E1D8] rounded-sm overflow-hidden">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Sculptural seasonal arrangement with ivory garden roses and sweet peas in stoneware"
                  fallbackTitle={siteConfig.brandName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E1D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {t.hero.promises.map((promise) => (
              <div key={promise.index} className="space-y-1">
                <div className="text-xs font-medium text-[#5C615D] tabular-nums">
                  {promise.index}
                </div>
                <h2 className="font-serif text-lg text-[#1C211E]">{promise.title}</h2>
                <p className="text-xs text-[#4D544F] leading-relaxed">{promise.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Shop Collections */}
        <section
          id="collections"
          className="border-t border-[#E5E1D8] bg-white py-16 lg:py-20"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="max-w-xl">
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1C211E] mb-2">
                  {t.catalog.heading}
                </h2>
                <p className="text-sm text-[#4D544F] leading-relaxed">{t.catalog.subheading}</p>
              </div>

              <div className="relative w-full lg:w-64 shrink-0">
                <Search
                  className="w-4 h-4 text-[#8A8F8B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.catalog.searchPlaceholder}
                  aria-label={t.catalog.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm text-[#1C211E] placeholder:text-[#8A8F8B] focus:outline-none focus:border-[#2D3B32]"
                />
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Floral categories"
              className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2F0EC] rounded-sm w-fit mb-10"
            >
              {categoryTabs.map((tab) => {
                const active = tab.id === activeCategory;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#1C211E] shadow-xs'
                        : 'text-[#5C615D] hover:text-[#1C211E]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center border border-[#E5E1D8] bg-[#F9F8F6] rounded-sm">
                <p className="text-sm text-[#4D544F] mb-4">{t.catalog.emptyState}</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 text-xs font-medium text-white bg-[#2D3B32] rounded-sm cursor-pointer"
                >
                  {t.catalog.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const name = language === 'en' ? product.nameEn : product.nameId;
                  const categoryLabel =
                    language === 'en' ? product.categoryLabelEn : product.categoryLabelId;
                  const freshnessLabel =
                    language === 'en' ? product.freshnessLabelEn : product.freshnessLabelId;

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden cursor-pointer text-left"
                      >
                        <ResilientImage
                          src={product.image}
                          alt={product.imageAlt}
                          fallbackTitle={name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      </button>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#5C615D] mb-1.5">
                            <span>{categoryLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{freshnessLabel}</span>
                          </div>
                          <h3 className="font-serif text-xl text-[#1C211E] leading-snug">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(product)}
                              className="text-left hover:underline underline-offset-4 cursor-pointer"
                            >
                              {name}
                            </button>
                          </h3>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#E5E1D8]">
                          <span className="text-sm font-medium text-[#1C211E] tabular-nums">
                            {formatPrice(product.basePriceSGD, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="px-4 py-2 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:border-[#A35047] hover:bg-[#A35047] hover:text-white transition-colors duration-150 rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.catalog.selectAction}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 3. Custom Price Simulator (Pre-Inquiry Estimator -> CRM Lead) */}
        <PriceSimulator
          language={language}
          currency={currency}
          publishedCalculator={activePublishedCalculator}
          onAddToCart={handleAddToCart}
          onSendEstimateToCrm={handleCreateCrmLead}
          onOpenCrm={() => setAppMode('crm')}
        />

        {/* 4. Floral Subscriptions */}
        <section id="subscriptions" className="border-t border-[#E5E1D8] bg-white py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="max-w-xl">
                <p className="text-xs tracking-wide text-[#5C615D] mb-2">
                  {t.subscriptions.kicker}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1C211E] mb-3">
                  {t.subscriptions.heading}
                </h2>
                <p className="text-sm text-[#4D544F] leading-relaxed">
                  {t.subscriptions.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 bg-[#F2F0EC] rounded-sm w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => setSubscriptionSpace('home')}
                  className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                    subscriptionSpace === 'home'
                      ? 'bg-white text-[#1C211E] shadow-xs'
                      : 'text-[#5C615D] hover:text-[#1C211E]'
                  }`}
                >
                  {t.subscriptions.homeSpace}
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriptionSpace('corporate')}
                  className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                    subscriptionSpace === 'corporate'
                      ? 'bg-white text-[#1C211E] shadow-xs'
                      : 'text-[#5C615D] hover:text-[#1C211E]'
                  }`}
                >
                  {t.subscriptions.corporateSpace}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const cadenceLabel =
                  language === 'en' ? plan.cadenceLabelEn : plan.cadenceLabelId;
                const summary = language === 'en' ? plan.summaryEn : plan.summaryId;
                const priceSGD =
                  subscriptionSpace === 'home' ? plan.homePriceSGD : plan.corporatePriceSGD;
                const isJustAdded = addedSubId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className="p-6 bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm flex flex-col justify-between gap-6"
                  >
                    <div>
                      <div className="text-xs text-[#5C615D] tabular-nums mb-1">
                        {plan.deliveriesPerMonth} {t.subscriptions.deliveriesLabel}
                      </div>
                      <h3 className="font-serif text-2xl text-[#1C211E] mb-3">{cadenceLabel}</h3>
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-2xl font-medium text-[#1C211E] tabular-nums">
                          {formatPrice(priceSGD, currency)}
                        </span>
                        <span className="text-xs text-[#5C615D]">/ {t.subscriptions.perMonth}</span>
                      </div>
                      <p className="text-sm text-[#4D544F] leading-relaxed">{summary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSubscription(plan)}
                      className={`w-full py-2.5 px-4 text-xs font-medium rounded-sm transition-colors min-h-[40px] cursor-pointer ${
                        isJustAdded
                          ? 'bg-[#2D3B32] text-white'
                          : 'bg-white text-[#1C211E] border border-[#DCD7CE] hover:bg-[#2D3B32] hover:text-white hover:border-[#2D3B32]'
                      }`}
                    >
                      {isJustAdded ? t.subscriptions.addedFeedback : t.subscriptions.addPlan}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Services (Auto-feeds into CRM Pipeline) */}
        <section id="services" className="border-t border-[#E5E1D8] bg-[#F9F8F6] py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs tracking-wide text-[#5C615D] mb-2">
                    {t.services.kicker}
                  </p>
                  <h2
                    className="font-serif text-3xl sm:text-4xl text-[#1C211E] leading-tight mb-4"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.services.heading}
                  </h2>
                  <p className="text-sm text-[#4D544F] leading-relaxed mb-6">
                    {t.services.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 p-1 bg-[#EAE6DF] rounded-sm mb-4">
                    {t.services.tabs.map((tab) => {
                      const active = tab.id === activeServiceTab;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveServiceTab(tab.id);
                            setServiceForm((f) => ({ ...f, scope: tab.label }));
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-white text-[#1C211E] shadow-xs'
                              : 'text-[#5C615D] hover:text-[#1C211E]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-sm text-[#1C211E] p-4 bg-white border border-[#E5E1D8] rounded-sm">
                    {activeServiceInfo.detail}
                  </p>
                </div>

                <div className="aspect-[4/3] bg-[#EFECE6] border border-[#E5E1D8] rounded-sm overflow-hidden">
                  <ResilientImage
                    src={WEDDING_IMAGE}
                    alt="Sunlit conservatory wedding reception table with organic white garden roses and taper candles"
                    fallbackTitle={t.services.heading}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-white border border-[#E5E1D8] rounded-sm p-6 sm:p-8 flex flex-col justify-center">
                {submittedInquiry ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 text-[#2D3B32]">
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      <h3 className="font-serif text-2xl text-[#1C211E]">
                        {t.services.confirmedTitle}
                      </h3>
                    </div>
                    <p className="text-sm text-[#4D544F] leading-relaxed">
                      {t.services.confirmedDesc}
                    </p>
                    <div className="p-4 bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm text-xs space-y-1.5 text-[#4D544F]">
                      <div>
                        <span className="font-medium text-[#1C211E]">Reference:</span>{' '}
                        <span className="tabular-nums">{submittedInquiry.referenceId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-[#1C211E]">Host:</span>{' '}
                        {submittedInquiry.hostName}
                      </div>
                      <div>
                        <span className="font-medium text-[#1C211E]">Date &amp; Venue:</span>{' '}
                        {submittedInquiry.eventDate} · {submittedInquiry.venue}
                      </div>
                      <div>
                        <span className="font-medium text-[#1C211E]">Service:</span>{' '}
                        {submittedInquiry.scope}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setAppMode('crm')}
                        className="px-5 py-2.5 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
                      >
                        {t.hero.crmCta}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmittedInquiry(null)}
                        className="px-5 py-2.5 text-xs font-medium text-[#1C211E] bg-[#F9F8F6] border border-[#DCD7CE] hover:bg-[#EFECE6] rounded-sm cursor-pointer"
                      >
                        {t.services.newInquiryBtn}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <h3 className="font-serif text-2xl text-[#1C211E] mb-2">
                      {t.services.formTitle}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.nameLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={serviceForm.hostName}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, hostName: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.phoneLabel} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={serviceForm.phone}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, phone: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.emailLabel} *
                        </label>
                        <input
                          type="email"
                          required
                          value={serviceForm.email}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, email: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.dateLabel} *
                        </label>
                        <input
                          type="date"
                          required
                          value={serviceForm.eventDate}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, eventDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1C211E] mb-1">
                        {t.services.venueLabel} *
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceForm.venue}
                        onChange={(e) =>
                          setServiceForm((f) => ({ ...f, venue: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.scopeLabel}
                        </label>
                        <select
                          value={serviceForm.scope}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, scope: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        >
                          {t.services.tabs.map((tab) => (
                            <option key={tab.id} value={tab.label}>
                              {tab.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1C211E] mb-1">
                          {t.services.budgetLabel}
                        </label>
                        <select
                          value={serviceForm.budgetTier}
                          onChange={(e) =>
                            setServiceForm((f) => ({ ...f, budgetTier: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                        >
                          <option>S$500 – S$1,500</option>
                          <option>S$1,500 – S$3,500</option>
                          <option>S$3,500 – S$6,000</option>
                          <option>S$6,000+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1C211E] mb-1">
                        {t.services.notesLabel}
                      </label>
                      <textarea
                        rows={3}
                        value={serviceForm.notes}
                        onChange={(e) =>
                          setServiceForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 text-sm font-medium text-white bg-[#A35047] hover:bg-[#8E433B] transition-colors rounded-sm cursor-pointer min-h-[44px]"
                    >
                      {t.services.submitBtn}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 6. About Us & Adjacent Proof */}
        <section id="atelier" className="border-t border-[#E5E1D8] bg-white py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs tracking-wide text-[#5C615D]">{t.atelier.kicker}</p>
              <h2
                className="font-serif text-3xl text-[#1C211E] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {t.atelier.heading}
              </h2>
              <p className="text-sm text-[#4D544F] leading-relaxed max-w-xl">
                {t.atelier.story}
              </p>
              <button
                type="button"
                onClick={() => setInfoModalTopic('blogs')}
                className="text-xs font-medium text-[#A35047] underline underline-offset-4 hover:text-[#1C211E] cursor-pointer"
              >
                {t.atelier.readJournalBtn}
              </button>
            </div>

            <div className="lg:col-span-6 bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm p-6 sm:p-8">
              <blockquote className="font-serif italic text-xl text-[#1C211E] leading-relaxed mb-4">
                {t.atelier.quote}
              </blockquote>
              <div className="text-xs text-[#5C615D]">
                <span className="font-medium text-[#1C211E]">{t.atelier.quoteAuthor}</span>
                <span aria-hidden="true"> · </span>
                <span>{t.atelier.quoteRole}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Studio Footer */}
      <footer className="border-t border-[#E5E1D8] bg-[#FAF9F6] py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#ECE8E1] text-sm">
            <div>
              <div className="font-serif text-2xl text-[#1C211E] mb-2">
                {siteConfig.brandName}
              </div>
              <p className="text-xs text-[#5C615D] leading-relaxed mb-3">
                {siteConfig.studioAddress}
              </p>
              <button
                type="button"
                onClick={() => setAppMode('crm')}
                className="text-xs font-medium text-[#2D3B32] underline underline-offset-4 hover:text-[#1C211E] cursor-pointer"
              >
                {t.hero.crmCta}
              </button>
            </div>

            <div>
              <h3 className="text-xs font-medium text-[#1C211E] mb-2">
                {t.footer.studioHoursLabel}
              </h3>
              <p className="text-xs text-[#5C615D] leading-relaxed mb-3">
                {language === 'en' ? siteConfig.studioHoursEn : siteConfig.studioHoursId}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5C615D]">
                <button
                  type="button"
                  onClick={() => setInfoModalTopic('faq')}
                  className="hover:text-[#1C211E] underline underline-offset-4 cursor-pointer"
                >
                  {t.nav.contactMenu.faq}
                </button>
                <button
                  type="button"
                  onClick={() => setInfoModalTopic('returns')}
                  className="hover:text-[#1C211E] underline underline-offset-4 cursor-pointer"
                >
                  {t.nav.contactMenu.returns}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-[#1C211E] mb-2">
                {t.footer.contactLabel}
              </h3>
              <p className="text-xs text-[#5C615D] leading-relaxed">{siteConfig.contactEmail}</p>
              <p className="text-xs text-[#5C615D] tabular-nums mt-0.5">
                {siteConfig.phoneDisplay}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-[#1C211E] mb-1.5">
                  {t.footer.languageLabel} &amp; {t.footer.currencyLabel}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex border border-[#DCD7CE] rounded-sm overflow-hidden">
                    {(['en', 'id'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-2.5 py-1 text-xs font-medium uppercase cursor-pointer ${
                          language === lang
                            ? 'bg-[#A35047] text-white'
                            : 'bg-white text-[#5C615D] hover:text-[#1C211E]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex border border-[#DCD7CE] rounded-sm overflow-hidden">
                    {(['SGD', 'IDR', 'USD'] as CurrencyCode[]).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrency(curr)}
                        className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                          currency === curr
                            ? 'bg-[#2D3B32] text-white'
                            : 'bg-white text-[#5C615D] hover:text-[#1C211E]'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIntegrationOpen(true)}
                className="text-xs text-[#2D3B32] underline underline-offset-4 hover:text-[#1C211E] cursor-pointer"
              >
                {t.footer.integrationBtn}
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C615D]">
            <span>
              © {new Date().getFullYear()} {siteConfig.brandName}. {t.footer.copyright}
            </span>
            <span>{siteConfig.locationLabel}</span>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selectedProduct}
        language={language}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        language={language}
        currency={currency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderCompleted={(order) => {
          setCrmOrders((prev) => [order, ...prev]);
          if (user) {
            void createOrderInCloud(order);
          } else {
            void submitPublicOrderToCloud(order);
          }
        }}
      />

      <InfoDrawerModal
        topic={infoModalTopic}
        language={language}
        onClose={() => setInfoModalTopic(null)}
      />

      <IntegrationModal
        isOpen={isIntegrationOpen}
        language={language}
        onClose={() => setIsIntegrationOpen(false)}
      />
    </div>
  );
}
