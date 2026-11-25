import { ChevronDown, Lock, Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { copy } from '../data/translations';
import {
  InfoModalTopic,
  Language,
  ProductCategory,
  ServiceScopeId,
} from '../types/store';

interface NavbarProps {
  language: Language;
  cartCount: number;
  crmLeadCount: number;
  isCrmAuthenticated: boolean;
  onOpenCart: () => void;
  onOpenCrm: () => void;
  onSelectCategory: (category: ProductCategory) => void;
  onOpenSimulator: () => void;
  onSelectService: (service: ServiceScopeId) => void;
  onOpenInfoModal: (topic: InfoModalTopic) => void;
}

type DropdownKey = 'shop' | 'services' | 'about' | 'contact' | null;

export function Navbar({
  language,
  cartCount,
  crmLeadCount,
  isCrmAuthenticated,
  onOpenCart,
  onOpenCrm,
  onSelectCategory,
  onOpenSimulator,
  onSelectService,
  onOpenInfoModal,
}: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const t = copy[language].nav;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const shopOptions: { label: string; action: () => void }[] = [
    {
      label: t.shopMenu.sunsetReverie,
      action: () => onSelectCategory('sunset-reverie'),
    },
    {
      label: t.shopMenu.allProducts,
      action: () => onSelectCategory('all'),
    },
    {
      label: t.shopMenu.bespoke,
      action: () => onOpenSimulator(),
    },
    {
      label: t.shopMenu.bloomBoxes,
      action: () => onSelectCategory('bloomboxes'),
    },
    {
      label: t.shopMenu.bouquet,
      action: () => onSelectCategory('bouquets'),
    },
    {
      label: t.shopMenu.preserved,
      action: () => onSelectCategory('preserved'),
    },
    {
      label: t.shopMenu.tableArrangements,
      action: () => onSelectCategory('table-vase'),
    },
    {
      label: t.shopMenu.vase,
      action: () => onSelectCategory('vase'),
    },
  ];

  const serviceOptions: { label: string; scope: ServiceScopeId }[] = [
    { label: t.servicesMenu.corporate, scope: 'corporate' },
    { label: t.servicesMenu.events, scope: 'events' },
    { label: t.servicesMenu.weddings, scope: 'weddings' },
    { label: t.servicesMenu.workshops, scope: 'workshops' },
    { label: t.servicesMenu.flowerStand, scope: 'flower-stand' },
  ];

  return (
    <header ref={navRef} className="relative z-40">
      {/* Slim Brand & Bag Top Strip */}
      <div className="bg-[#FAF9F6] border-b border-[#E5E1D8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-serif text-2xl tracking-tight font-medium text-[#1C211E] whitespace-nowrap shrink-0"
          >
            {siteConfig.brandName}
          </a>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenCrm}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:border-[#2D3B32] rounded-sm transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
            >
              {!isCrmAuthenticated && (
                <Lock className="w-3.5 h-3.5 text-[#5C615D]" aria-hidden="true" />
              )}
              <span>
                {isCrmAuthenticated
                  ? t.crm
                  : language === 'id'
                    ? 'Masuk Studio'
                    : 'Studio Login'}
              </span>
              {isCrmAuthenticated && (
                <span className="text-[#5C615D] tabular-nums">({crmLeadCount})</span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] transition-colors duration-150 rounded-sm whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
              <span className="tabular-nums">
                {t.bag} ({cartCount})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[#1C211E] hover:bg-[#EFECE6] rounded-sm transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Terracotta-Rose Dropdown Menu Bar */}
      <nav
        aria-label="Primary"
        className="hidden lg:block bg-[#A35047] text-white border-b border-[#8F433B]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center gap-8 text-sm">
          <a
            href="#top"
            onClick={() => setOpenDropdown(null)}
            className="hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0"
          >
            {t.home}
          </a>

          {/* Shop Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('shop')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('shop')}
              aria-expanded={openDropdown === 'shop'}
              className="inline-flex items-center gap-1.5 hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2"
            >
              <span>{t.shop}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            {openDropdown === 'shop' && (
              <div className="absolute left-0 top-full w-64 bg-[#A35047] border border-[#8F433B] shadow-md rounded-b-sm py-2 z-50">
                {shopOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      opt.action();
                      setOpenDropdown(null);
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="#subscriptions"
            onClick={() => setOpenDropdown(null)}
            className="hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0"
          >
            {t.subscriptions}
          </a>

          <button
            type="button"
            onClick={() => {
              setOpenDropdown(null);
              onOpenSimulator();
            }}
            className="hover:text-[#F7E9E7] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.simulator}
          </button>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('services')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('services')}
              aria-expanded={openDropdown === 'services'}
              className="inline-flex items-center gap-1.5 hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2"
            >
              <span>{t.services}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            {openDropdown === 'services' && (
              <div className="absolute left-0 top-full w-48 bg-[#A35047] border border-[#8F433B] shadow-md rounded-b-sm py-2 z-50">
                {serviceOptions.map((opt) => (
                  <button
                    key={opt.scope}
                    type="button"
                    onClick={() => {
                      onSelectService(opt.scope);
                      setOpenDropdown(null);
                    }}
                    className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About Us Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('about')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('about')}
              aria-expanded={openDropdown === 'about'}
              className="inline-flex items-center gap-1.5 hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2"
            >
              <span>{t.about}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            {openDropdown === 'about' && (
              <div className="absolute left-0 top-full w-44 bg-[#A35047] border border-[#8F433B] shadow-md rounded-b-sm py-2 z-50">
                <a
                  href="#atelier"
                  onClick={() => setOpenDropdown(null)}
                  className="block px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors whitespace-nowrap"
                >
                  {t.aboutMenu.ourStory}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onOpenInfoModal('blogs');
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.aboutMenu.blogs}
                </button>
              </div>
            )}
          </div>

          {/* Contact Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('contact')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('contact')}
              aria-expanded={openDropdown === 'contact'}
              className="inline-flex items-center gap-1.5 hover:text-[#F7E9E7] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2"
            >
              <span>{t.contact}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            {openDropdown === 'contact' && (
              <div className="absolute right-0 top-full w-52 bg-[#A35047] border border-[#8F433B] shadow-md rounded-b-sm py-2 z-50">
                <button
                  type="button"
                  onClick={() => {
                    onSelectService('corporate');
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.contactMenu.enquiries}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenInfoModal('faq');
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.contactMenu.faq}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenInfoModal('returns');
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-5 py-2.5 text-sm text-white hover:bg-[#8E433B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.contactMenu.returns}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile"
          className="lg:hidden bg-[#A35047] text-white px-4 py-4 space-y-3 border-b border-[#8F433B]"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-sm hover:bg-[#8E433B]"
            >
              {t.home}
            </a>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-sm hover:bg-[#8E433B] cursor-pointer"
            >
              {t.shop}
            </button>
            <a
              href="#subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-sm hover:bg-[#8E433B]"
            >
              {t.subscriptions}
            </a>
            <button
              type="button"
              onClick={() => {
                onOpenSimulator();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-sm bg-[#8E433B] font-medium cursor-pointer"
            >
              {t.simulator}
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectService('weddings');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-sm hover:bg-[#8E433B] cursor-pointer"
            >
              {t.services}
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenCrm();
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-left px-3 py-2 rounded-sm bg-[#2D3B32] font-medium cursor-pointer"
            >
              {!isCrmAuthenticated && <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>
                {isCrmAuthenticated
                  ? `${t.crm} (${crmLeadCount})`
                  : language === 'id'
                    ? 'Masuk Studio'
                    : 'Studio Login'}
              </span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
