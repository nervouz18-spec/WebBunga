import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bell,
  Calculator,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Flower2,
  LayoutGrid,
  Link2,
  List,
  LogOut,
  MailOpen,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { formatPrice, siteConfig } from '../config/siteConfig';
import { HERO_IMAGE, SIMULATOR_STEMS } from '../data/catalog';
import { INITIAL_CALCULATOR_CONFIG } from '../data/crmSeeds';
import { copy } from '../data/translations';
import {
  CalculatorBrandTheme,
  CalculatorConfig,
  CalculatorPiece,
  CrmLead,
  CrmSection,
  CrmStage,
  CurrencyCode,
  Language,
  OrderSubmission,
  PricingUnit,
  ProposalLineItem,
  StudioAccessConfig,
} from '../types/store';
import { ResilientImage } from './ResilientImage';

interface CrmWorkspaceProps {
  language: Language;
  currency: CurrencyCode;
  userEmail: string;
  userDisplayName: string;
  leads: CrmLead[];
  orders: OrderSubmission[];
  calculatorDraft: CalculatorConfig;
  studioAccess: StudioAccessConfig;
  onUpdateStudioAccess: (next: StudioAccessConfig) => void;
  onPublishProposalLink: (lead: CrmLead) => Promise<string>;
  onSaveCalculatorDraft: (cfg: CalculatorConfig) => void;
  onPublishCalculator: (cfg: CalculatorConfig) => void;
  onSetLanguage: (lang: Language) => void;
  onSetCurrency: (curr: CurrencyCode) => void;
  onBackToStorefront: () => void;
  onSignOut: () => void;
  onCreateLead: (lead: CrmLead) => void;
  onUpdateLead: (lead: CrmLead) => void;
  onDeleteLead: (leadId: string) => void;
}

const STAGE_ORDER: CrmStage[] = [
  'estimate',
  'lead',
  'proposal-sent',
  'contract-signed',
  'booked',
];

const STAGE_STYLE: Record<CrmStage, string> = {
  estimate: 'text-[#8C5B32] bg-[#FAF3EB] border-[#E8D5BE]',
  lead: 'text-[#3F4E44] bg-[#EFF3F0] border-[#D3DED6]',
  'proposal-sent': 'text-[#8C433B] bg-[#FBF1F0] border-[#EBD2CE]',
  'contract-signed': 'text-[#2D4F3B] bg-[#ECF5EF] border-[#C5DFCD]',
  booked: 'text-[#166534] bg-[#DCFCE7] border-[#BBF7D0]',
};

function formatCalcMoney(amount: number, cfg: CalculatorConfig): string {
  const sym = cfg.customSymbol.trim() || 'S$';
  const rounded = Math.round(amount);
  let numStr = String(rounded);
  if (cfg.thousandsSeparator === 'comma') {
    numStr = rounded.toLocaleString('en-US');
  } else if (cfg.thousandsSeparator === 'period') {
    numStr = rounded.toLocaleString('de-DE');
  } else {
    numStr = rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
  }
  return cfg.symbolPosition === 'before' ? `${sym}${numStr}` : `${numStr} ${sym}`;
}

