import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { formatPrice, siteConfig } from '../config/siteConfig';
import {
  PALETTE_OPTIONS,
  SIMULATOR_ADDONS,
  SIMULATOR_FORMATS,
  SIMULATOR_STEMS,
} from '../data/catalog';
import { copy } from '../data/translations';
import {
  CalculatorConfig,
  CalculatorPiece,
  CartItem,
  CrmLead,
  CurrencyCode,
  Language,
} from '../types/store';
import { ResilientImage } from './ResilientImage';

interface PriceSimulatorProps {
  language: Language;
  currency: CurrencyCode;
  publishedCalculator: CalculatorConfig;
  onAddToCart: (item: CartItem) => void;
  onSendEstimateToCrm: (lead: CrmLead) => void;
  onOpenCrm: () => void;
}

const PRESETS: Record<
  string,
  { formatId: string; paletteId: string; stems: Record<string, number> }
> = {
  sunset: {
    formatId: 'bloom-box',
    paletteId: 'sunset-reverie',
    stems: {
      'garden-rose': 4,
      ranunculus: 4,
      lisianthus: 3,
      chamomile: 3,
      eucalyptus: 4,
    },
  },
  ivory: {
    formatId: 'ceramic-vase',
    paletteId: 'signature-ivory',
    stems: {
      'garden-rose': 3,
      delphinium: 4,
      hydrangea: 2,
      eucalyptus: 4,
    },
  },
  peony: {
    formatId: 'hand-tied',
    paletteId: 'blush-garden',
    stems: {
      'dutch-peony': 5,
      'garden-rose': 4,
      chamomile: 3,
      eucalyptus: 3,
    },
  },
};

// Nama piece & grup bawaan dari Studio CRM diterjemahkan untuk tampilan tamu Indonesia.
// ID baru yang ditambahkan studio tetap memakai nama aslinya.
const WEDDING_PIECE_LABELS_ID: Record<string, string> = {
  'piece-bridal-bouquet': 'Buket Pengantin',
  'piece-bridesmaid': 'Buket Bridesmaid',
  'piece-boutonniere': 'Bunga Jas (Boutonniere)',
  'piece-corsage': 'Korsase Pengantin Pria',
  'piece-ceremony-arch': 'Dekorasi Altar / Arch',
  'piece-aisle-meadow': 'Bunga Lorong (Aisle)',
  'piece-centerpiece': 'Bunga Meja (Centerpiece)',
  'piece-bud-vase-trio': 'Bud Vase Meja (3)',
};

const WEDDING_GROUP_LABELS_ID: Record<string, string> = {
  'PERSONAL FLOWERS': 'BUNGA PRIBADI',
  CEREMONY: 'UPACARA / ALTAR',
  RECEPTION: 'RESEPSI / MEJA',
};

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatPublishedMoney(
  amountSGD: number,
  cfg: CalculatorConfig,
  storefrontCurrency: CurrencyCode,
  useStorefrontCurrency: boolean
): string {
  if (useStorefrontCurrency) {
    return formatPrice(amountSGD, storefrontCurrency);
  }
  const sym = cfg.customSymbol.trim() || 'S$';
  const rounded = Math.round(amountSGD);
  const numStr =
    cfg.thousandsSeparator === 'period'
      ? rounded.toLocaleString('de-DE')
      : cfg.thousandsSeparator === 'space'
        ? rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')
        : rounded.toLocaleString('en-US');
  return cfg.symbolPosition === 'before' ? `${sym}${numStr}` : `${numStr} ${sym}`;
}

function formatPieceUnit(
  piece: CalculatorPiece,
  cfg: CalculatorConfig,
  language: Language
): string {
  if (cfg.neverShowEach && (!piece.pricingUnit || piece.pricingUnit === 'each')) {
    return '';
  }
  const id = language === 'id';
  switch (piece.pricingUnit) {
    case 'counted':
      return id ? ' / unit' : ' counted';
    case 'per-guest':
      return id ? ' / tamu' : ' / guest';
    case 'per-foot':
      return ' / ft';
    case 'each':
    default:
      return cfg.neverShowEach ? '' : id ? ' / pcs' : ' each';
  }
}

