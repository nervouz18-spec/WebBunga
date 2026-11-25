import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatPrice } from '../config/siteConfig';
import { PALETTE_OPTIONS, SIZE_OPTIONS } from '../data/catalog';
import { copy } from '../data/translations';
import { CartItem, CurrencyCode, FloralProduct, Language } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  product: FloralProduct | null;
  language: Language;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

function getDefaultDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

export function ProductDetailModal({
  product,
  language,
  currency,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<'petite' | 'classic' | 'grand'>('classic');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(PALETTE_OPTIONS[0].id);
  const [deliveryDate, setDeliveryDate] = useState<string>(getDefaultDeliveryDate);
  const [cardMessage, setCardMessage] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    setSelectedSizeId('classic');
    setSelectedPaletteId(PALETTE_OPTIONS[0].id);
    setDeliveryDate(getDefaultDeliveryDate());
    setCardMessage('');
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const t = copy[language].modal;
  const activeSize = SIZE_OPTIONS.find((s) => s.id === selectedSizeId) || SIZE_OPTIONS[1];
  const activePalette = PALETTE_OPTIONS.find((p) => p.id === selectedPaletteId) || PALETTE_OPTIONS[0];

  const unitPriceSGD = Math.round(product.basePriceSGD * activeSize.priceMultiplier);
  const name = language === 'en' ? product.nameEn : product.nameId;
  const categoryLabel = language === 'en' ? product.categoryLabelEn : product.categoryLabelId;
  const freshnessLabel = language === 'en' ? product.freshnessLabelEn : product.freshnessLabelId;
  const description = language === 'en' ? product.descriptionEn : product.descriptionId;
  const stemNotes = language === 'en' ? product.stemNotesEn : product.stemNotesId;
  const careGuide = language === 'en' ? product.careGuideEn : product.careGuideId;

  const handleAdd = () => {
    const paletteText = language === 'en' ? activePalette.labelEn : activePalette.labelId;
    const sizeLabel = language === 'en' ? activeSize.labelEn : activeSize.labelId;
    onAddToCart({
      cartItemId: `${product.id}-${selectedSizeId}-${selectedPaletteId}-${deliveryDate}-${Date.now()}`,
      productId: product.id,
      name,
      categoryLabel,
      image: product.image,
      sizeId: activeSize.id,
      sizeLabel: `${sizeLabel} (${activeSize.dimensions})`,
      palette: paletteText,
      deliveryDate,
      cardMessage: cardMessage.trim(),
      unitPriceSGD,
      quantity: 1,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C211E]/55 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Product Image & Botanical Notes */}
        <div className="lg:col-span-6 bg-[#EFECE6] flex flex-col">
          <div className="aspect-[4/3] w-full overflow-hidden bg-[#E8E4DC]">
            <ResilientImage
              src={product.image}
              alt={product.imageAlt}
              fallbackTitle={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-4 border-t border-[#E5E1D8] flex-1">
            <div>
              <h4 className="text-xs font-medium text-[#5C615D] tracking-wide mb-1">
                {t.stemNotes}
              </h4>
              <p className="text-sm text-[#1C211E] leading-relaxed">{stemNotes}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-[#5C615D] tracking-wide mb-1">
                {t.careGuide}
              </h4>
              <p className="text-xs text-[#4D544F] leading-relaxed">{careGuide}</p>
            </div>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="text-xs text-[#5C615D] flex items-center gap-2">
                <span>{categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{freshnessLabel}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="w-10 h-10 -mr-2 -mt-2 inline-flex items-center justify-center text-[#5C615D] hover:text-[#1C211E] hover:bg-[#F2F0EC] rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 id="pdp-title" className="font-serif text-3xl text-[#1C211E] leading-tight mb-2">
              {name}
            </h3>

            <p className="text-xl font-medium text-[#1C211E] tabular-nums mb-4">
              {formatPrice(unitPriceSGD, currency)}
            </p>

            <p className="text-sm text-[#4D544F] leading-relaxed mb-6">{description}</p>

            {/* Size Variant Selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#1C211E] mb-2">
                {t.selectSize}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = size.id === selectedSizeId;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`px-3 py-2.5 text-left border rounded-sm transition-colors cursor-pointer ${
                        active
                          ? 'border-[#2D3B32] bg-[#2D3B32] text-white'
                          : 'border-[#DCD7CE] bg-[#F9F8F6] text-[#1C211E] hover:border-[#8C948E]'
                      }`}
                    >
                      <div className="text-xs font-medium whitespace-nowrap">
                        {language === 'en' ? size.labelEn : size.labelId}
                      </div>
                      <div
                        className={`text-[11px] tabular-nums mt-0.5 ${
                          active ? 'text-[#DCE3DE]' : 'text-[#5C615D]'
                        }`}
                      >
                        {size.dimensions}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colour Direction Selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#1C211E] mb-2">
                {t.selectPalette}
              </label>
              <div className="flex flex-wrap gap-2">
                {PALETTE_OPTIONS.map((palette) => {
                  const active = palette.id === selectedPaletteId;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setSelectedPaletteId(palette.id)}
                      className={`px-3 py-2 text-xs font-medium border rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'border-[#2D3B32] bg-[#F2F0EC] text-[#1C211E]'
                          : 'border-[#DCD7CE] bg-white text-[#5C615D] hover:text-[#1C211E]'
                      }`}
                    >
                      {language === 'en' ? palette.labelEn : palette.labelId}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Date & Gift Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label
                  htmlFor="pdp-delivery-date"
                  className="block text-xs font-medium text-[#1C211E] mb-1.5"
                >
                  {t.deliveryDate}
                </label>
                <input
                  id="pdp-delivery-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#DCD7CE] rounded-sm bg-[#F9F8F6] text-[#1C211E] focus:outline-none focus:border-[#2D3B32]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="pdp-card-message"
                className="block text-xs font-medium text-[#1C211E] mb-1.5"
              >
                {t.cardMessage}
              </label>
              <textarea
                id="pdp-card-message"
                rows={2}
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder={t.cardPlaceholder}
                className="w-full px-3 py-2 text-sm border border-[#DCD7CE] rounded-sm bg-[#F9F8F6] text-[#1C211E] placeholder:text-[#8A8F8B] focus:outline-none focus:border-[#2D3B32] resize-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-3 px-6 text-sm font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] transition-colors duration-150 rounded-sm cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D3B32]"
          >
            {t.addToBag} — <span className="tabular-nums">{formatPrice(unitPriceSGD, currency)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