function getGreetingLabel(lang: Language): string {
  const hour = new Date().getHours();
  if (lang === 'id') {
    if (hour < 11) return 'Selamat pagi.';
    if (hour < 15) return 'Selamat siang.';
    if (hour < 19) return 'Selamat sore.';
    return 'Selamat malam.';
  }
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

export function CrmWorkspace({
  language,
  currency,
  userEmail,
  userDisplayName,
  leads,
  orders,
  calculatorDraft,
  studioAccess,
  onUpdateStudioAccess,
  onPublishProposalLink,
  onSaveCalculatorDraft,
  onPublishCalculator,
  onSetLanguage,
  onSetCurrency,
  onBackToStorefront,
  onSignOut,
  onCreateLead,
  onUpdateLead,
  onDeleteLead,
}: CrmWorkspaceProps) {
  const t = copy[language].crm;
  const isId = language === 'id';

  const [activeSection, setActiveSection] = useState<CrmSection>('calculator');
  const [eventsSubView, setEventsSubView] = useState<'pipeline' | 'proposal'>('pipeline');
  const [pipelineView, setPipelineView] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<CrmStage | 'all'>('all');
  const [onlyMoneyOwed, setOnlyMoneyOwed] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [showClientPreview, setShowClientPreview] = useState(false);
  const [signatureInput, setSignatureInput] = useState('');
  const [copiedMarketList, setCopiedMarketList] = useState(false);
  const [copiedProposalLinkId, setCopiedProposalLinkId] = useState<string | null>(null);
  const [newAllowedEmail, setNewAllowedEmail] = useState('');

  // Calculator live preview & editor states
  const [previewTab, setPreviewTab] = useState<'calculator' | 'lead-form' | 'thank-you'>(
    'calculator'
  );
  const [previewCounts, setPreviewCounts] = useState<Record<string, number>>({});
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);
  const [newPieceName, setNewPieceName] = useState('');
  const [newPieceGroup, setNewPieceGroup] = useState('RECEPTION');
  const [newPieceMin, setNewPieceMin] = useState(120);
  const [newPieceMax, setNewPieceMax] = useState(180);
  const [newSectionName, setNewSectionName] = useState('');

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 10, 1)); // Nov 2026
  const todayIso = new Date().toISOString().split('T')[0];

  // Numbers & Reports states
  const [numbersTab, setNumbersTab] = useState<'financial' | 'stems' | 'orders' | 'clients'>(
    'financial'
  );
  const [reportPeriod, setReportPeriod] = useState<
    'this-month' | 'last-month' | 'ytd' | 'all'
  >('all');

  // Proposal line item inputs
  const [newLineTitle, setNewLineTitle] = useState('');
  const [newLineDesc, setNewLineDesc] = useState('');
  const [newLineQty, setNewLineQty] = useState(1);
  const [newLinePrice, setNewLinePrice] = useState(250);

  // New Lead modal state
  const [newLeadForm, setNewLeadForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventTitle: '',
    eventDate: new Date().toISOString().split('T')[0],
    venue: '',
    palette: 'Ivory & Sage',
    estimatedTotalSGD: 1200,
    studioNotes: '',
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadEstimatesCount = useMemo(
    () => leads.filter((l) => l.stage === 'estimate').length,
    [leads]
  );

  const needsYouLeads = useMemo(
    () => leads.filter((l) => l.stage === 'estimate' || l.stage === 'proposal-sent'),
    [leads]
  );

  const bookedCount = useMemo(
    () => leads.filter((l) => l.stage === 'booked' || l.stage === 'contract-signed').length,
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      if (stageFilter !== 'all' && lead.stage !== stageFilter) return false;
      if (onlyMoneyOwed && lead.depositPaidSGD >= lead.estimatedTotalSGD) return false;
      if (!q) return true;
      return [
        lead.clientName,
        lead.eventTitle,
        lead.referenceCode,
        lead.venue,
        lead.clientEmail,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [leads, searchQuery, stageFilter, onlyMoneyOwed]);

  const activeProposalLead = leads.find((l) => l.id === selectedLeadId) || leads[0] || null;

  const kpis = useMemo(() => {
    const pipelineValue = leads.reduce((sum, l) => sum + l.estimatedTotalSGD, 0);
    const openCount = leads.filter(
      (l) => l.stage === 'estimate' || l.stage === 'lead' || l.stage === 'proposal-sent'
    ).length;
    const bookedRevenue = leads
      .filter((l) => l.stage === 'booked' || l.stage === 'contract-signed')
      .reduce((sum, l) => sum + l.estimatedTotalSGD, 0);
    const totalStems = leads
      .filter((l) => l.stage !== 'estimate')
      .reduce((sum, l) => sum + Object.values(l.stemCounts).reduce((a, b) => a + b, 0), 0);

    return { pipelineValue, openCount, bookedRevenue, totalStems };
  }, [leads]);

  const financialLedger = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const matchesPeriod = (iso: string) => {
      if (reportPeriod === 'all') return true;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return true;
      if (reportPeriod === 'this-month') {
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      }
      if (reportPeriod === 'last-month') {
        const lastM = curMonth === 0 ? 11 : curMonth - 1;
        const lastY = curMonth === 0 ? curYear - 1 : curYear;
        return d.getFullYear() === lastY && d.getMonth() === lastM;
      }
      return d.getFullYear() === curYear;
    };

    const filteredOrders = orders.filter((o) => matchesPeriod(o.createdAt));
    const filteredLeads = leads.filter((l) => matchesPeriod(l.createdAt));

    const retainersReceived = filteredLeads
      .filter((l) => l.stage === 'contract-signed' && l.depositPaidSGD > 0)
      .reduce((s, l) => s + l.depositPaidSGD, 0);

    const weddingPaymentsReceived = filteredLeads
      .filter((l) => l.stage === 'booked' && l.depositPaidSGD > 0)
      .reduce((s, l) => s + l.depositPaidSGD, 0);

    const storefrontOrdersTotal = filteredOrders
      .filter((o) => !o.items.some((i) => i.isSubscription))
      .reduce((s, o) => s + o.totalSGD, 0);

    const subscriptionsTotal = filteredOrders
      .filter((o) => o.items.some((i) => i.isSubscription))
      .reduce((s, o) => s + o.totalSGD, 0);

    const moneyReceived =
      retainersReceived + weddingPaymentsReceived + storefrontOrdersTotal + subscriptionsTotal;
    const processingFees = Math.round(moneyReceived * 0.029);
    const netToBank = Math.max(0, moneyReceived - processingFees);
    const outstandingBalance = filteredLeads.reduce(
      (s, l) => s + Math.max(0, l.estimatedTotalSGD - l.depositPaidSGD),
      0
    );

    return {
      retainersReceived,
      weddingPaymentsReceived,
      storefrontOrdersTotal,
      subscriptionsTotal,
      moneyReceived,
      processingFees,
      netToBank,
      outstandingBalance,
      paymentCount:
        filteredOrders.length + filteredLeads.filter((l) => l.depositPaidSGD > 0).length,
    };
  }, [leads, orders, reportPeriod]);

  const stemAggregation = useMemo(() => {
    const totals: Record<string, number> = {};
    leads.forEach((lead) => {
      Object.entries(lead.stemCounts).forEach(([stemId, count]) => {
        totals[stemId] = (totals[stemId] || 0) + count;
      });
    });

    return SIMULATOR_STEMS.filter((s) => (totals[s.id] || 0) > 0).map((stem) => {
      const count = totals[stem.id] || 0;
      const bunches = Math.ceil(count / 10);
      return {
        ...stem,
        count,
        bunches,
        subtotalSGD: count * stem.pricePerStemSGD,
      };
    });
  }, [leads]);

  const clientDirectory = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        projectsCount: number;
        totalSpendSGD: number;
        latestDate: string;
      }
    >();

    leads.forEach((lead) => {
      const key = lead.clientEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.projectsCount += 1;
        existing.totalSpendSGD += lead.estimatedTotalSGD;
        if (lead.eventDate > existing.latestDate) existing.latestDate = lead.eventDate;
      } else {
        map.set(key, {
          name: lead.clientName,
          email: lead.clientEmail,
          phone: lead.clientPhone,
          projectsCount: 1,
          totalSpendSGD: lead.estimatedTotalSGD,
          latestDate: lead.eventDate,
        });
      }
    });

    orders.forEach((ord) => {
      const key = ord.customerEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.projectsCount += 1;
        existing.totalSpendSGD += ord.totalSGD;
      } else {
        map.set(key, {
          name: ord.customerName,
          email: ord.customerEmail,
          phone: ord.customerPhone,
          projectsCount: 1,
          totalSpendSGD: ord.totalSGD,
          latestDate: ord.createdAt.split('T')[0],
        });
      }
    });

    return Array.from(map.values()).filter((c) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q);
    });
  }, [leads, orders, searchQuery]);

  // All sections in calculatorDraft (preserving order, including empty newly added sections)
  const editorSections = useMemo(() => {
    const map = new Map<string, CalculatorPiece[]>();
    calculatorDraft.pieces.forEach((piece) => {
      const arr = map.get(piece.groupLabel) || [];
      arr.push(piece);
      map.set(piece.groupLabel, arr);
    });
    Object.keys(calculatorDraft.sectionNotes || {}).forEach((sec) => {
      if (!map.has(sec)) map.set(sec, []);
    });
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [calculatorDraft.pieces, calculatorDraft.sectionNotes]);

  const groupedPreviewPieces = useMemo(() => {
    const groups: { label: string; items: CalculatorPiece[] }[] = [];
    calculatorDraft.pieces
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
  }, [calculatorDraft.pieces]);

  const previewEstimate = useMemo(() => {
    let subMin = 0;
    let subMax = 0;
    let feeMin = 0;
    let feeMax = 0;
    const feeRate = Math.max(0, calculatorDraft.feePercent || 0) / 100;
    calculatorDraft.pieces.forEach((piece) => {
      if (!piece.enabled) return;
      const qty = previewCounts[piece.id] || 0;
      const pMin = qty * piece.minPrice;
      const pMax = qty * piece.maxPrice;
      subMin += pMin;
      subMax += pMax;
      if (!piece.noFee && feeRate > 0) {
        feeMin += pMin * feeRate;
        feeMax += pMax * feeRate;
      }
    });
    const min = Math.round(subMin + feeMin);
    const max = Math.round(subMax + feeMax);
    const belowMin =
      calculatorDraft.minimumProjectSGD > 0 &&
      max > 0 &&
      max < calculatorDraft.minimumProjectSGD;
    return {
      subMin: Math.round(subMin),
      subMax: Math.round(subMax),
      feeMin: Math.round(feeMin),
      feeMax: Math.round(feeMax),
      min,
      max,
      belowMin,
    };
  }, [calculatorDraft, previewCounts]);

  const updateCalcField = <K extends keyof CalculatorConfig>(
    key: K,
    value: CalculatorConfig[K]
  ) => {
    onSaveCalculatorDraft({ ...calculatorDraft, [key]: value });
  };

  const updateBrandTheme = <K extends keyof CalculatorBrandTheme>(
    key: K,
    value: CalculatorBrandTheme[K]
  ) => {
    onSaveCalculatorDraft({
      ...calculatorDraft,
      brandTheme: {
        ...calculatorDraft.brandTheme,
        [key]: value,
      },
    });
  };

  const movePiece = (pieceId: string, dir: -1 | 1) => {
    const idx = calculatorDraft.pieces.findIndex((p) => p.id === pieceId);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= calculatorDraft.pieces.length) return;
    const copyPieces = [...calculatorDraft.pieces];
    const [moved] = copyPieces.splice(idx, 1);
    copyPieces.splice(target, 0, moved);
    updateCalcField('pieces', copyPieces);
  };

  const handleAddCalculatorPiece = (e: FormEvent, groupOverride?: string) => {
    e.preventDefault();
    if (!newPieceName.trim()) return;
    const grp = (groupOverride || newPieceGroup).trim().toUpperCase() || 'CUSTOM';
    const piece: CalculatorPiece = {
      id: `piece-${Date.now()}`,
      groupLabel: grp,
      name: newPieceName.trim(),
      minPrice: Math.max(0, newPieceMin),
      maxPrice: Math.max(newPieceMin, newPieceMax),
      enabled: true,
      pricingUnit: 'each',
      noFee: false,
    };
    updateCalcField('pieces', [...calculatorDraft.pieces, piece]);
    setNewPieceName('');
  };

  const handleAddSection = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = newSectionName.trim().toUpperCase();
    if (!cleaned) return;
    updateCalcField('sectionNotes', {
      ...calculatorDraft.sectionNotes,
      [cleaned]: calculatorDraft.sectionNotes[cleaned] || '',
    });
    setNewPieceGroup(cleaned);
    setNewSectionName('');
  };

  const handlePublishClick = () => {
    const stamp = `Published ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
    const published: CalculatorConfig = {
      ...calculatorDraft,
      lastPublishedAt: stamp,
    };
    onPublishCalculator(published);
    setDraftSavedNotice(
      isId ? 'Berhasil dipublikasikan ke Website!' : 'Published live to Storefront!'
    );
    setTimeout(() => setDraftSavedNotice(null), 2600);
  };

  const handleSaveDraftClick = () => {
    onSaveCalculatorDraft(calculatorDraft);
    setDraftSavedNotice(isId ? 'Draf tersimpan' : 'Draft saved');
    setTimeout(() => setDraftSavedNotice(null), 2000);
  };

  const handleStageChange = (lead: CrmLead, nextStage: CrmStage) => {
    onUpdateLead({ ...lead, stage: nextStage });
  };

  const handleOpenProposal = (leadId: string) => {
    setSelectedLeadId(leadId);
    setShowClientPreview(false);
    setActiveSection('events');
    setEventsSubView('proposal');
  };

  const handleAddLineItem = (e: FormEvent) => {
    e.preventDefault();
    if (!activeProposalLead || !newLineTitle.trim()) return;
    const item: ProposalLineItem = {
      id: `li-${Date.now()}`,
      title: newLineTitle.trim(),
      description: newLineDesc.trim() || 'Custom floral studio deliverable',
      quantity: Math.max(1, newLineQty),
      unitPriceSGD: Math.max(0, newLinePrice),
    };
    const updatedItems = [...activeProposalLead.lineItems, item];
    const updatedTotal = updatedItems.reduce(
      (sum, row) => sum + row.quantity * row.unitPriceSGD,
      0
    );
    onUpdateLead({
      ...activeProposalLead,
      lineItems: updatedItems,
      estimatedTotalSGD: updatedTotal,
    });
    setNewLineTitle('');
    setNewLineDesc('');
    setNewLineQty(1);
    setNewLinePrice(250);
  };

  const handleRemoveLineItem = (itemId: string) => {
    if (!activeProposalLead) return;
    const updatedItems = activeProposalLead.lineItems.filter((i) => i.id !== itemId);
    const updatedTotal = updatedItems.reduce(
      (sum, row) => sum + row.quantity * row.unitPriceSGD,
      0
    );
    onUpdateLead({
      ...activeProposalLead,
      lineItems: updatedItems,
      estimatedTotalSGD: updatedTotal,
    });
  };

  const handleClientSignContract = (e: FormEvent) => {
    e.preventDefault();
    if (!activeProposalLead || !signatureInput.trim()) return;
    onUpdateLead({
      ...activeProposalLead,
      stage: 'contract-signed',
      contractSignedBy: signatureInput.trim(),
      contractSignedAt: new Date().toISOString(),
    });
    setSignatureInput('');
  };

  const handleMarkDepositPaid = (lead: CrmLead) => {
    onUpdateLead({
      ...lead,
      stage: 'booked',
      depositPaidSGD: Math.round(lead.estimatedTotalSGD * 0.5),
    });
  };

  const handleCreateNewLeadSubmit = (e: FormEvent) => {
    e.preventDefault();
    const created: CrmLead = {
      id: `lead-${Date.now()}`,
      referenceCode: `FL-${Math.floor(2500 + Math.random() * 7000)}`,
      source: 'manual',
      stage: 'lead',
      clientName: newLeadForm.clientName.trim(),
      clientEmail: newLeadForm.clientEmail.trim(),
      clientPhone: newLeadForm.clientPhone.trim(),
      eventTitle: newLeadForm.eventTitle.trim(),
      eventDate: newLeadForm.eventDate,
      venue: newLeadForm.venue.trim() || 'TBD',
      palette: newLeadForm.palette,
      estimatedTotalSGD: Number(newLeadForm.estimatedTotalSGD) || 0,
      depositPaidSGD: 0,
      stemCounts: { 'garden-rose': 12, eucalyptus: 10 },
      lineItems: [
        {
          id: `li-init-${Date.now()}`,
          title: newLeadForm.eventTitle.trim() || 'Floral Styling Package',
          description: `Palette: ${newLeadForm.palette}`,
          quantity: 1,
          unitPriceSGD: Number(newLeadForm.estimatedTotalSGD) || 0,
        },
      ],
      studioNotes: newLeadForm.studioNotes.trim(),
      createdAt: new Date().toISOString(),
    };
    onCreateLead(created);
    setSelectedLeadId(created.id);
    setIsNewLeadModalOpen(false);
    setActiveSection('events');
    setNewLeadForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      eventTitle: '',
      eventDate: new Date().toISOString().split('T')[0],
      venue: '',
      palette: 'Ivory & Sage',
      estimatedTotalSGD: 1200,
      studioNotes: '',
    });
  };

  const handleCopyMarketList = async () => {
    const lines = [
      `${siteConfig.brandName} — Wholesale Flower Market List`,
      ...stemAggregation.map(
        (s) =>
          `- ${language === 'en' ? s.nameEn : s.nameId}: ${s.count} stems (${s.bunches} bunches)`
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedMarketList(true);
      setTimeout(() => setCopiedMarketList(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleExportClientsCsv = () => {
    const header = 'Name,Email,Phone,Projects,Total_SGD,Latest_Date\n';
    const rows = clientDirectory
      .map(
        (c) =>
          `"${c.name.replace(/"/g, '""')}","${c.email}","${c.phone}",${c.projectsCount},${c.totalSpendSGD},"${c.latestDate}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bloom-botanica-clients.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportFinancialCsv = () => {
    const lines = [
      'Category,Amount_SGD',
      `Event Retainers,${financialLedger.retainersReceived}`,
      `Confirmed Wedding Payments,${financialLedger.weddingPaymentsReceived}`,
      `Storefront Orders,${financialLedger.storefrontOrdersTotal}`,
      `Subscriptions,${financialLedger.subscriptionsTotal}`,
      `Gross Money Received,${financialLedger.moneyReceived}`,
      `Estimated Processing Fees,${financialLedger.processingFees}`,
      `Net Bank Payout,${financialLedger.netToBank}`,
      `Outstanding Client Balances,${financialLedger.outstandingBalance}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bloom-botanica-financial-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calendar grid helper (Monday-first or Sunday-first clean 7-column grid)
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day: number | null; dateStr?: string }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({ day: d, dateStr: `${year}-${mStr}-${dStr}` });
    }
    return cells;
  }, [calendarDate]);

  const upcomingBooked = useMemo(
    () =>
      [...leads]
        .filter((l) => l.stage === 'booked' || l.stage === 'contract-signed')
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    [leads]
  );

  const railItems: { id: CrmSection; label: string; icon: typeof MailOpen }[] = [
    { id: 'events', label: 'EVENTS', icon: MailOpen },
    { id: 'calendar', label: 'CALENDAR', icon: CalendarIcon },
    { id: 'calculator', label: 'CALCULATOR', icon: Calculator },
    { id: 'numbers', label: 'NUMBERS', icon: BarChart3 },
    { id: 'studio', label: 'STUDIO', icon: Flower2 },
  ];

  const theme = calculatorDraft.brandTheme;
  const userInitial = (userDisplayName || userEmail || 'B').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F8F6] text-[#1C211E]">
      {/* Slim Storefront-Unified Blush-Terracotta Vertical Icon Rail */}
      <aside className="md:w-[82px] shrink-0 bg-[#F5EAE8] border-b md:border-b-0 md:border-r border-[#E6D4D0] flex md:flex-col items-center justify-between px-3 py-2 md:py-5 md:px-0 z-30">
        <div className="flex md:flex-col items-center gap-3 md:gap-5 w-full overflow-x-auto md:overflow-visible">
          <button
            type="button"
            onClick={onBackToStorefront}
            title={t.backToStore}
            className="font-serif italic text-3xl text-[#A35047] hover:text-[#1C211E] px-2 py-1 shrink-0 cursor-pointer"
          >
            B
          </button>

          <nav
            aria-label="Studio workspace rail"
            className="flex md:flex-col items-center gap-1 md:gap-4 md:w-full"
          >
            {railItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className="group relative flex flex-col items-center justify-center px-2.5 py-2 md:w-full cursor-pointer"
                >
                  <Icon
                    className={`w-5 h-5 stroke-[1.5] transition-colors ${
                      active ? 'text-[#A35047]' : 'text-[#6B5A57] group-hover:text-[#1C211E]'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`mt-1 text-[10px] tracking-wider font-medium ${
                      active ? 'text-[#1C211E]' : 'text-[#6B5A57]'
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="mt-1 h-[2px] w-10 bg-[#A35047] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex flex-col items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setActiveSection('events');
              setEventsSubView('pipeline');
              setTimeout(() => searchInputRef.current?.focus(), 80);
            }}
            className="flex flex-col items-center gap-0.5 text-[#6B5A57] hover:text-[#1C211E] cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[1.6]" aria-hidden="true" />
            <span className="text-[9px] tracking-wider font-medium">SEARCH</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('events');
              setEventsSubView('pipeline');
              setStageFilter('estimate');
            }}
            title={`${unreadEstimatesCount} new estimates`}
            className="relative p-1.5 text-[#6B5A57] hover:text-[#1C211E] cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.6]" aria-hidden="true" />
            {unreadEstimatesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-semibold bg-[#A35047] text-white rounded-full flex items-center justify-center tabular-nums">
                {unreadEstimatesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('studio')}
            title={userEmail}
            className="w-8 h-8 rounded-full border border-[#D8BEB9] bg-white text-xs font-medium text-[#A35047] flex items-center justify-center hover:bg-[#FAF9F6] cursor-pointer"
          >
            {userInitial}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Bar with User Account & Sign Out */}
        <header className="h-14 bg-white border-b border-[#E5E1D8] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#5C615D]">
            <button
              type="button"
              onClick={onBackToStorefront}
              className="inline-flex items-center gap-1.5 text-[#1C211E] hover:text-[#A35047] font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.backToStore}</span>
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[#1C211E] capitalize">{activeSection}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {userEmail && (
              <span className="hidden lg:inline text-xs text-[#5C615D] truncate max-w-[200px]">
                {userEmail}
              </span>
            )}

            <div className="hidden sm:inline-flex border border-[#DCD7CE] rounded-sm overflow-hidden bg-white">
              {(['en', 'id'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSetLanguage(lang)}
                  className={`px-2 py-1 text-[11px] font-medium uppercase cursor-pointer ${
                    language === lang ? 'bg-[#A35047] text-white' : 'text-[#5C615D]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsNewLeadModalOpen(true)}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.newLeadBtn}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              title={isId ? 'Keluar dari CRM' : 'Sign out'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5C615D] hover:text-[#1C211E] bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{isId ? 'Keluar' : 'Sign out'}</span>
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* TAB 3 (DEFAULT): CALCULATOR BUILDER + "WHAT COUPLES SEE" PREVIEW     */}
        {/* =================================================================== */}
        {activeSection === 'calculator' && (
          <div className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Scrollable Configuration Cards */}
              <div className="xl:col-span-7 space-y-6 pb-20">
                {/* Card 1: Your Brand Colors & Fonts */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                        {isId ? 'Tema & Warna Brand' : 'Your brand'}
                      </h2>
                      <p className="text-xs text-[#5C615D]">
                        {isId
                          ? 'Selaras otomatis dengan palet Storefront. Ubah warna atau huruf untuk preview langsung.'
                          : 'Matched to your Storefront palette by default. Pick colors and typefaces styled across your estimator.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateCalcField('brandTheme', INITIAL_CALCULATOR_CONFIG.brandTheme)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-[#A35047] bg-[#FDF9F8] border border-[#E5D5D1] rounded-sm hover:bg-[#F5EAE8] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isId ? 'Reset ke Warna Storefront' : 'Sync Storefront Colors'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(
                      [
                        { key: 'pageBg', label: 'Page background' },
                        { key: 'cardBg', label: 'Cards' },
                        { key: 'textColor', label: 'Text' },
                        { key: 'smallPrintColor', label: 'Small print' },
                        { key: 'accentLineColor', label: 'Accent lines' },
                        { key: 'estimateAccentColor', label: 'Estimate accent' },
                        { key: 'buttonBg', label: 'Buttons' },
                        { key: 'buttonText', label: 'Button text' },
                      ] as const
                    ).map((swatch) => (
                      <label
                        key={swatch.key}
                        className="p-2.5 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="color"
                          value={theme[swatch.key]}
                          onChange={(e) => updateBrandTheme(swatch.key, e.target.value)}
                          className="w-7 h-7 rounded-sm border border-[#DCD7CE] cursor-pointer bg-transparent p-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-[#1C211E] leading-tight">
                            {swatch.label}
                          </div>
                          <div className="text-[10px] text-[#5C615D] uppercase tabular-nums">
                            {theme[swatch.key]}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">Headings font</label>
                      <select
                        value={theme.headingFont}
                        onChange={(e) => updateBrandTheme('headingFont', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Georgia">Georgia Serif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Everything else font
                      </label>
                      <select
                        value={theme.bodyFont}
                        onChange={(e) => updateBrandTheme('bodyFont', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                        <option value="Inter">Inter</option>
                        <option value="system-ui">System Clean Sans</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card 2: Currency & Formatting */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                      {isId ? 'Mata uang & format' : 'Your country'}
                    </h2>
                    <p className="text-xs text-[#5C615D]">
                      {isId
                        ? 'Setiap harga di kalkulator, email, dan halaman studio mengikuti pengaturan ini.'
                        : 'Every price on the calculator, in emails, and on your studio pages follows these settings.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">Currency</label>
                      <select
                        value={calculatorDraft.currencyLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          const sym = val.includes('Rp')
                            ? 'Rp '
                            : val.includes('S$')
                              ? 'S$'
                              : val.includes('CHF')
                                ? 'CHF '
                                : '$';
                          onSaveCalculatorDraft({
                            ...calculatorDraft,
                            currencyLabel: val,
                            customSymbol: sym,
                          });
                        }}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option>Singapore Dollar S$</option>
                        <option>Indonesian Rupiah Rp</option>
                        <option>US dollar $</option>
                        <option>Swiss Franc CHF</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Numbers and dates written like
                      </label>
                      <select
                        value={calculatorDraft.localeFormat}
                        onChange={(e) => updateCalcField('localeFormat', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option>International (1,234.50 · June 12, 2027)</option>
                        <option>United States (1,234.50 · June 12, 2027)</option>
                        <option>Indonesia (1.234,50 · 12 Juni 2027)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Your own symbol (optional)
                      </label>
                      <input
                        type="text"
                        value={calculatorDraft.customSymbol}
                        onChange={(e) => updateCalcField('customSymbol', e.target.value)}
                        placeholder="S$ / Rp / CHF"
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">Symbol goes</label>
                      <select
                        value={calculatorDraft.symbolPosition}
                        onChange={(e) =>
                          updateCalcField(
                            'symbolPosition',
                            e.target.value as 'before' | 'after'
                          )
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option value="before">before the number</option>
                        <option value="after">after the number</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Thousands written with
                      </label>
                      <select
                        value={calculatorDraft.thousandsSeparator}
                        onChange={(e) =>
                          updateCalcField(
                            'thousandsSeparator',
                            e.target.value as 'comma' | 'period' | 'space'
                          )
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      >
                        <option value="comma">a comma: 12,500</option>
                        <option value="period">a period: 12.500</option>
                        <option value="space">a space: 12 500</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card 3: The top of your calculator */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                      {isId ? 'Bagian atas kalkulator Anda' : 'The top of your calculator'}
                    </h2>
                    <p className="text-xs text-[#5C615D]">
                      {isId
                        ? 'Judul yang pertama kali dibaca klien sebelum memilih rangkaian.'
                        : 'The heading couples read first, before they start adding pieces.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Small label above the title
                      </label>
                      <input
                        type="text"
                        value={calculatorDraft.smallLabel}
                        onChange={(e) => updateCalcField('smallLabel', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">Title</label>
                      <input
                        type="text"
                        value={calculatorDraft.title}
                        onChange={(e) => updateCalcField('title', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#4D544F] mb-1.5">
                      Title, italic accent
                    </label>
                    <input
                      type="text"
                      value={calculatorDraft.titleItalic}
                      onChange={(e) => updateCalcField('titleItalic', e.target.value)}
                      className="w-full sm:w-1/2 px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#4D544F] mb-1.5">Intro sentence</label>
                    <textarea
                      rows={2}
                      value={calculatorDraft.introSentence}
                      onChange={(e) => updateCalcField('introSentence', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047] resize-none"
                    />
                  </div>
                </div>

                {/* Card 4: Your pieces and prices (Grouped sections, notes, Rentals, pricing unit, NO FEE) */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                      {isId ? 'Pilihan item & rentang harga' : 'Your pieces and prices'}
                    </h2>
                    <p className="text-xs text-[#5C615D]">
                      {isId
                        ? 'Kelompokkan item per kategori, tentukan satuan harga, biaya properti sewa, atau urutan tampil.'
                        : 'Each section is a heading with pieces underneath. Set low/high range, pricing unit, rentals, or reorder arrows.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {editorSections.map((sec) => {
                      const isRental = calculatorDraft.rentalSections.includes(sec.label);
                      return (
                        <div
                          key={sec.label}
                          className="p-4 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ECE8E1]">
                            <span className="text-xs font-semibold tracking-wider text-[#1C211E] uppercase">
                              {sec.label}
                            </span>
                            <label className="inline-flex items-center gap-1.5 text-xs text-[#4D544F] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isRental}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...calculatorDraft.rentalSections, sec.label]
                                    : calculatorDraft.rentalSections.filter(
                                        (s) => s !== sec.label
                                      );
                                  updateCalcField('rentalSections', next);
                                }}
                                className="accent-[#A35047]"
                              />
                              <span>Rentals</span>
                            </label>
                          </div>

                          <input
                            type="text"
                            value={calculatorDraft.sectionNotes[sec.label] || ''}
                            onChange={(e) =>
                              updateCalcField('sectionNotes', {
                                ...calculatorDraft.sectionNotes,
                                [sec.label]: e.target.value,
                              })
                            }
                            placeholder='Optional note under this section, e.g. "Includes setup"'
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                          />

                          <div className="divide-y divide-[#ECE8E1]">
                            {sec.items.map((piece) => (
                              <div
                                key={piece.id}
                                className="py-2.5 flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={piece.enabled}
                                    onChange={(e) =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, enabled: e.target.checked }
                                            : p
                                        )
                                      )
                                    }
                                    className="accent-[#A35047]"
                                  />
                                  <input
                                    type="text"
                                    value={piece.name}
                                    onChange={(e) =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.map((p) =>
                                          p.id === piece.id ? { ...p, name: e.target.value } : p
                                        )
                                      )
                                    }
                                    className="w-full min-w-[140px] px-2 py-1 text-xs font-medium bg-white border border-[#DCD7CE] rounded-sm"
                                  />
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                  <input
                                    type="number"
                                    value={piece.minPrice}
                                    onChange={(e) =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, minPrice: Number(e.target.value) }
                                            : p
                                        )
                                      )
                                    }
                                    aria-label={`${piece.name} min price`}
                                    className="w-16 px-2 py-1 bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                                  />
                                  <span className="text-[#8A8F8B]">–</span>
                                  <input
                                    type="number"
                                    value={piece.maxPrice}
                                    onChange={(e) =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, maxPrice: Number(e.target.value) }
                                            : p
                                        )
                                      )
                                    }
                                    aria-label={`${piece.name} max price`}
                                    className="w-16 px-2 py-1 bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                                  />
                                  <select
                                    value={piece.pricingUnit || 'each'}
                                    onChange={(e) =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.map((p) =>
                                          p.id === piece.id
                                            ? { ...p, pricingUnit: e.target.value as PricingUnit }
                                            : p
                                        )
                                      )
                                    }
                                    className="px-2 py-1 text-[11px] bg-white border border-[#DCD7CE] rounded-sm"
                                  >
                                    <option value="each">each</option>
                                    <option value="counted">counted</option>
                                    <option value="per-guest">per guest</option>
                                    <option value="per-foot">per foot</option>
                                  </select>
                                  <label
                                    title="Exclude this item from design/delivery fee %"
                                    className="inline-flex items-center gap-1 text-[10px] text-[#5C615D] px-1 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(piece.noFee)}
                                      onChange={(e) =>
                                        updateCalcField(
                                          'pieces',
                                          calculatorDraft.pieces.map((p) =>
                                            p.id === piece.id
                                              ? { ...p, noFee: e.target.checked }
                                              : p
                                          )
                                        )
                                      }
                                      className="accent-[#A35047]"
                                    />
                                    <span>NO FEE</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => movePiece(piece.id, -1)}
                                    aria-label={`Move ${piece.name} up`}
                                    className="p-1 text-[#5C615D] hover:text-[#1C211E] cursor-pointer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => movePiece(piece.id, 1)}
                                    aria-label={`Move ${piece.name} down`}
                                    className="p-1 text-[#5C615D] hover:text-[#1C211E] cursor-pointer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCalcField(
                                        'pieces',
                                        calculatorDraft.pieces.filter((p) => p.id !== piece.id)
                                      )
                                    }
                                    aria-label={`Remove ${piece.name}`}
                                    className="p-1 text-[#8A8F8B] hover:text-[#DC2626] cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Add Piece & Add Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#ECE8E1]">
                    <form
                      onSubmit={(e) => handleAddCalculatorPiece(e)}
                      className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                    >
                      <select
                        value={newPieceGroup}
                        onChange={(e) => setNewPieceGroup(e.target.value)}
                        className="sm:col-span-3 px-2 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      >
                        {editorSections.map((s) => (
                          <option key={s.label} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Add an item (e.g. Welcome Urn)"
                        value={newPieceName}
                        onChange={(e) => setNewPieceName(e.target.value)}
                        className="sm:col-span-4 px-2.5 py-2 border border-[#DCD7CE] rounded-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={newPieceMin}
                        onChange={(e) => setNewPieceMin(Number(e.target.value))}
                        className="sm:col-span-2 px-2 py-2 border border-[#DCD7CE] rounded-sm tabular-nums"
                      />
                      <input
                        type="number"
                        min={0}
                        value={newPieceMax}
                        onChange={(e) => setNewPieceMax(Number(e.target.value))}
                        className="sm:col-span-2 px-2 py-2 border border-[#DCD7CE] rounded-sm tabular-nums"
                      />
                      <button
                        type="submit"
                        className="sm:col-span-1 inline-flex items-center justify-center bg-[#A35047] hover:bg-[#8E433B] text-white rounded-sm cursor-pointer py-2"
                        aria-label="Add piece"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>

                    <form onSubmit={handleAddSection} className="lg:col-span-4 flex gap-1.5 text-xs">
                      <input
                        type="text"
                        placeholder="New section..."
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        className="flex-1 px-2.5 py-2 border border-[#DCD7CE] rounded-sm"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 font-medium text-[#1C211E] bg-[#F2F0EC] hover:bg-[#E5E1D8] border border-[#DCD7CE] rounded-sm whitespace-nowrap cursor-pointer"
                      >
                        + SECTION
                      </button>
                    </form>
                  </div>
                </div>

                {/* Card 5: Your fees & Your minimum */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                      {isId ? 'Biaya desain & minimum proyek' : 'Your fees & minimum'}
                    </h2>
                    <p className="text-xs text-[#5C615D]">
                      {isId
                        ? 'Atur persentase biaya desain/pengiriman dan nilai minimum pemesanan acara.'
                        : 'Configure labor/delivery percentage, unit wording, and your studio minimum.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-[#4D544F] mb-1.5">Fee line label</label>
                      <input
                        type="text"
                        value={calculatorDraft.feeLabel}
                        onChange={(e) => updateCalcField('feeLabel', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Percentage (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={calculatorDraft.feePercent}
                        onChange={(e) => updateCalcField('feePercent', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <label className="inline-flex items-center gap-2 text-xs text-[#1C211E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculatorDraft.hideFeeLine}
                        onChange={(e) => updateCalcField('hideFeeLine', e.target.checked)}
                        className="accent-[#A35047]"
                      />
                      <span>Hide fee line from couples</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-[#1C211E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculatorDraft.neverShowEach}
                        onChange={(e) => updateCalcField('neverShowEach', e.target.checked)}
                        className="accent-[#A35047]"
                      />
                      <span>Never show &quot;each&quot;</span>
                    </label>
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1">
                        Max quantity per item
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={calculatorDraft.maxQtyPerItem}
                        onChange={(e) => updateCalcField('maxQtyPerItem', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#ECE8E1] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Project minimum
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={calculatorDraft.minimumProjectSGD}
                        onChange={(e) =>
                          updateCalcField('minimumProjectSGD', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-[#4D544F] mb-1.5">
                        Message under minimum ({'{minimum}'} inserts amount)
                      </label>
                      <input
                        type="text"
                        value={calculatorDraft.minimumWarning}
                        onChange={(e) => updateCalcField('minimumWarning', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-[#1C211E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorDraft.blockBelowMinimum}
                      onChange={(e) => updateCalcField('blockBelowMinimum', e.target.checked)}
                      className="accent-[#A35047]"
                    />
                    <span>Do not allow sending estimate when total is below minimum</span>
                  </label>
                </div>

                {/* Card 6: The total, buttons, lead form & thank-you copy */}
                <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#1C211E] mb-1">
                      {isId ? 'Ringkasan total, tombol & formulir' : 'Total, buttons & lead form'}
                    </h2>
                    <p className="text-xs text-[#5C615D]">
                      {isId
                        ? 'Kustomisasi teks total, tombol unduh/salin, serta judul formulir kirim prospek.'
                        : 'Customize summary wording, Download/Copy labels, and your client inquiry form.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[#4D544F] mb-1">Subtotal line</label>
                      <input
                        type="text"
                        value={calculatorDraft.subtotalLabel}
                        onChange={(e) => updateCalcField('subtotalLabel', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Total line</label>
                      <input
                        type="text"
                        value={calculatorDraft.totalLabel}
                        onChange={(e) => updateCalcField('totalLabel', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Download button</label>
                      <input
                        type="text"
                        value={calculatorDraft.downloadBtnLabel}
                        onChange={(e) => updateCalcField('downloadBtnLabel', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Copy button</label>
                      <input
                        type="text"
                        value={calculatorDraft.copyBtnLabel}
                        onChange={(e) => updateCalcField('copyBtnLabel', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Lead form heading</label>
                      <input
                        type="text"
                        value={calculatorDraft.leadFormHeading}
                        onChange={(e) => updateCalcField('leadFormHeading', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Send button text</label>
                      <input
                        type="text"
                        value={calculatorDraft.submitBtnText}
                        onChange={(e) => updateCalcField('submitBtnText', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Optional inquiry link text</label>
                      <input
                        type="text"
                        value={calculatorDraft.inquiryBtnText}
                        onChange={(e) => updateCalcField('inquiryBtnText', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4D544F] mb-1">Thank-you heading</label>
                      <input
                        type="text"
                        value={calculatorDraft.thankYouHeading}
                        onChange={(e) => updateCalcField('thankYouHeading', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Publish Bar unified with Storefront Terracotta & Botanical Dark */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePublishClick}
                    className="px-6 py-3 text-xs font-semibold tracking-wide text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm transition-colors cursor-pointer"
                  >
                    PUBLISH TO MY WEBSITE
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraftClick}
                    className="px-6 py-3 text-xs font-semibold tracking-wide text-[#1C211E] bg-white border border-[#1C211E] hover:bg-[#F2F0EC] rounded-sm transition-colors cursor-pointer"
                  >
                    SAVE DRAFT
                  </button>
                  <span className="text-xs text-[#5C615D]">
                    {draftSavedNotice || calculatorDraft.lastPublishedAt}
                  </span>
                </div>
              </div>

              {/* Right Sticky "What couples see — updates as you type" Live Preview */}
              <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-4">
                <div className="flex items-baseline gap-2.5">
                  <h3 className="text-sm font-medium text-[#1C211E]">What couples see</h3>
                  <span className="text-xs text-[#6E726F]">updates as you type</span>
                </div>

                {/* Unified Blush/Terracotta Preview Switcher */}
                <div className="inline-flex items-center gap-1 p-1 bg-[#F5EAE8] border border-[#E6D4D0] rounded-sm">
                  {(
                    [
                      { id: 'calculator', label: 'Calculator' },
                      { id: 'lead-form', label: 'Lead form' },
                      { id: 'thank-you', label: 'Thank-you' },
                    ] as const
                  ).map((tab) => {
                    const active = previewTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPreviewTab(tab.id)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#A35047] text-white'
                            : 'text-[#5C4E4B] hover:text-[#1C211E]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Live Brand-Styled Preview Frame */}
                <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden shadow-xs">
                  <div className="px-5 py-2.5 border-b border-[#EFECE6] text-[11px] text-[#7A7E7B] bg-[#FCFBFA]">
                    Live preview. This is what a couple will see once you publish.
                  </div>

                  <div
                    className="p-6 sm:p-8 max-h-[660px] overflow-y-auto"
                    style={{
                      backgroundColor: theme.pageBg,
                      color: theme.textColor,
                      fontFamily: theme.bodyFont,
                    }}
                  >
                    {previewTab === 'calculator' && (
                      <div className="space-y-6">
                        <div className="text-center space-y-2 pb-2">
                          <div
                            className="text-[10px] tracking-[0.16em] uppercase"
                            style={{ color: theme.smallPrintColor }}
                          >
                            {calculatorDraft.smallLabel}
                          </div>
                          <h4
                            className="text-3xl leading-tight"
                            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                          >
                            {calculatorDraft.title}{' '}
                            <span
                              className="italic"
                              style={{ color: theme.estimateAccentColor }}
                            >
                              {calculatorDraft.titleItalic}
                            </span>
                          </h4>
                          <p
                            className="text-xs leading-relaxed max-w-sm mx-auto"
                            style={{ color: theme.smallPrintColor }}
                          >
                            {calculatorDraft.introSentence}
                          </p>
                        </div>

                        {groupedPreviewPieces.map((grp) => (
                          <div key={grp.label} className="space-y-2">
                            <div
                              className="text-[10px] tracking-[0.14em] uppercase pt-2"
                              style={{ color: theme.smallPrintColor }}
                            >
                              {grp.label}
                            </div>
                            {calculatorDraft.sectionNotes[grp.label] && (
                              <div
                                className="text-[11px]"
                                style={{ color: theme.smallPrintColor }}
                              >
                                {calculatorDraft.sectionNotes[grp.label]}
                              </div>
                            )}
                            <div
                              className="divide-y border-t border-b"
                              style={{ borderColor: theme.accentLineColor }}
                            >
                              {grp.items.map((piece) => {
                                const qty = previewCounts[piece.id] || 0;
                                const unit =
                                  calculatorDraft.neverShowEach &&
                                  (!piece.pricingUnit || piece.pricingUnit === 'each')
                                    ? ''
                                    : piece.pricingUnit === 'counted'
                                      ? ' counted'
                                      : piece.pricingUnit === 'per-guest'
                                        ? ' / guest'
                                        : piece.pricingUnit === 'per-foot'
                                          ? ' / ft'
                                          : ' each';
                                const priceText =
                                  piece.minPrice === piece.maxPrice
                                    ? `${formatCalcMoney(piece.minPrice, calculatorDraft)}${unit}`
                                    : `${formatCalcMoney(piece.minPrice, calculatorDraft)} – ${formatCalcMoney(piece.maxPrice, calculatorDraft)}${unit}`;

                                return (
                                  <div
                                    key={piece.id}
                                    className="py-3.5 flex items-center justify-between gap-4"
                                  >
                                    <div>
                                      <div
                                        className="text-lg"
                                        style={{
                                          fontFamily: theme.headingFont,
                                          color: theme.textColor,
                                        }}
                                      >
                                        {piece.name}
                                      </div>
                                      <div
                                        className="text-[11px] tabular-nums"
                                        style={{ color: theme.smallPrintColor }}
                                      >
                                        {priceText}
                                      </div>
                                    </div>

                                    <div className="inline-flex items-center gap-2.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewCounts((prev) => ({
                                            ...prev,
                                            [piece.id]: Math.max(0, (prev[piece.id] || 0) - 1),
                                          }))
                                        }
                                        className="w-7 h-7 rounded-full border border-[#D8D3CA] bg-white inline-flex items-center justify-center text-[#1C211E] hover:bg-[#F2EFEA] cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs tabular-nums font-medium">
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewCounts((prev) => ({
                                            ...prev,
                                            [piece.id]: Math.min(
                                              calculatorDraft.maxQtyPerItem || 50,
                                              (prev[piece.id] || 0) + 1
                                            ),
                                          }))
                                        }
                                        className="w-7 h-7 rounded-full border border-[#D8D3CA] bg-white inline-flex items-center justify-center text-[#1C211E] hover:bg-[#F2EFEA] cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <div
                          className="p-4 border rounded-lg space-y-3"
                          style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accentLineColor,
                          }}
                        >
                          {!calculatorDraft.hideFeeLine && previewEstimate.feeMax > 0 && (
                            <div
                              className="flex justify-between text-[11px] pb-2 border-b"
                              style={{
                                borderColor: theme.accentLineColor,
                                color: theme.smallPrintColor,
                              }}
                            >
                              <span>
                                {calculatorDraft.feeLabel} ({calculatorDraft.feePercent}%)
                              </span>
                              <span className="tabular-nums">
                                {formatCalcMoney(previewEstimate.feeMin, calculatorDraft)} –{' '}
                                {formatCalcMoney(previewEstimate.feeMax, calculatorDraft)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div
                                className="text-[10px] tracking-wider uppercase"
                                style={{ color: theme.smallPrintColor }}
                              >
                                {calculatorDraft.totalLabel}
                              </div>
                              <div
                                className="text-2xl tabular-nums"
                                style={{
                                  fontFamily: theme.headingFont,
                                  color: theme.estimateAccentColor,
                                }}
                              >
                                {previewEstimate.min === previewEstimate.max
                                  ? formatCalcMoney(previewEstimate.min, calculatorDraft)
                                  : `${formatCalcMoney(previewEstimate.min, calculatorDraft)} – ${formatCalcMoney(previewEstimate.max, calculatorDraft)}`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewTab('lead-form')}
                              style={{
                                backgroundColor: theme.buttonBg,
                                color: theme.buttonText,
                              }}
                              className="px-4 py-2 text-xs font-medium rounded-sm cursor-pointer"
                            >
                              Continue
                            </button>
                          </div>

                          {previewEstimate.belowMin && (
                            <div className="p-2.5 bg-[#FBF1F0] border border-[#EBD2CE] rounded-sm text-[11px] text-[#8C433B] flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>
                                {calculatorDraft.minimumWarning.replace(
                                  '{minimum}',
                                  formatCalcMoney(
                                    calculatorDraft.minimumProjectSGD,
                                    calculatorDraft
                                  )
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {previewTab === 'lead-form' && (
                      <div className="space-y-4">
                        <div className="text-center space-y-1 pb-2">
                          <div
                            className="text-[10px] tracking-[0.16em] uppercase"
                            style={{ color: theme.smallPrintColor }}
                          >
                            {calculatorDraft.smallLabel}
                          </div>
                          <h4
                            className="text-2xl"
                            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                          >
                            {calculatorDraft.leadFormHeading}
                          </h4>
                          <p className="text-xs" style={{ color: theme.smallPrintColor }}>
                            {calculatorDraft.leadFormSubheading}
                          </p>
                        </div>
                        <div
                          className="space-y-3 p-5 rounded-lg border text-xs"
                          style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accentLineColor,
                          }}
                        >
                          <input
                            type="text"
                            disabled
                            placeholder="Partner 1 & Partner 2 / Client Name"
                            className="w-full px-3 py-2 border border-[#DCD7CE] rounded-sm bg-[#FAF9F7]"
                          />
                          <input
                            type="email"
                            disabled
                            placeholder="Email address"
                            className="w-full px-3 py-2 border border-[#DCD7CE] rounded-sm bg-[#FAF9F7]"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              disabled
                              placeholder="Event Date"
                              className="w-full px-3 py-2 border border-[#DCD7CE] rounded-sm bg-[#FAF9F7]"
                            />
                            <input
                              type="text"
                              disabled
                              placeholder="Venue / City"
                              className="w-full px-3 py-2 border border-[#DCD7CE] rounded-sm bg-[#FAF9F7]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewTab('thank-you')}
                            style={{
                              backgroundColor: theme.buttonBg,
                              color: theme.buttonText,
                            }}
                            className="w-full py-2.5 text-xs font-medium rounded-sm cursor-pointer"
                          >
                            {calculatorDraft.submitBtnText}
                          </button>
                        </div>
                      </div>
                    )}

                    {previewTab === 'thank-you' && (
                      <div className="text-center py-8 space-y-3">
                        <CheckCircle2
                          className="w-8 h-8 mx-auto stroke-[1.5]"
                          style={{ color: theme.estimateAccentColor }}
                          aria-hidden="true"
                        />
                        <h4
                          className="text-3xl"
                          style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                        >
                          {calculatorDraft.thankYouHeading}
                        </h4>
                        <p
                          className="text-xs leading-relaxed max-w-xs mx-auto"
                          style={{ color: theme.smallPrintColor }}
                        >
                          {calculatorDraft.thankYouMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 1: EVENTS (BOTANICAL HERO + NEEDS YOU + PIPELINE & PROPOSALS)    */}
        {/* =================================================================== */}
        {activeSection === 'events' && (
          <div className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto space-y-6">
            {/* Editorial Botanical Greeting Banner matching reference screenshot */}
            <div className="relative rounded-xl overflow-hidden border border-[#E5E1D8] min-h-[155px] flex items-end p-6 sm:p-8 bg-[#2D3B32]">
              <div className="absolute inset-0">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Seasonal floral studio banner"
                  fallbackTitle={siteConfig.brandName}
                  className="w-full h-full object-cover opacity-50"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#1C211E]/85 via-[#1C211E]/55 to-[#1C211E]/35"
                />
              </div>
              <div className="relative z-10 text-white space-y-1">
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white">
                  {getGreetingLabel(language)}
                </h2>
                <p className="text-xs text-[#EBE6DF]">
                  {new Date().toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  · {bookedCount} {isId ? 'acara terkonfirmasi' : 'events booked'} ·{' '}
                  {needsYouLeads.length}{' '}
                  {isId ? 'perlu tindak lanjut hari ini' : 'needs your attention'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-1 p-1 bg-[#EAE6DF] rounded-sm">
                <button
                  type="button"
                  onClick={() => setEventsSubView('pipeline')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-sm cursor-pointer ${
                    eventsSubView === 'pipeline'
                      ? 'bg-white text-[#A35047]'
                      : 'text-[#5C615D]'
                  }`}
                >
                  {t.sections.pipeline}
                </button>
                <button
                  type="button"
                  onClick={() => setEventsSubView('proposal')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-sm cursor-pointer ${
                    eventsSubView === 'proposal'
                      ? 'bg-white text-[#A35047]'
                      : 'text-[#5C615D]'
                  }`}
                >
                  {t.sections.proposals}
                </button>
              </div>

              {eventsSubView === 'pipeline' && (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#4D544F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyMoneyOwed}
                      onChange={(e) => setOnlyMoneyOwed(e.target.checked)}
                      className="accent-[#A35047]"
                    />
                    <span>{isId ? 'Ada sisa tagihan' : 'Money owed'}</span>
                  </label>

                  <div className="relative w-60">
                    <Search
                      className="w-3.5 h-3.5 text-[#8A8F8B] absolute left-3 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                    />
                  </div>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as CrmStage | 'all')}
                    className="px-3 py-1.5 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                  >
                    <option value="all">{isId ? 'Semua Tahap' : 'All Stages'}</option>
                    {STAGE_ORDER.map((st) => (
                      <option key={st} value={st}>
                        {t.stages[st]}
                      </option>
                    ))}
                  </select>
                  <div className="inline-flex items-center gap-1 p-1 bg-[#EAE6DF] rounded-sm">
                    <button
                      type="button"
                      onClick={() => setPipelineView('board')}
                      className={`p-1.5 rounded-sm cursor-pointer ${
                        pipelineView === 'board' ? 'bg-white text-[#A35047]' : 'text-[#5C615D]'
                      }`}
                      aria-label={t.boardView}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPipelineView('table')}
                      className={`p-1.5 rounded-sm cursor-pointer ${
                        pipelineView === 'table' ? 'bg-white text-[#A35047]' : 'text-[#5C615D]'
                      }`}
                      aria-label={t.tableView}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewLeadModalOpen(true)}
                    className="px-4 py-1.5 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:border-[#A35047] rounded-sm cursor-pointer"
                  >
                    START A BLANK PROPOSAL
                  </button>
                </div>
              )}
            </div>

            {eventsSubView === 'pipeline' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* "Needs you today" sidebar panel */}
                <div className="lg:col-span-3 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-xl text-[#1C211E]">
                      {isId ? 'Perlu perhatian' : 'Needs you'}
                    </h3>
                    <span className="text-xs text-[#7A7E7B]">today</span>
                  </div>
                  <div className="bg-white border border-[#E5E1D8] rounded-xl divide-y divide-[#EFECE6]">
                    {needsYouLeads.length === 0 ? (
                      <div className="p-4 text-xs text-[#5C615D]">
                        {isId
                          ? 'Semua prospek sudah tertangani.'
                          : 'Nothing needs you today. Enjoy the quiet.'}
                      </div>
                    ) : (
                      needsYouLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => handleOpenProposal(lead.id)}
                          className="w-full text-left p-3.5 hover:bg-[#FDF9F8] transition-colors cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[#A35047]">
                              {t.stages[lead.stage]}
                            </span>
                            <span className="tabular-nums text-[#5C615D]">{lead.eventDate}</span>
                          </div>
                          <div className="text-xs font-medium text-[#1C211E] truncate">
                            {lead.eventTitle}
                          </div>
                          <div className="text-[11px] text-[#5C615D] truncate">
                            {lead.clientName}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Main Events Board / Table */}
                <div className="lg:col-span-9 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C615D]">
                      <span className="font-serif text-xl text-[#1C211E] mr-2">Your events</span>
                      <span>Estimate</span>
                      <span aria-hidden="true">→</span>
                      <span>Lead</span>
                      <span aria-hidden="true">→</span>
                      <span>Proposal</span>
                      <span aria-hidden="true">→</span>
                      <span className="text-[#A35047] font-medium">Contract</span>
                      <span aria-hidden="true">→</span>
                      <span className="text-[#2D3B32] font-medium">Booked</span>
                    </div>
                  </div>

                  {filteredLeads.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-[#E5E1D8] rounded-xl">
                      <p className="font-serif text-xl text-[#1C211E] mb-1">{t.emptyTitle}</p>
                      <p className="text-xs text-[#5C615D] mb-4">{t.emptyDesc}</p>
                      <button
                        type="button"
                        onClick={() => setIsNewLeadModalOpen(true)}
                        className="px-5 py-2 text-xs font-medium text-white bg-[#A35047] rounded-sm cursor-pointer"
                      >
                        {t.newLeadBtn}
                      </button>
                    </div>
                  ) : pipelineView === 'board' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-start">
                      {STAGE_ORDER.map((stage) => {
                        const columnLeads = filteredLeads.filter((l) => l.stage === stage);
                        return (
                          <div
                            key={stage}
                            className="bg-[#EFECE6]/70 border border-[#E5E1D8] rounded-lg p-2.5 space-y-2.5"
                          >
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[11px] font-semibold text-[#1C211E]">
                                {t.stages[stage]}
                              </span>
                              <span className="text-[11px] text-[#5C615D] tabular-nums">
                                {columnLeads.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {columnLeads.map((lead) => (
                                <div
                                  key={lead.id}
                                  className="p-3 bg-white border border-[#E5E1D8] rounded-lg space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-1 text-[10px] text-[#5C615D]">
                                    <span className="tabular-nums">{lead.referenceCode}</span>
                                    <span className="tabular-nums">{lead.eventDate}</span>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProposal(lead.id)}
                                      className="text-left font-medium text-xs text-[#1C211E] hover:text-[#A35047] cursor-pointer leading-snug"
                                    >
                                      {lead.eventTitle}
                                    </button>
                                    <div className="text-[11px] text-[#5C615D] mt-0.5 truncate">
                                      {lead.clientName}
                                    </div>
                                  </div>
                                  <div className="text-xs font-semibold text-[#1C211E] tabular-nums">
                                    {formatPrice(lead.estimatedTotalSGD, currency)}
                                  </div>

                                  <div className="pt-2 border-t border-[#F2F0EC] flex items-center justify-between gap-1">
                                    <select
                                      aria-label={`Stage for ${lead.eventTitle}`}
                                      value={lead.stage}
                                      onChange={(e) =>
                                        handleStageChange(lead, e.target.value as CrmStage)
                                      }
                                      className="text-[10px] px-1 py-1 bg-[#F9F8F6] border border-[#DCD7CE] rounded-sm max-w-[95px]"
                                    >
                                      {STAGE_ORDER.map((st) => (
                                        <option key={st} value={st}>
                                          {t.stages[st]}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProposal(lead.id)}
                                      className="text-[11px] font-medium text-[#A35047] hover:underline cursor-pointer whitespace-nowrap"
                                    >
                                      Proposal
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#E5E1D8] bg-[#FAF9F6] text-[#5C615D]">
                            <th className="py-3 px-4 font-medium">Ref</th>
                            <th className="py-3 px-4 font-medium">Client &amp; Event</th>
                            <th className="py-3 px-4 font-medium">Event Date</th>
                            <th className="py-3 px-4 font-medium">Stage</th>
                            <th className="py-3 px-4 font-medium text-right">Estimate</th>
                            <th className="py-3 px-4 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE6]">
                          {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-[#FAF9F6]">
                              <td className="py-3 px-4 tabular-nums text-[#5C615D]">
                                {lead.referenceCode}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-[#1C211E]">{lead.eventTitle}</div>
                                <div className="text-[#5C615D]">
                                  {lead.clientName} · {lead.venue}
                                </div>
                              </td>
                              <td className="py-3 px-4 tabular-nums">{lead.eventDate}</td>
                              <td className="py-3 px-4">
                                <select
                                  value={lead.stage}
                                  onChange={(e) =>
                                    handleStageChange(lead, e.target.value as CrmStage)
                                  }
                                  className={`px-2 py-1 text-[11px] font-medium border rounded-sm ${STAGE_STYLE[lead.stage]}`}
                                >
                                  {STAGE_ORDER.map((st) => (
                                    <option key={st} value={st}>
                                      {t.stages[st]}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right tabular-nums font-medium">
                                {formatPrice(lead.estimatedTotalSGD, currency)}
                              </td>
                              <td className="py-3 px-4 text-right space-x-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProposal(lead.id)}
                                  className="text-[#A35047] font-medium hover:underline cursor-pointer"
                                >
                                  Open Proposal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteLead(lead.id)}
                                  aria-label={`Delete ${lead.eventTitle}`}
                                  className="text-[#8A8F8B] hover:text-[#DC2626] cursor-pointer align-middle"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Proposal & Digital Contract Studio */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 bg-white border border-[#E5E1D8] rounded-xl overflow-hidden divide-y divide-[#EFECE6]">
                  <div className="p-4 text-xs font-semibold text-[#1C211E] bg-[#FAF9F6]">
                    {isId ? 'Pilih Proposal Klien' : 'Select Client Proposal'}
                  </div>
                  {leads.map((lead) => {
                    const active = activeProposalLead?.id === lead.id;
                    return (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setShowClientPreview(false);
                        }}
                        className={`w-full text-left p-4 transition-colors cursor-pointer ${
                          active ? 'bg-[#FDF4F2] font-medium' : 'hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#5C615D] mb-1">
                          <span className="tabular-nums">{lead.referenceCode}</span>
                          <span>{t.stages[lead.stage]}</span>
                        </div>
                        <div className="text-sm font-medium text-[#1C211E]">{lead.eventTitle}</div>
                        <div className="text-xs text-[#5C615D] flex items-center justify-between mt-1">
                          <span>{lead.clientName}</span>
                          <span className="tabular-nums font-medium text-[#1C211E]">
                            {formatPrice(lead.estimatedTotalSGD, currency)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeProposalLead && (
                  <div className="lg:col-span-8 bg-white border border-[#E5E1D8] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-[#5C615D] tabular-nums">
                          {activeProposalLead.referenceCode} · {activeProposalLead.eventDate}
                        </div>
                        <h3 className="font-serif text-2xl text-[#1C211E]">
                          {activeProposalLead.eventTitle}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const propId = await onPublishProposalLink(activeProposalLead);
                            const shareUrl = `${window.location.origin}/?proposal=${encodeURIComponent(propId)}`;
                            try {
                              await navigator.clipboard.writeText(shareUrl);
                            } catch {
                              // Ignore clipboard permission errors cleanly
                            }
                            setCopiedProposalLinkId(activeProposalLead.id);
                            setTimeout(() => setCopiedProposalLinkId(null), 2400);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F5EAE8] text-[#8C433B] border border-[#E5D5D1] hover:bg-[#EDD8D4] rounded-sm cursor-pointer"
                        >
                          {copiedProposalLinkId === activeProposalLead.id ? (
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {copiedProposalLinkId === activeProposalLead.id
                              ? isId
                                ? 'Link Proposal Tersalin!'
                                : 'Client Link Copied!'
                              : isId
                                ? 'Salin Link Proposal Klien'
                                : 'Copy Client Proposal Link'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClientPreview((prev) => !prev)}
                          className="px-3.5 py-2 text-xs font-medium bg-white border border-[#DCD7CE] hover:bg-[#EFECE6] rounded-sm cursor-pointer"
                        >
                          {showClientPreview ? 'Edit Line Items' : 'Client E-Sign Preview'}
                        </button>
                        {(activeProposalLead.stage === 'estimate' ||
                          activeProposalLead.stage === 'lead') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStageChange(activeProposalLead, 'proposal-sent')
                            }
                            className="px-3.5 py-2 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
                          >
                            Mark Proposal Sent
                          </button>
                        )}
                        {activeProposalLead.stage !== 'booked' && (
                          <button
                            type="button"
                            onClick={() => handleMarkDepositPaid(activeProposalLead)}
                            className="px-3.5 py-2 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
                          >
                            Mark Deposit Paid (Book)
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-[#EFECE6] text-xs">
                        <div>
                          <span className="text-[#5C615D] block mb-0.5">Client</span>
                          <span className="font-medium text-[#1C211E]">
                            {activeProposalLead.clientName}
                          </span>
                          <div className="text-[#5C615D]">{activeProposalLead.clientPhone}</div>
                        </div>
                        <div>
                          <span className="text-[#5C615D] block mb-0.5">Venue &amp; Palette</span>
                          <span className="font-medium text-[#1C211E]">
                            {activeProposalLead.venue}
                          </span>
                          <div className="text-[#5C615D]">{activeProposalLead.palette}</div>
                        </div>
                        <div>
                          <span className="text-[#5C615D] block mb-0.5">Status &amp; Retainer</span>
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-medium border rounded-sm ${STAGE_STYLE[activeProposalLead.stage]}`}
                          >
                            {t.stages[activeProposalLead.stage]}
                          </span>
                          <div className="text-[#5C615D] tabular-nums mt-1">
                            Paid: {formatPrice(activeProposalLead.depositPaidSGD, currency)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-[#1C211E]">
                          Floral Proposal Breakdown
                        </h4>
                        <div className="border border-[#E5E1D8] rounded-lg divide-y divide-[#EFECE6]">
                          {activeProposalLead.lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 flex items-start justify-between gap-4 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-medium text-sm text-[#1C211E]">
                                  {item.quantity}x {item.title}
                                </div>
                                <div className="text-[#5C615D] mt-0.5">{item.description}</div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-medium text-sm tabular-nums text-[#1C211E]">
                                  {formatPrice(item.quantity * item.unitPriceSGD, currency)}
                                </span>
                                {!showClientPreview && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLineItem(item.id)}
                                    className="text-[#8A8F8B] hover:text-[#DC2626] cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-baseline justify-between pt-2">
                          <span className="text-xs font-medium text-[#5C615D]">
                            Proposal Total (50% Retainer to Book)
                          </span>
                          <span className="font-serif text-2xl text-[#1C211E] tabular-nums">
                            {formatPrice(activeProposalLead.estimatedTotalSGD, currency)}
                          </span>
                        </div>
                      </div>

                      {showClientPreview ? (
                        <div className="p-5 bg-[#FAF9F6] border border-[#DCD7CE] rounded-lg space-y-4">
                          <h4 className="font-serif text-xl text-[#1C211E]">
                            Digital Floral Services Contract
                          </h4>
                          <p className="text-xs text-[#4D544F] leading-relaxed">
                            By signing below, {activeProposalLead.clientName} confirms the floral
                            scope above for {activeProposalLead.eventDate} at{' '}
                            {activeProposalLead.venue}.
                          </p>
                          {activeProposalLead.contractSignedBy ? (
                            <div className="p-3 bg-[#ECF5EF] border border-[#C5DFCD] rounded-sm flex items-center gap-2.5 text-xs text-[#166534]">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>
                                Signed digitally by{' '}
                                <strong>{activeProposalLead.contractSignedBy}</strong> on{' '}
                                {activeProposalLead.contractSignedAt?.split('T')[0]}
                              </span>
                            </div>
                          ) : (
                            <form
                              onSubmit={handleClientSignContract}
                              className="flex flex-col sm:flex-row gap-3"
                            >
                              <input
                                type="text"
                                required
                                value={signatureInput}
                                onChange={(e) => setSignatureInput(e.target.value)}
                                placeholder="Type full legal name to e-sign..."
                                className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                              />
                              <button
                                type="submit"
                                className="px-5 py-2 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
                              >
                                Sign &amp; Accept
                              </button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <form
                          onSubmit={handleAddLineItem}
                          className="p-4 bg-[#FAF9F6] border border-[#E5E1D8] rounded-lg space-y-3"
                        >
                          <div className="text-xs font-medium text-[#1C211E]">
                            Add Proposal Line Item
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <input
                              type="text"
                              required
                              placeholder="Item title"
                              value={newLineTitle}
                              onChange={(e) => setNewLineTitle(e.target.value)}
                              className="sm:col-span-5 px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newLineDesc}
                              onChange={(e) => setNewLineDesc(e.target.value)}
                              className="sm:col-span-4 px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                            />
                            <input
                              type="number"
                              min={1}
                              value={newLineQty}
                              onChange={(e) => setNewLineQty(Number(e.target.value))}
                              className="sm:col-span-1 px-2 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                            />
                            <input
                              type="number"
                              min={0}
                              value={newLinePrice}
                              onChange={(e) => setNewLinePrice(Number(e.target.value))}
                              className="sm:col-span-2 px-2 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                            />
                          </div>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:bg-[#EFECE6] rounded-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Item</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CALENDAR (TODAY BUTTON + COMING UP BOOKED EVENTS PANEL)       */}
        {/* =================================================================== */}
        {activeSection === 'calendar' && (
          <div className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                  }
                  className="w-9 h-9 inline-flex items-center justify-center bg-white border border-[#DCD7CE] rounded-full hover:bg-[#F2F0EC] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-serif text-3xl text-[#1C211E]">
                  {calendarDate.toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                  }
                  className="w-9 h-9 inline-flex items-center justify-center bg-white border border-[#DCD7CE] rounded-full hover:bg-[#F2F0EC] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setCalendarDate(new Date(now.getFullYear(), now.getMonth(), 1));
                  }}
                  className="text-xs font-medium text-[#A35047] underline underline-offset-4 ml-1 cursor-pointer"
                >
                  {isId ? 'Hari ini' : 'Today'}
                </button>
              </div>
              <p className="text-xs text-[#5C615D]">
                {isId
                  ? 'Klik acara di kalender untuk membuka proposal.'
                  : 'Click any event card on the calendar to open its proposal.'}
              </p>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[#E5E1D8] bg-[#F5EAE8] text-[11px] font-medium text-[#6B5A57]">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                  <div key={d} className="py-2.5 px-3 text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 divide-x divide-y divide-[#EFECE6]">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = cell.dateStr
                    ? leads.filter((l) => l.eventDate === cell.dateStr)
                    : [];
                  const isToday = cell.dateStr === todayIso;
                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] p-2 ${
                        isToday
                          ? 'bg-[#FDF2F0]'
                          : cell.day
                            ? 'bg-white'
                            : 'bg-[#FAF9F7]'
                      }`}
                    >
                      {cell.day && (
                        <>
                          <div
                            className={`text-xs font-medium tabular-nums mb-1.5 ${
                              isToday ? 'text-[#A35047] font-semibold' : 'text-[#5C615D]'
                            }`}
                          >
                            {cell.day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.map((ev) => (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => handleOpenProposal(ev.id)}
                                className={`w-full text-left px-2 py-1 text-[11px] rounded-sm border truncate cursor-pointer ${STAGE_STYLE[ev.stage]}`}
                              >
                                {ev.eventTitle}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coming Up Booked Events Panel */}
            <div className="bg-white border border-[#E5E1D8] rounded-xl p-6 space-y-4">
              <h3 className="font-serif text-2xl text-[#1C211E]">
                {isId ? 'Acara Mendatang' : 'Coming up'}
              </h3>
              {upcomingBooked.length === 0 ? (
                <p className="text-xs text-[#5C615D]">
                  {isId
                    ? 'Belum ada acara berbayar atau kontrak ditandatangani.'
                    : 'Nothing booked yet. A wedding or event appears here once the contract is signed.'}
                </p>
              ) : (
                <div className="divide-y divide-[#EFECE6]">
                  {upcomingBooked.map((ev) => (
                    <div
                      key={ev.id}
                      className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-medium text-sm text-[#1C211E]">{ev.eventTitle}</div>
                        <div className="text-[#5C615D]">
                          {ev.eventDate} · {ev.clientName} · {ev.venue}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold tabular-nums text-[#1C211E]">
                          {formatPrice(ev.estimatedTotalSGD, currency)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenProposal(ev.id)}
                          className="text-[#A35047] font-medium hover:underline cursor-pointer"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: NUMBERS (FINANCIAL LEDGER + STEM COUNTER + ORDERS + CLIENTS) */}
        {/* =================================================================== */}
        {activeSection === 'numbers' && (
          <div className="flex-1 p-4 sm:p-8 max-w-[1360px] w-full mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'this-month', label: isId ? 'Bulan ini' : 'This month' },
                    { id: 'last-month', label: isId ? 'Bulan lalu' : 'Last month' },
                    { id: 'ytd', label: isId ? 'Tahun berjalan' : 'Year to date' },
                    { id: 'all', label: isId ? 'Semua waktu' : 'All time' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setReportPeriod(p.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-sm border cursor-pointer ${
                      reportPeriod === p.id
                        ? 'bg-[#A35047] text-white border-[#A35047]'
                        : 'bg-white text-[#5C615D] border-[#DCD7CE] hover:text-[#1C211E]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportFinancialCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-white border border-[#DCD7CE] hover:bg-[#EFECE6] rounded-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT OR SAVE AS PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-5 bg-[#2D3B32] text-white rounded-xl">
                <div className="text-xs text-[#D5DDD8] mb-1">
                  {isId ? 'Dana Diterima' : 'Money received'}
                </div>
                <div className="font-serif text-3xl tabular-nums">
                  {formatPrice(financialLedger.moneyReceived, currency)}
                </div>
                <div className="text-[11px] text-[#C5D1CA] mt-1 tabular-nums">
                  {financialLedger.paymentCount} {isId ? 'pembayaran' : 'payments'}
                </div>
              </div>
              <div className="p-5 bg-white border border-[#E5E1D8] rounded-xl">
                <div className="text-xs text-[#5C615D] mb-1">{t.kpis.pipelineValue}</div>
                <div className="font-serif text-3xl text-[#1C211E] tabular-nums">
                  {formatPrice(kpis.pipelineValue, currency)}
                </div>
              </div>
              <div className="p-5 bg-white border border-[#E5E1D8] rounded-xl">
                <div className="text-xs text-[#5C615D] mb-1">
                  {isId ? 'Sisa Tagihan Klien' : 'Balance owed'}
                </div>
                <div className="font-serif text-3xl text-[#A35047] tabular-nums">
                  {formatPrice(financialLedger.outstandingBalance, currency)}
                </div>
              </div>
              <div className="p-5 bg-white border border-[#E5E1D8] rounded-xl">
                <div className="text-xs text-[#5C615D] mb-1">{t.kpis.stemsNeeded}</div>
                <div className="font-serif text-3xl text-[#1C211E] tabular-nums">
                  {kpis.totalStems}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE6DF] rounded-sm w-fit">
              {(
                [
                  { id: 'financial', label: isId ? 'Ringkasan Keuangan' : 'Financial Ledger' },
                  { id: 'stems', label: t.sections.stems },
                  { id: 'orders', label: t.sections.orders },
                  { id: 'clients', label: t.sections.clients },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setNumbersTab(tab.id)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-sm cursor-pointer ${
                    numbersTab === tab.id ? 'bg-white text-[#A35047]' : 'text-[#5C615D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {numbersTab === 'financial' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#E5E1D8] rounded-xl p-6 space-y-4">
                  <h3 className="font-serif text-2xl text-[#1C211E]">
                    {isId ? 'Rincian Sumber Pendapatan' : 'What it was for'}
                  </h3>
                  <div className="divide-y divide-[#EFECE6] text-xs">
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Event &amp; Wedding Retainers</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(financialLedger.retainersReceived, currency)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Confirmed Wedding Payments</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(financialLedger.weddingPaymentsReceived, currency)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Storefront À La Carte Orders</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(financialLedger.storefrontOrdersTotal, currency)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Floral Subscriptions</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(financialLedger.subscriptionsTotal, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-[#E5E1D8] rounded-xl p-6 space-y-4">
                  <h3 className="font-serif text-2xl text-[#1C211E]">
                    {isId ? 'Dari pembayaran ke rekening' : 'From received to your bank'}
                  </h3>
                  <div className="divide-y divide-[#EFECE6] text-xs">
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Money received</span>
                      <span className="font-medium tabular-nums">
                        {formatPrice(financialLedger.moneyReceived, currency)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#4D544F]">Estimated card processing (~2.9%)</span>
                      <span className="font-medium tabular-nums text-[#8C433B]">
                        -{formatPrice(financialLedger.processingFees, currency)}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between font-semibold text-sm">
                      <span className="text-[#1C211E]">Net estimated payout</span>
                      <span className="tabular-nums text-[#2D3B32]">
                        {formatPrice(financialLedger.netToBank, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {numbersTab === 'stems' && (
              <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E5E1D8] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl text-[#1C211E]">
                      Wholesale Stem Counter &amp; Market Prep
                    </h3>
                    <p className="text-xs text-[#5C615D]">
                      Aggregated across all active estimates and booked events.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMarketList}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
                  >
                    {copiedMarketList ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedMarketList ? 'Copied!' : 'Copy Market List'}</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E1D8] bg-[#FAF9F6] text-[#5C615D]">
                        <th className="py-3 px-6 font-medium">Bloom / Foliage</th>
                        <th className="py-3 px-4 font-medium">Origin</th>
                        <th className="py-3 px-4 font-medium text-right">Total Stems</th>
                        <th className="py-3 px-4 font-medium text-right">Est. Bunches</th>
                        <th className="py-3 px-6 font-medium text-right">Retail Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6]">
                      {stemAggregation.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-3 px-6 font-medium text-[#1C211E]">
                            {language === 'en' ? row.nameEn : row.nameId}
                          </td>
                          <td className="py-3 px-4 text-[#5C615D]">{row.originNote}</td>
                          <td className="py-3 px-4 text-right tabular-nums font-medium">
                            {row.count}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-[#5C615D]">
                            {row.bunches}
                          </td>
                          <td className="py-3 px-6 text-right tabular-nums font-medium">
                            {formatPrice(row.subtotalSGD, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {numbersTab === 'orders' && (
              <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E1D8] bg-[#FAF9F6] text-[#5C615D]">
                      <th className="py-3 px-6 font-medium">Order #</th>
                      <th className="py-3 px-4 font-medium">Customer &amp; Recipient</th>
                      <th className="py-3 px-4 font-medium">Items</th>
                      <th className="py-3 px-4 font-medium">Delivery Slot</th>
                      <th className="py-3 px-6 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {orders.map((ord) => (
                      <tr key={ord.orderNumber} className="hover:bg-[#FAF9F6]">
                        <td className="py-3.5 px-6 font-medium tabular-nums">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#1C211E]">{ord.customerName}</div>
                          <div className="text-[#5C615D]">
                            To: {ord.recipientName} · {ord.deliveryAddress}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.items.map((item) => (
                            <div key={item.cartItemId}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-[#5C615D]">
                          {ord.deliverySlot}
                        </td>
                        <td className="py-3.5 px-6 text-right tabular-nums font-medium">
                          {formatPrice(ord.totalSGD, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {numbersTab === 'clients' && (
              <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E5E1D8] flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-[#1C211E]">{t.sections.clients}</h3>
                  <button
                    type="button"
                    onClick={handleExportClientsCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:bg-[#EFECE6] rounded-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.exportCsv}</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E1D8] bg-[#FAF9F6] text-[#5C615D]">
                        <th className="py-3 px-6 font-medium">Client</th>
                        <th className="py-3 px-4 font-medium">Email &amp; Phone</th>
                        <th className="py-3 px-4 font-medium text-right">Records</th>
                        <th className="py-3 px-4 font-medium">Latest Date</th>
                        <th className="py-3 px-6 font-medium text-right">Lifetime Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6]">
                      {clientDirectory.map((client) => (
                        <tr key={client.email} className="hover:bg-[#FAF9F6]">
                          <td className="py-3.5 px-6 font-medium text-[#1C211E]">
                            {client.name}
                          </td>
                          <td className="py-3.5 px-4 text-[#5C615D]">
                            <div>{client.email}</div>
                            <div className="tabular-nums">{client.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums">
                            {client.projectsCount}
                          </td>
                          <td className="py-3.5 px-4 tabular-nums text-[#5C615D]">
                            {client.latestDate}
                          </td>
                          <td className="py-3.5 px-6 text-right tabular-nums font-medium">
                            {formatPrice(client.totalSpendSGD, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: STUDIO SETTINGS & ACCOUNT                                     */}
        {/* =================================================================== */}
        {activeSection === 'studio' && (
          <div className="flex-1 p-4 sm:p-8 max-w-[1000px] w-full mx-auto space-y-6">
            <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-serif text-3xl text-[#1C211E]">Studio Profile &amp; Account</h2>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#A35047] bg-[#FDF9F8] border border-[#E5D5D1] rounded-sm hover:bg-[#F5EAE8] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isId ? 'Keluar dari Akun' : 'Sign out'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg">
                  <div className="text-[#5C615D] mb-1">Brand Name</div>
                  <div className="text-sm font-medium text-[#1C211E]">{siteConfig.brandName}</div>
                </div>
                <div className="p-4 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg">
                  <div className="text-[#5C615D] mb-1">Signed-In Studio Account</div>
                  <div className="text-sm font-medium text-[#1C211E] truncate">
                    {userEmail || siteConfig.contactEmail}
                  </div>
                </div>
                <div className="p-4 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg">
                  <div className="text-[#5C615D] mb-1">Concierge Email</div>
                  <div className="text-sm font-medium text-[#1C211E]">
                    {siteConfig.contactEmail}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="text-xs text-[#5C615D]">Active Display Currency:</span>
                {(['SGD', 'IDR', 'USD'] as CurrencyCode[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => onSetCurrency(curr)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-sm border cursor-pointer ${
                      currency === curr
                        ? 'bg-[#A35047] text-white border-[#A35047]'
                        : 'bg-white text-[#1C211E] border-[#DCD7CE]'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#1C211E] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2D3B32]" aria-hidden="true" />
                    <span>
                      {isId ? 'Kontrol Akses Email Tim Studio' : 'Studio Team Access & Allowlist'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#5C615D] mt-1 leading-relaxed">
                    {isId
                      ? 'Aktifkan pembatasan agar hanya email tim Google tertentu yang dapat membuka halaman Studio CRM.'
                      : 'Restrict Studio CRM entry so only approved Google Workspace or studio team emails can open workspace views.'}
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1C211E] cursor-pointer shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={studioAccess.restrictToAllowedEmails}
                    onChange={(e) =>
                      onUpdateStudioAccess({
                        ...studioAccess,
                        restrictToAllowedEmails: e.target.checked,
                      })
                    }
                    className="accent-[#A35047]"
                  />
                  <span>{isId ? 'Aktifkan Whitelist' : 'Enforce Allowlist'}</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {studioAccess.allowedEmails.map((email) => (
                  <div
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F7] border border-[#E5E1D8] rounded-sm text-xs text-[#1C211E]"
                  >
                    <span>{email}</span>
                    {email.toLowerCase() !== siteConfig.studioOwnerEmail.toLowerCase() && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStudioAccess({
                            ...studioAccess,
                            allowedEmails: studioAccess.allowedEmails.filter((item) => item !== email),
                          })
                        }
                        aria-label={`Remove ${email}`}
                        className="text-[#8A8F8B] hover:text-[#DC2626] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleaned = newAllowedEmail.trim().toLowerCase();
                  if (!cleaned || !cleaned.includes('@')) return;
                  if (!studioAccess.allowedEmails.some((item) => item.toLowerCase() === cleaned)) {
                    onUpdateStudioAccess({
                      ...studioAccess,
                      allowedEmails: [...studioAccess.allowedEmails, cleaned],
                    });
                  }
                  setNewAllowedEmail('');
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md"
              >
                <input
                  type="email"
                  value={newAllowedEmail}
                  onChange={(e) => setNewAllowedEmail(e.target.value)}
                  placeholder="florist-team@yourdomain.com"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD7CE] rounded-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer whitespace-nowrap"
                >
                  {isId ? '+ Tambah Email' : '+ Add Team Email'}
                </button>
              </form>
            </div>

            <div className="p-6 bg-white border border-[#E5E1D8] rounded-xl space-y-3">
              <h3 className="font-serif text-2xl text-[#1C211E]">
                Independent Website Embed &amp; Sync
              </h3>
              <p className="text-xs text-[#5C615D] leading-relaxed">
                Any changes published from the <strong>CALCULATOR</strong> tab update the public
                Storefront estimator immediately. To connect an external independent backend, set{' '}
                <code>webhookEndpoint</code> inside <code>src/config/siteConfig.ts</code>.
              </p>
              <button
                type="button"
                onClick={onBackToStorefront}
                className="px-5 py-2.5 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm cursor-pointer"
              >
                Open Live Storefront
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C211E]/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsNewLeadModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#F9F8F6] border border-[#E5E1D8] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#1C211E]">
                {isId ? 'Tambah Prospek CRM Baru' : 'Add New CRM Lead'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center text-[#5C615D] hover:text-[#1C211E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLeadSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.clientName}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.clientPhone}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({ ...f, clientPhone: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newLeadForm.clientEmail}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({ ...f, clientEmail: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeadForm.eventDate}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({ ...f, eventDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Event / Project Title *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.eventTitle}
                  onChange={(e) =>
                    setNewLeadForm((f) => ({ ...f, eventTitle: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={newLeadForm.venue}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({ ...f, venue: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Estimated Value (SGD)</label>
                  <input
                    type="number"
                    min={0}
                    value={newLeadForm.estimatedTotalSGD}
                    onChange={(e) =>
                      setNewLeadForm((f) => ({
                        ...f,
                        estimatedTotalSGD: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Studio Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.studioNotes}
                  onChange={(e) =>
                    setNewLeadForm((f) => ({ ...f, studioNotes: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-[#DCD7CE] rounded-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
              >
                {isId ? 'Simpan Prospek' : 'Create CRM Lead'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