export function PriceSimulator({
  language,
  currency,
  publishedCalculator,
  onAddToCart,
  onSendEstimateToCrm,
  onOpenCrm,
}: PriceSimulatorProps) {
  const t = copy[language].simulator;
  const theme = publishedCalculator.brandTheme;

  const localizedPieceName = (piece: CalculatorPiece) =>
    language === 'id' ? WEDDING_PIECE_LABELS_ID[piece.id] || piece.name : piece.name;
  const localizedGroupName = (label: string) =>
    language === 'id' ? WEDDING_GROUP_LABELS_ID[label] || label : label;

  const [builderMode, setBuilderMode] = useState<'stems' | 'event-pieces'>('event-pieces');
  const [syncEstimatorCurrency, setSyncEstimatorCurrency] = useState(true);
  const useStorefrontCurrency =
    syncEstimatorCurrency ||
    !publishedCalculator.customSymbol.trim() ||
    publishedCalculator.customSymbol.trim() === 'S$';

  // Event & Wedding Pieces mode (synced directly with CRM Calculator Publisher)
  // Start empty so every visitor begins from a clean slate; presets are opt-in via buttons.
  const [pieceCounts, setPieceCounts] = useState<Record<string, number>>({});
  const [copiedEstimate, setCopiedEstimate] = useState(false);

  // Custom Stem Builder mode
  const [selectedFormatId, setSelectedFormatId] = useState<string>('bloom-box');
  const [stemCounts, setStemCounts] = useState<Record<string, number>>({});
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('sunset-reverie');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['silk-ribbon']);
  const [deliveryDate, setDeliveryDate] = useState<string>(getTomorrow);
  const [cardNote, setCardNote] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalClientName, setProposalClientName] = useState('');
  const [proposalContact, setProposalContact] = useState('');
  const [proposalEventTitle, setProposalEventTitle] = useState('');
  const [proposalVenue, setProposalVenue] = useState('');
  const [crmSuccessRef, setCrmSuccessRef] = useState<string | null>(null);

  const activeFormat =
    SIMULATOR_FORMATS.find((f) => f.id === selectedFormatId) || SIMULATOR_FORMATS[0];

  const activePalette =
    PALETTE_OPTIONS.find((p) => p.id === selectedPaletteId) || PALETTE_OPTIONS[0];

  const groupedPieces = useMemo(() => {
    const groups: { label: string; items: CalculatorPiece[] }[] = [];
    publishedCalculator.pieces
      .filter((p) => p.enabled)
      .forEach((piece) => {
        let grp = groups.find((g) => g.label === piece.groupLabel);
        if (!grp) {
          grp = { label: piece.groupLabel, items: [] };
          groups.push(grp);
        }
        grp.items.push(piece);
      });
    return groups;
  }, [publishedCalculator.pieces]);

  const piecesEstimate = useMemo(() => {
    let subtotalMin = 0;
    let subtotalMax = 0;
    let feeMin = 0;
    let feeMax = 0;
    let totalQty = 0;
    const feeRate = Math.max(0, publishedCalculator.feePercent || 0) / 100;

    const rows = publishedCalculator.pieces
      .filter((p) => p.enabled && (pieceCounts[p.id] || 0) > 0)
      .map((p) => {
        const qty = pieceCounts[p.id] || 0;
        totalQty += qty;
        const rowMin = qty * p.minPrice;
        const rowMax = qty * p.maxPrice;
        subtotalMin += rowMin;
        subtotalMax += rowMax;
        if (!p.noFee && feeRate > 0) {
          feeMin += rowMin * feeRate;
          feeMax += rowMax * feeRate;
        }
        return { ...p, qty, rowMin, rowMax };
      });

    const min = Math.round(subtotalMin + feeMin);
    const max = Math.round(subtotalMax + feeMax);
    const hasRentals = rows.some((r) => publishedCalculator.rentalSections.includes(r.groupLabel));
    const belowMinimum =
      publishedCalculator.minimumProjectSGD > 0 && max < publishedCalculator.minimumProjectSGD;

    return {
      rows,
      subtotalMin: Math.round(subtotalMin),
      subtotalMax: Math.round(subtotalMax),
      feeMin: Math.round(feeMin),
      feeMax: Math.round(feeMax),
      min,
      max,
      totalQty,
      hasRentals,
      belowMinimum,
    };
  }, [publishedCalculator, pieceCounts]);

  const updateStem = (stemId: string, delta: number) => {
    setStemCounts((prev) => {
      const nextCount = Math.max(0, Math.min(40, (prev[stemId] || 0) + delta));
      const updated = { ...prev };
      if (nextCount === 0) {
        delete updated[stemId];
      } else {
        updated[stemId] = nextCount;
      }
      return updated;
    });
  };

  const applyPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    setSelectedFormatId(preset.formatId);
    setSelectedPaletteId(preset.paletteId);
    setStemCounts({ ...preset.stems });
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const breakdown = useMemo(() => {
    const stemRows = SIMULATOR_STEMS.filter((stem) => (stemCounts[stem.id] || 0) > 0).map(
      (stem) => {
        const count = stemCounts[stem.id] || 0;
        return {
          ...stem,
          count,
          lineTotalSGD: count * stem.pricePerStemSGD,
        };
      }
    );

    const totalStems = stemRows.reduce((sum, r) => sum + r.count, 0);
    const stemsCostSGD = stemRows.reduce((sum, r) => sum + r.lineTotalSGD, 0);

    const addonRows = SIMULATOR_ADDONS.filter((a) => selectedAddons.includes(a.id));
    const addonsCostSGD = addonRows.reduce((sum, a) => sum + a.priceSGD, 0);

    const totalSGD = activeFormat.baseFeeSGD + stemsCostSGD + addonsCostSGD;

    let sizeId: 'petite' | 'classic' | 'grand' = 'classic';
    let scaleLabel = language === 'en' ? 'Classic Proportion' : 'Proporsi Klasik';
    if (totalStems <= 10) {
      sizeId = 'petite';
      scaleLabel = language === 'en' ? 'Petite Proportion' : 'Proporsi Petite';
    } else if (totalStems >= 20) {
      sizeId = 'grand';
      scaleLabel = language === 'en' ? 'Grand Atelier Scale' : 'Skala Grand Atelier';
    }

    return {
      stemRows,
      totalStems,
      stemsCostSGD,
      addonRows,
      addonsCostSGD,
      totalSGD,
      sizeId,
      scaleLabel,
    };
  }, [stemCounts, selectedAddons, activeFormat, language]);

  const canOrderStems = breakdown.totalStems >= 3;
  const canSubmitEventPieces =
    piecesEstimate.totalQty >= 1 &&
    !(publishedCalculator.blockBelowMinimum && piecesEstimate.belowMinimum);

  const buildEventEstimateText = () => {
    const fmt = (val: number) =>
      formatPublishedMoney(val, publishedCalculator, currency, useStorefrontCurrency);
    const lines = [
      `${siteConfig.brandName} — Floral Event Estimate (${useStorefrontCurrency ? currency : publishedCalculator.customSymbol || 'SGD'})`,
      `${publishedCalculator.title} ${publishedCalculator.titleItalic}`,
      '',
      ...piecesEstimate.rows.map(
        (r) =>
          `- ${r.qty}x ${localizedPieceName(r)}: ${
            r.rowMin === r.rowMax ? fmt(r.rowMin) : `${fmt(r.rowMin)} – ${fmt(r.rowMax)}`
          }`
      ),
      '',
      `${publishedCalculator.subtotalLabel}: ${
        piecesEstimate.subtotalMin === piecesEstimate.subtotalMax
          ? fmt(piecesEstimate.subtotalMin)
          : `${fmt(piecesEstimate.subtotalMin)} – ${fmt(piecesEstimate.subtotalMax)}`
      }`,
      ...(!publishedCalculator.hideFeeLine && piecesEstimate.feeMax > 0
        ? [
            `${publishedCalculator.feeLabel} (${publishedCalculator.feePercent}%): ${
              piecesEstimate.feeMin === piecesEstimate.feeMax
                ? fmt(piecesEstimate.feeMin)
                : `${fmt(piecesEstimate.feeMin)} – ${fmt(piecesEstimate.feeMax)}`
            }`,
          ]
        : []),
      `${publishedCalculator.totalLabel}: ${
        piecesEstimate.min === piecesEstimate.max
          ? fmt(piecesEstimate.min)
          : `${fmt(piecesEstimate.min)} – ${fmt(piecesEstimate.max)}`
      }`,
    ];
    return lines.join('\n');
  };

  const handleCopyEventEstimate = async () => {
    try {
      await navigator.clipboard.writeText(buildEventEstimateText());
      setCopiedEstimate(true);
      setTimeout(() => setCopiedEstimate(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadEventSummary = () => {
    const text = buildEventEstimateText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'floral-estimate-summary.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddSimulatedToBag = () => {
    if (!canOrderStems) return;
    const formatName = language === 'en' ? activeFormat.nameEn : activeFormat.nameId;
    const paletteName = language === 'en' ? activePalette.labelEn : activePalette.labelId;
    const stemSummary = breakdown.stemRows
      .map((s) => `${s.count}x ${language === 'en' ? s.nameEn : s.nameId}`)
      .join(', ');
    const addonSummary = breakdown.addonRows
      .map((a) => (language === 'en' ? a.nameEn : a.nameId))
      .join(', ');

    const combinedNote = [
      cardNote.trim(),
      `Stems: ${stemSummary}`,
      addonSummary ? `Add-ons: ${addonSummary}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const item: CartItem = {
      cartItemId: `sim-${activeFormat.id}-${Date.now()}`,
      productId: `custom-${activeFormat.id}`,
      name: `Custom ${formatName}`,
      categoryLabel: language === 'en' ? 'Price Simulator Custom' : 'Rangkaian Custom Simulasi',
      image: activeFormat.image,
      sizeId: breakdown.sizeId,
      sizeLabel: `${breakdown.totalStems} ${language === 'en' ? 'stems' : 'tangkai'}`,
      palette: paletteName,
      deliveryDate,
      cardMessage: combinedNote,
      unitPriceSGD: breakdown.totalSGD,
      quantity: 1,
    };

    onAddToCart(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleSubmitEstimateToCrm = (e: FormEvent) => {
    e.preventDefault();
    const referenceCode = `FL-${Math.floor(2405 + Math.random() * 7000)}`;
    const isEmail = proposalContact.includes('@');

    if (builderMode === 'event-pieces') {
      if (!canSubmitEventPieces) return;
      const midpoint = Math.round((piecesEstimate.min + piecesEstimate.max) / 2);
      const newLead: CrmLead = {
        id: `lead-${Date.now()}`,
        referenceCode,
        source: 'simulator',
        stage: 'estimate',
        clientName: proposalClientName.trim(),
        clientEmail: isEmail ? proposalContact.trim() : 'concierge@client.local',
        clientPhone: isEmail ? '-' : proposalContact.trim(),
        eventTitle: proposalEventTitle.trim() || 'Wedding / Event Floral Estimate',
        eventDate: deliveryDate,
        venue: proposalVenue.trim() || 'TBD',
        palette: language === 'en' ? activePalette.labelEn : activePalette.labelId,
        estimatedTotalSGD: midpoint,
        depositPaidSGD: 0,
        stemCounts: {
          'garden-rose': piecesEstimate.totalQty * 6,
          ranunculus: piecesEstimate.totalQty * 4,
          eucalyptus: piecesEstimate.totalQty * 5,
        },
        lineItems: [
          ...piecesEstimate.rows.map((r) => ({
            id: `li-ep-${r.id}-${Date.now()}`,
            title: localizedPieceName(r),
            description: `${localizedGroupName(r.groupLabel)} (${formatPublishedMoney(r.minPrice, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(r.maxPrice, publishedCalculator, currency, useStorefrontCurrency)})`,
            quantity: r.qty,
            unitPriceSGD: Math.round((r.minPrice + r.maxPrice) / 2),
          })),
          ...(piecesEstimate.feeMax > 0
            ? [
                {
                  id: `li-fee-${Date.now()}`,
                  title: publishedCalculator.feeLabel,
                  description: `${publishedCalculator.feePercent}% design, delivery & setup`,
                  quantity: 1,
                  unitPriceSGD: Math.round((piecesEstimate.feeMin + piecesEstimate.feeMax) / 2),
                },
              ]
            : []),
        ],
        studioNotes: `Submitted from Published Event Estimator (${formatPublishedMoney(piecesEstimate.min, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(piecesEstimate.max, publishedCalculator, currency, useStorefrontCurrency)}).`,
        createdAt: new Date().toISOString(),
      };
      onSendEstimateToCrm(newLead);
    } else {
      if (!canOrderStems) return;
      const formatName = language === 'en' ? activeFormat.nameEn : activeFormat.nameId;
      const paletteName = language === 'en' ? activePalette.labelEn : activePalette.labelId;
      const stemSummary = breakdown.stemRows
        .map((s) => `${s.count}x ${language === 'en' ? s.nameEn : s.nameId}`)
        .join(', ');

      const newLead: CrmLead = {
        id: `lead-${Date.now()}`,
        referenceCode,
        source: 'simulator',
        stage: 'estimate',
        clientName: proposalClientName.trim(),
        clientEmail: isEmail ? proposalContact.trim() : 'concierge@client.local',
        clientPhone: isEmail ? '-' : proposalContact.trim(),
        eventTitle: proposalEventTitle.trim() || `Custom ${formatName}`,
        eventDate: deliveryDate,
        venue: proposalVenue.trim() || 'Private Delivery',
        palette: paletteName,
        estimatedTotalSGD: breakdown.totalSGD,
        depositPaidSGD: 0,
        stemCounts: { ...stemCounts },
        lineItems: [
          {
            id: `li-fmt-${Date.now()}`,
            title: `${formatName} (${breakdown.totalStems} stems)`,
            description: stemSummary,
            quantity: 1,
            unitPriceSGD: activeFormat.baseFeeSGD + breakdown.stemsCostSGD,
          },
          ...breakdown.addonRows.map((addon) => ({
            id: `li-add-${addon.id}`,
            title: language === 'en' ? addon.nameEn : addon.nameId,
            description: 'Simulator styling upgrade',
            quantity: 1,
            unitPriceSGD: addon.priceSGD,
          })),
        ],
        studioNotes: cardNote.trim()
          ? `Client note: ${cardNote.trim()}`
          : 'Generated via website Price Simulator.',
        createdAt: new Date().toISOString(),
      };
      onSendEstimateToCrm(newLead);
    }

    setCrmSuccessRef(referenceCode);
    setShowProposalForm(false);
    setProposalClientName('');
    setProposalContact('');
    setProposalEventTitle('');
    setProposalVenue('');
  };

  const whatsappHref = useMemo(() => {
    const formatName = language === 'en' ? activeFormat.nameEn : activeFormat.nameId;
    const paletteName = language === 'en' ? activePalette.labelEn : activePalette.labelId;
    const lines = [
      `Hello ${siteConfig.brandName}, I simulated a custom arrangement:`,
      `Format: ${formatName} (${formatPrice(activeFormat.baseFeeSGD, currency)})`,
      `Palette: ${paletteName}`,
      `Delivery Date: ${deliveryDate}`,
      'Selected Blooms:',
      ...breakdown.stemRows.map(
        (s) =>
          `- ${s.count}x ${language === 'en' ? s.nameEn : s.nameId} (${formatPrice(s.lineTotalSGD, currency)})`
      ),
      `Estimated Total: ${formatPrice(breakdown.totalSGD, currency)}`,
    ];
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [activeFormat, activePalette, breakdown, currency, deliveryDate, language]);

  return (
    <section
      id="simulator"
      className="border-t border-[#E5E1D8] bg-[#F9F8F6] py-16 lg:py-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-wide text-[#5C615D] mb-2">{t.kicker}</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C211E] mb-3">
              {t.heading}
            </h2>
            <p className="text-sm text-[#4D544F] leading-relaxed">{t.subheading}</p>
          </div>

          <div className="grid grid-cols-1 gap-1 p-1 bg-[#EAE6DF] rounded-sm w-full sm:inline-flex sm:w-fit sm:shrink-0">
            <button
              type="button"
              onClick={() => setBuilderMode('event-pieces')}
              className={`px-4 py-2.5 sm:py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                builderMode === 'event-pieces'
                  ? 'bg-white text-[#A35047] shadow-xs'
                  : 'text-[#5C615D] hover:text-[#1C211E]'
              }`}
            >
              {t.weddingModeLabel}
            </button>
            <button
              type="button"
              onClick={() => setBuilderMode('stems')}
              className={`px-4 py-2.5 sm:py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                builderMode === 'stems'
                  ? 'bg-white text-[#A35047] shadow-xs'
                  : 'text-[#5C615D] hover:text-[#1C211E]'
              }`}
            >
              {t.stemModeLabel}
            </button>
          </div>
        </div>

        {builderMode === 'event-pieces' ? (
          /* Published Couple/Event Estimator synced live with Studio CRM Calculator & Brand Theme */
          <div
            className="max-w-3xl mx-auto border rounded-xl p-6 sm:p-10 space-y-8"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.accentLineColor,
              color: theme.textColor,
              fontFamily: theme.bodyFont,
            }}
          >
            <div className="text-center space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className="text-[11px] tracking-[0.16em] uppercase"
                  style={{ color: theme.smallPrintColor }}
                >
                  {publishedCalculator.smallLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setSyncEstimatorCurrency((prev) => !prev)}
                  className="px-2 py-0.5 text-[10px] border border-[#DCD7CE] rounded-sm bg-[#FAF9F7] text-[#5C615D] hover:text-[#1C211E] cursor-pointer"
                >
                  {useStorefrontCurrency
                    ? language === 'id'
                      ? `Mata Uang: ${currency}`
                      : `Currency: ${currency}`
                    : language === 'id'
                      ? `Kurs Studio (${publishedCalculator.customSymbol || 'S$'})`
                      : `Studio Rate (${publishedCalculator.customSymbol || 'S$'})`}
                </button>
              </div>
              <h3
                className="text-4xl font-normal"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {publishedCalculator.title}{' '}
                <span className="italic" style={{ color: theme.estimateAccentColor }}>
                  {publishedCalculator.titleItalic}
                </span>
              </h3>
              <p
                className="text-sm max-w-lg mx-auto leading-relaxed"
                style={{ color: theme.smallPrintColor }}
              >
                {publishedCalculator.introSentence}
              </p>
              <p
                className="text-xs max-w-xl mx-auto leading-relaxed"
                style={{ color: theme.estimateAccentColor }}
              >
                {t.weddingHint}
              </p>
            </div>

            {groupedPieces.map((grp) => {
              const sectionNote = publishedCalculator.sectionNotes?.[grp.label];
              const isRentalGroup = publishedCalculator.rentalSections?.includes(grp.label);
              const groupLabel = localizedGroupName(grp.label);
              return (
                <div key={grp.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="text-[11px] tracking-[0.14em] uppercase"
                      style={{ color: theme.smallPrintColor }}
                    >
                      {groupLabel}
                    </div>
                    {isRentalGroup && (
                      <span
                        className="text-[10px] tracking-wide uppercase"
                        style={{ color: theme.estimateAccentColor }}
                      >
                        {language === 'en' ? 'Includes Rentals' : 'Termasuk Sewa Properti'}
                      </span>
                    )}
                  </div>
                  {sectionNote && (
                    <p className="text-xs pb-1" style={{ color: theme.smallPrintColor }}>
                      {sectionNote}
                    </p>
                  )}

                  <div
                    className="divide-y border-t border-b"
                    style={{ borderColor: theme.accentLineColor }}
                  >
                    {grp.items.map((piece) => {
                      const qty = pieceCounts[piece.id] || 0;
                      const unitSuffix = formatPieceUnit(
                        piece,
                        publishedCalculator,
                        language
                      );
                      const pieceName = localizedPieceName(piece);
                      const priceText =
                        piece.minPrice === piece.maxPrice
                          ? `${formatPublishedMoney(piece.minPrice, publishedCalculator, currency, useStorefrontCurrency)}${unitSuffix}`
                          : `${formatPublishedMoney(piece.minPrice, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(piece.maxPrice, publishedCalculator, currency, useStorefrontCurrency)}${unitSuffix}`;
                      return (
                        <div
                          key={piece.id}
                          className="py-4 flex items-center justify-between gap-4"
                          style={{ borderColor: theme.accentLineColor }}
                        >
                          <div>
                            <div
                              className="text-xl"
                              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                            >
                              {pieceName}
                            </div>
                            <div
                              className="text-xs tabular-nums"
                              style={{ color: theme.smallPrintColor }}
                            >
                              {priceText}
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setPieceCounts((prev) => ({
                                  ...prev,
                                  [piece.id]: Math.max(0, (prev[piece.id] || 0) - 1),
                                }))
                              }
                              className="w-8 h-8 rounded-full border border-[#DCD7CE] bg-[#FAF9F7] inline-flex items-center justify-center hover:bg-[#EFECE6] cursor-pointer text-[#1C211E]"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPieceCounts((prev) => ({
                                  ...prev,
                                  [piece.id]: Math.min(
                                    publishedCalculator.maxQtyPerItem || 50,
                                    (prev[piece.id] || 0) + 1
                                  ),
                                }))
                              }
                              className="w-8 h-8 rounded-full border border-[#DCD7CE] bg-[#FAF9F7] inline-flex items-center justify-center hover:bg-[#EFECE6] cursor-pointer text-[#1C211E]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Subtotal, Fee & Estimated Total */}
            <div
              className="p-6 border rounded-xl space-y-4"
              style={{
                backgroundColor: theme.pageBg,
                borderColor: theme.accentLineColor,
              }}
            >
              {piecesEstimate.totalQty > 0 && (
                <div
                  className="space-y-1.5 text-xs pb-3 border-b"
                  style={{ borderColor: theme.accentLineColor, color: theme.smallPrintColor }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>{publishedCalculator.subtotalLabel}</span>
                    <span className="tabular-nums font-medium">
                      {piecesEstimate.subtotalMin === piecesEstimate.subtotalMax
                        ? formatPublishedMoney(
                            piecesEstimate.subtotalMin,
                            publishedCalculator,
                            currency,
                            useStorefrontCurrency
                          )
                        : `${formatPublishedMoney(piecesEstimate.subtotalMin, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(piecesEstimate.subtotalMax, publishedCalculator, currency, useStorefrontCurrency)}`}
                    </span>
                  </div>
                  {!publishedCalculator.hideFeeLine && piecesEstimate.feeMax > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span>
                        {publishedCalculator.feeLabel} ({publishedCalculator.feePercent}%)
                      </span>
                      <span className="tabular-nums font-medium">
                        {piecesEstimate.feeMin === piecesEstimate.feeMax
                          ? formatPublishedMoney(
                              piecesEstimate.feeMin,
                              publishedCalculator,
                              currency,
                              useStorefrontCurrency
                            )
                          : `${formatPublishedMoney(piecesEstimate.feeMin, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(piecesEstimate.feeMax, publishedCalculator, currency, useStorefrontCurrency)}`}
                      </span>
                    </div>
                  )}
                  {piecesEstimate.hasRentals && (
                    <div className="text-[11px]">{publishedCalculator.rentalsLabel}</div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div
                    className="text-[11px] tracking-wider uppercase"
                    style={{ color: theme.smallPrintColor }}
                  >
                    {publishedCalculator.totalLabel}
                  </div>
                  <div
                    className="text-3xl tabular-nums"
                    style={{
                      fontFamily: theme.headingFont,
                      color: theme.estimateAccentColor,
                    }}
                  >
                    {piecesEstimate.min === piecesEstimate.max
                      ? formatPublishedMoney(
                          piecesEstimate.min,
                          publishedCalculator,
                          currency,
                          useStorefrontCurrency
                        )
                      : `${formatPublishedMoney(piecesEstimate.min, publishedCalculator, currency, useStorefrontCurrency)} – ${formatPublishedMoney(piecesEstimate.max, publishedCalculator, currency, useStorefrontCurrency)}`}
                  </div>
                  {publishedCalculator.noteUnderTotal && (
                    <p className="text-[11px] mt-1" style={{ color: theme.smallPrintColor }}>
                      {publishedCalculator.noteUnderTotal}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={piecesEstimate.totalQty === 0}
                    onClick={handleDownloadEventSummary}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium bg-white border border-[#DCD7CE] text-[#1C211E] hover:bg-[#F2F0EC] disabled:opacity-45 rounded-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{publishedCalculator.downloadBtnLabel || 'Download'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={piecesEstimate.totalQty === 0}
                    onClick={handleCopyEventEstimate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium bg-white border border-[#DCD7CE] text-[#1C211E] hover:bg-[#F2F0EC] disabled:opacity-45 rounded-sm cursor-pointer"
                  >
                    {copiedEstimate ? (
                      <Check className="w-3.5 h-3.5 text-[#2D3B32]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedEstimate
                        ? language === 'en'
                          ? 'Copied'
                          : 'Tersalin'
                        : publishedCalculator.copyBtnLabel || 'Copy'}
                    </span>
                  </button>
                </div>
              </div>

              {piecesEstimate.belowMinimum && piecesEstimate.totalQty > 0 && (
                <div className="p-3 bg-[#FBF1F0] border border-[#EBD2CE] rounded-sm flex items-start gap-2 text-xs text-[#8C433B]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {publishedCalculator.minimumWarning.replace(
                      '{minimum}',
                      formatPublishedMoney(
                        publishedCalculator.minimumProjectSGD,
                        publishedCalculator,
                        currency,
                        useStorefrontCurrency
                      )
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  disabled={!canSubmitEventPieces}
                  onClick={() => {
                    setCrmSuccessRef(null);
                    setShowProposalForm(true);
                  }}
                  style={{
                    backgroundColor: theme.buttonBg,
                    color: theme.buttonText,
                  }}
                  className="px-6 py-3 text-xs font-medium hover:opacity-90 disabled:opacity-45 rounded-sm cursor-pointer transition-opacity"
                >
                  {publishedCalculator.submitBtnText || t.requestProposalBtn}
                </button>

                {publishedCalculator.inquiryBtnText && (
                  <a
                    href={publishedCalculator.inquiryBtnUrl || '#services'}
                    className="text-xs font-medium underline underline-offset-4 hover:opacity-80"
                    style={{ color: theme.textColor }}
                  >
                    {publishedCalculator.inquiryBtnText}
                  </a>
                )}
              </div>
            </div>

            {crmSuccessRef && (
              <div className="p-4 bg-[#F2F7F4] border border-[#C7DBD0] rounded-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D3B32]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {publishedCalculator.thankYouHeading || t.crmSentTitle} ({crmSuccessRef})
                  </span>
                </div>
                <p className="text-xs text-[#4D544F]">
                  {publishedCalculator.thankYouMessage || t.crmSentDesc}
                </p>
                <button
                  type="button"
                  onClick={onOpenCrm}
                  className="text-xs font-medium text-[#2D3B32] underline underline-offset-4 cursor-pointer"
                >
                  {t.openInCrmBtn}
                </button>
              </div>
            )}

            {showProposalForm && (
              <form
                onSubmit={handleSubmitEstimateToCrm}
                className="p-5 bg-[#FAF9F7] border border-[#DCD7CE] rounded-sm space-y-3"
              >
                <h4 className="text-sm font-medium text-[#1C211E]">
                  {publishedCalculator.leadFormHeading || t.proposalFormTitle}
                </h4>
                {publishedCalculator.leadFormSubheading && (
                  <p className="text-xs text-[#5C615D]">
                    {publishedCalculator.leadFormSubheading}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={t.clientNameLabel}
                    value={proposalClientName}
                    onChange={(e) => setProposalClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder={t.clientContactLabel}
                    value={proposalContact}
                    onChange={(e) => setProposalContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                  />
                  <input
                    type="text"
                    placeholder={t.eventTitleLabel}
                    value={proposalEventTitle}
                    onChange={(e) => setProposalEventTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                  />
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
                {publishedCalculator.privacySentence && (
                  <p className="text-[11px] text-[#5C615D]">
                    {publishedCalculator.privacySentence}{' '}
                    <a
                      href={publishedCalculator.privacyUrl || '#atelier'}
                      className="underline underline-offset-2"
                    >
                      {publishedCalculator.privacyLinkText || 'Privacy Policy'}
                    </a>
                    .
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
                  >
                    {t.sendToCrmBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalForm(false)}
                    className="px-4 py-2.5 text-xs font-medium text-[#5C615D] bg-white border border-[#DCD7CE] rounded-sm cursor-pointer"
                  >
                    {t.cancelBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Individual Stem & Vessel Builder */
          <>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-[#5C615D] mr-1">{t.presetsLabel}</span>
              <button
                type="button"
                onClick={() => applyPreset('sunset')}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCD7CE] hover:border-[#A35047] rounded-sm transition-colors cursor-pointer"
              >
                Sunset Reverie
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ivory')}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCD7CE] hover:border-[#2D3B32] rounded-sm transition-colors cursor-pointer"
              >
                Ivory Atelier
              </button>
              <button
                type="button"
                onClick={() => applyPreset('peony')}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-[#DCD7CE] hover:border-[#2D3B32] rounded-sm transition-colors cursor-pointer"
              >
                Blush Peony
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-8">
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-sm">
                  <h3 className="font-serif text-2xl text-[#1C211E] mb-4">{t.step1Title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SIMULATOR_FORMATS.map((fmt) => {
                      const active = fmt.id === selectedFormatId;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSelectedFormatId(fmt.id)}
                          className={`p-3.5 text-left border rounded-sm transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            active
                              ? 'border-[#A35047] bg-[#FDF9F8]'
                              : 'border-[#E5E1D8] bg-[#F9F8F6] hover:border-[#9E978E]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#1C211E]">
                              {language === 'en' ? fmt.nameEn : fmt.nameId}
                            </div>
                            <div className="text-xs text-[#5C615D] mt-0.5">
                              {language === 'en' ? fmt.descEn : fmt.descId}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#1C211E] tabular-nums shrink-0">
                            {formatPrice(fmt.baseFeeSGD, currency)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-white border border-[#E5E1D8] rounded-sm">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="font-serif text-2xl text-[#1C211E]">{t.step2Title}</h3>
                    <button
                      type="button"
                      onClick={() => setStemCounts({})}
                      className="inline-flex items-center gap-1.5 text-xs text-[#5C615D] hover:text-[#1C211E] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.resetStems}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#EFECE6]">
                    {SIMULATOR_STEMS.map((stem) => {
                      const count = stemCounts[stem.id] || 0;
                      const stemName = language === 'en' ? stem.nameEn : stem.nameId;
                      return (
                        <div
                          key={stem.id}
                          className="py-3.5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#1C211E]">{stemName}</div>
                            <div className="text-xs text-[#5C615D] flex items-center gap-2 mt-0.5">
                              <span>{stem.originNote}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {formatPrice(stem.pricePerStemSGD, currency)} /{' '}
                                {language === 'en' ? 'stem' : 'tangkai'}
                              </span>
                            </div>
                          </div>

                          <div className="inline-flex items-center border border-[#DCD7CE] rounded-sm bg-[#F9F8F6] shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => updateStem(stem.id, -1)}
                              disabled={count === 0}
                              aria-label={`Remove one ${stemName}`}
                              className="w-8 h-8 inline-flex items-center justify-center text-[#1C211E] disabled:opacity-30 hover:bg-[#EAE6DF] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium tabular-nums">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateStem(stem.id, 1)}
                              aria-label={`Add one ${stemName}`}
                              className="w-8 h-8 inline-flex items-center justify-center text-[#1C211E] hover:bg-[#EAE6DF] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-white border border-[#E5E1D8] rounded-sm space-y-6">
                  <h3 className="font-serif text-2xl text-[#1C211E]">{t.step3Title}</h3>

                  <div>
                    <label className="block text-xs font-medium text-[#1C211E] mb-2">
                      {t.paletteLabel}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE_OPTIONS.map((palette) => {
                        const active = palette.id === selectedPaletteId;
                        return (
                          <button
                            key={palette.id}
                            type="button"
                            onClick={() => setSelectedPaletteId(palette.id)}
                            className={`px-3.5 py-2 text-xs font-medium border rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'border-[#A35047] bg-[#FDF9F8] text-[#1C211E]'
                                : 'border-[#DCD7CE] bg-[#F9F8F6] text-[#5C615D] hover:text-[#1C211E]'
                            }`}
                          >
                            {language === 'en' ? palette.labelEn : palette.labelId}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SIMULATOR_ADDONS.map((addon) => {
                      const checked = selectedAddons.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-center justify-between gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                            checked
                              ? 'border-[#2D3B32] bg-[#F5F7F5]'
                              : 'border-[#E5E1D8] bg-[#F9F8F6]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAddon(addon.id)}
                              className="accent-[#2D3B32]"
                            />
                            <span className="text-xs font-medium text-[#1C211E]">
                              {language === 'en' ? addon.nameEn : addon.nameId}
                            </span>
                          </div>
                          <span className="text-xs text-[#5C615D] tabular-nums shrink-0">
                            +{formatPrice(addon.priceSGD, currency)}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1C211E] mb-1.5">
                        {t.deliveryDateLabel}
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1C211E] mb-1.5">
                        {t.cardNoteLabel}
                      </label>
                      <input
                        type="text"
                        value={cardNote}
                        onChange={(e) => setCardNote(e.target.value)}
                        placeholder={t.cardNotePlaceholder}
                        className="w-full px-3 py-2 text-sm bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Cost Summary */}
              <div className="lg:col-span-5 lg:sticky lg:top-8 bg-white border border-[#E5E1D8] rounded-sm overflow-hidden">
                <div className="aspect-[4/3] w-full bg-[#EFECE6] border-b border-[#E5E1D8] overflow-hidden">
                  <ResilientImage
                    src={activeFormat.image}
                    alt={language === 'en' ? activeFormat.nameEn : activeFormat.nameId}
                    fallbackTitle={language === 'en' ? activeFormat.nameEn : activeFormat.nameId}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4 border-b border-[#ECE8E1] pb-4">
                    <div>
                      <div className="text-xs text-[#5C615D]">
                        {t.tierLabel}: {breakdown.scaleLabel}
                      </div>
                      <h3 className="font-serif text-2xl text-[#1C211E] mt-0.5">
                        {t.summaryTitle}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-[#5C615D] tabular-nums pt-1">
                      {breakdown.totalStems} {language === 'en' ? 'stems' : 'tangkai'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between gap-4 text-[#1C211E]">
                      <span>
                        {t.formatLine}:{' '}
                        {language === 'en' ? activeFormat.nameEn : activeFormat.nameId}
                      </span>
                      <span className="tabular-nums font-medium shrink-0">
                        {formatPrice(activeFormat.baseFeeSGD, currency)}
                      </span>
                    </div>

                    {breakdown.stemRows.length === 0 ? (
                      <p className="text-[#8A8F8B] italic py-2">{t.noStemsHint}</p>
                    ) : (
                      <div className="space-y-1.5 pt-2 border-t border-[#F2F0EC]">
                        <div className="font-medium text-[#5C615D]">{t.stemsLine}</div>
                        {breakdown.stemRows.map((row) => (
                          <div key={row.id} className="flex justify-between gap-4 text-[#4D544F]">
                            <span>
                              {row.count}x {language === 'en' ? row.nameEn : row.nameId}
                            </span>
                            <span className="tabular-nums shrink-0">
                              {formatPrice(row.lineTotalSGD, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {breakdown.addonRows.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-[#F2F0EC]">
                        <div className="font-medium text-[#5C615D]">{t.addonsLine}</div>
                        {breakdown.addonRows.map((addon) => (
                          <div key={addon.id} className="flex justify-between gap-4 text-[#4D544F]">
                            <span>{language === 'en' ? addon.nameEn : addon.nameId}</span>
                            <span className="tabular-nums shrink-0">
                              {formatPrice(addon.priceSGD, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#DCD7CE] flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-[#1C211E]">{t.totalLabel}</span>
                    <span className="font-serif text-3xl text-[#1C211E] tabular-nums">
                      {formatPrice(breakdown.totalSGD, currency)}
                    </span>
                  </div>

                  {crmSuccessRef && (
                    <div className="p-4 bg-[#F2F7F4] border border-[#C7DBD0] rounded-sm space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#2D3B32]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {t.crmSentTitle} ({crmSuccessRef})
                        </span>
                      </div>
                      <p className="text-xs text-[#4D544F] leading-relaxed">{t.crmSentDesc}</p>
                      <button
                        type="button"
                        onClick={onOpenCrm}
                        className="text-xs font-medium text-[#2D3B32] underline underline-offset-4 cursor-pointer"
                      >
                        {t.openInCrmBtn}
                      </button>
                    </div>
                  )}

                  {showProposalForm ? (
                    <form
                      onSubmit={handleSubmitEstimateToCrm}
                      className="p-4 bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm space-y-3"
                    >
                      <h4 className="text-xs font-semibold text-[#1C211E]">
                        {t.proposalFormTitle}
                      </h4>
                      <input
                        type="text"
                        required
                        placeholder={t.clientNameLabel}
                        value={proposalClientName}
                        onChange={(e) => setProposalClientName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                      />
                      <input
                        type="text"
                        required
                        placeholder={t.clientContactLabel}
                        value={proposalContact}
                        onChange={(e) => setProposalContact(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder={t.eventTitleLabel}
                          value={proposalEventTitle}
                          onChange={(e) => setProposalEventTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                        />
                        <input
                          type="text"
                          placeholder={t.venueLabel}
                          value={proposalVenue}
                          onChange={(e) => setProposalVenue(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2 px-3 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
                        >
                          {t.sendToCrmBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProposalForm(false)}
                          className="py-2 px-3 text-xs font-medium text-[#5C615D] bg-white border border-[#DCD7CE] rounded-sm cursor-pointer"
                        >
                          {t.cancelBtn}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      <button
                        type="button"
                        disabled={!canOrderStems}
                        onClick={handleAddSimulatedToBag}
                        className="w-full py-3 px-5 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#A35047] hover:bg-[#8E433B] disabled:opacity-45 transition-colors rounded-sm cursor-pointer min-h-[44px]"
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{t.addedToast}</span>
                          </>
                        ) : (
                          <span>{t.addToBagBtn}</span>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={!canOrderStems}
                        onClick={() => {
                          setCrmSuccessRef(null);
                          setShowProposalForm(true);
                        }}
                        className="w-full py-2.5 px-5 text-xs font-medium text-[#1C211E] bg-[#F2F0EC] border border-[#DCD7CE] hover:bg-[#E7E3DC] disabled:opacity-45 transition-colors rounded-sm cursor-pointer"
                      >
                        {t.requestProposalBtn}
                      </button>

                      {canOrderStems ? (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-5 inline-flex items-center justify-center text-xs text-[#5C615D] hover:text-[#1C211E] underline underline-offset-4"
                        >
                          {t.whatsappBtn}
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
