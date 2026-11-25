import { ArrowLeft, Calendar, CheckCircle2, FileSignature, Flower2, MapPin, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { formatPrice, siteConfig } from '../config/siteConfig';
import { CrmLead, CurrencyCode, Language, PublicProposalData } from '../types/store';

interface ClientProposalViewProps {
  proposalId: string;
  language: Language;
  currency: CurrencyCode;
  localLeads: CrmLead[];
  onSetLanguage: (lang: Language) => void;
  onSetCurrency: (curr: CurrencyCode) => void;
  onFetchProposalFromCloud: (id: string) => Promise<PublicProposalData | null>;
  onSignProposalInCloud: (id: string, signatureName: string) => Promise<void>;
  onSignLocalLead?: (leadId: string, signatureName: string) => void;
  onReturnToStorefront: () => void;
}

export function ClientProposalView({
  proposalId,
  language,
  currency,
  localLeads,
  onSetLanguage,
  onSetCurrency,
  onFetchProposalFromCloud,
  onSignProposalInCloud,
  onSignLocalLead,
  onReturnToStorefront,
}: ClientProposalViewProps) {
  const isId = language === 'id';
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<PublicProposalData | null>(null);
  const [signatureInput, setSignatureInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const remote = await onFetchProposalFromCloud(proposalId);
      if (!mounted) return;
      if (remote) {
        setProposal(remote);
        setLoading(false);
        return;
      }
      // Graceful fallback to local studio lead if previewed in same browser before cloud publish
      const localMatch = localLeads.find((l) => l.id === proposalId);
      if (localMatch) {
        setProposal({
          id: localMatch.id,
          ownerId: 'local-studio',
          studioName: siteConfig.brandName,
          referenceCode: localMatch.referenceCode,
          clientFirstName: localMatch.clientName.split(' ')[0] || localMatch.clientName,
          eventTitle: localMatch.eventTitle,
          eventDate: localMatch.eventDate,
          venue: localMatch.venue,
          palette: localMatch.palette,
          estimatedTotalSGD: localMatch.estimatedTotalSGD,
          depositPaidSGD: localMatch.depositPaidSGD,
          stage: localMatch.stage,
          lineItems: localMatch.lineItems,
          contractSignedBy: localMatch.contractSignedBy,
          contractSignedAt: localMatch.contractSignedAt,
          createdAt: localMatch.createdAt,
          updatedAt: localMatch.createdAt,
        });
      }
      setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [proposalId, onFetchProposalFromCloud, localLeads]);

  const handleSignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = signatureInput.trim();
    if (cleaned.length < 2 || !proposal) return;

    setIsSubmitting(true);
    setSignError(null);
    try {
      const signedAt = new Date().toISOString();
      if (proposal.ownerId !== 'local-studio') {
        await onSignProposalInCloud(proposal.id, cleaned);
      }
      onSignLocalLead?.(proposal.id, cleaned);
      setProposal((prev) =>
        prev
          ? {
              ...prev,
              stage: 'contract-signed',
              contractSignedBy: cleaned,
              contractSignedAt: signedAt,
            }
          : null
      );
      setSignatureInput('');
    } catch {
      setSignError(
        isId
          ? 'Gagal menyimpan tanda tangan. Pastikan koneksi internet stabil dan coba lagi.'
          : 'Unable to record signature right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C211E] flex flex-col">
      {/* Client Portal Top Header */}
      <header className="bg-white border-b border-[#E5E1D8] px-4 sm:px-8 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={onReturnToStorefront}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1C211E] hover:text-[#A35047] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isId ? 'Kembali ke Storefront' : 'Back to Storefront'}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="inline-flex border border-[#DCD7CE] rounded-sm overflow-hidden bg-white">
            {(['SGD', 'IDR', 'USD'] as CurrencyCode[]).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onSetCurrency(curr)}
                className={`px-2.5 py-1 text-[11px] font-medium cursor-pointer ${
                  currency === curr ? 'bg-[#2D3B32] text-white' : 'text-[#5C615D]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <div className="inline-flex border border-[#DCD7CE] rounded-sm overflow-hidden bg-white">
            {(['en', 'id'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onSetLanguage(lang)}
                className={`px-2.5 py-1 text-[11px] font-medium uppercase cursor-pointer ${
                  language === lang ? 'bg-[#A35047] text-white' : 'text-[#5C615D]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {loading ? (
          <div className="bg-white border border-[#E5E1D8] rounded-xl p-12 text-center space-y-3">
            <div className="w-7 h-7 border-2 border-[#E5D5D1] border-t-[#A35047] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#5C615D]">
              {isId ? 'Memuat proposal floral...' : 'Loading bespoke floral proposal...'}
            </p>
          </div>
        ) : !proposal ? (
          <div className="bg-white border border-[#E5E1D8] rounded-xl p-10 text-center space-y-4">
            <Flower2 className="w-8 h-8 text-[#A35047] mx-auto" aria-hidden="true" />
            <h1 className="font-serif text-3xl text-[#1C211E]">
              {isId ? 'Proposal Tidak Ditemukan' : 'Proposal Not Found'}
            </h1>
            <p className="text-sm text-[#5C615D] max-w-md mx-auto">
              {isId
                ? 'Tautan proposal ini mungkin belum dipublikasikan oleh studio atau sudah kedaluwarsa.'
                : 'This proposal link has not been published yet or is no longer available.'}
            </p>
            <button
              type="button"
              onClick={onReturnToStorefront}
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#A35047] hover:bg-[#8E433B] rounded-sm cursor-pointer"
            >
              {isId ? 'Kembali ke Beranda' : 'Explore Collections'}
            </button>
          </div>
        ) : (
          <article className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden shadow-xs">
            {/* Editorial Title Banner */}
            <div className="bg-[#F5EAE8] border-b border-[#E5D5D1] px-6 sm:px-10 py-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-[#8C433B]">
                <span>
                  {proposal.studioName} · {isId ? 'Proposal Resmi Klien' : 'Bespoke Client Proposal'}
                </span>
                <span className="tabular-nums font-medium">{proposal.referenceCode}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C211E] leading-tight">
                {proposal.eventTitle}
              </h1>
              <p className="text-xs text-[#4D544F]">
                {isId
                  ? `Disiapkan khusus untuk ${proposal.clientFirstName}`
                  : `Prepared for ${proposal.clientFirstName}`}
              </p>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* Event Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF9F7] border border-[#E5E1D8] rounded-lg text-xs">
                <div className="space-y-1">
                  <div className="text-[#5C615D] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A35047]" aria-hidden="true" />
                    <span>{isId ? 'Tanggal Acara' : 'Event Date'}</span>
                  </div>
                  <div className="font-medium text-sm text-[#1C211E] tabular-nums">
                    {proposal.eventDate}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#5C615D] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A35047]" aria-hidden="true" />
                    <span>{isId ? 'Lokasi' : 'Venue & Setting'}</span>
                  </div>
                  <div className="font-medium text-sm text-[#1C211E]">{proposal.venue}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#5C615D] flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-[#A35047]" aria-hidden="true" />
                    <span>{isId ? 'Palet Warna' : 'Colour Direction'}</span>
                  </div>
                  <div className="font-medium text-sm text-[#1C211E]">{proposal.palette}</div>
                </div>
              </div>

              {/* Floral Scope Breakdown */}
              <div className="space-y-3">
                <h2 className="font-serif text-2xl text-[#1C211E]">
                  {isId ? 'Rincian Rangkaian & Layanan' : 'Floral Scope & Investment'}
                </h2>
                <div className="border border-[#E5E1D8] rounded-lg divide-y divide-[#EFECE6]">
                  {proposal.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#1C211E]">
                          {item.quantity}x {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[#5C615D] mt-0.5 leading-relaxed">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#1C211E] tabular-nums shrink-0">
                        {formatPrice(item.quantity * item.unitPriceSGD, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-t border-[#E5E1D8]">
                  <div className="text-xs text-[#5C615D]">
                    <div>
                      {isId
                        ? 'Uang muka (Retainer 50% untuk mengunci tanggal)'
                        : '50% Retainer required upon approval to reserve date'}
                    </div>
                    <div className="tabular-nums font-medium text-[#1C211E] mt-0.5">
                      {isId ? 'Retainer:' : 'Retainer:'}{' '}
                      {formatPrice(Math.round(proposal.estimatedTotalSGD * 0.5), currency)}
                      {proposal.depositPaidSGD > 0 && (
                        <span className="text-[#166534] ml-2">
                          ({isId ? 'Sudah dibayar' : 'Paid'}:{' '}
                          {formatPrice(proposal.depositPaidSGD, currency)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-[#5C615D]">
                      {isId ? 'Total Estimasi Proposal' : 'Proposal Total'}
                    </div>
                    <div className="font-serif text-3xl text-[#A35047] tabular-nums">
                      {formatPrice(proposal.estimatedTotalSGD, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Agreement & E-Signature */}
              <div className="p-6 bg-[#FAF9F7] border border-[#DCD7CE] rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-[#1C211E]">
                  <FileSignature className="w-5 h-5 text-[#A35047]" aria-hidden="true" />
                  <h3 className="font-serif text-2xl">
                    {isId ? 'Persetujuan Kontrak Digital' : 'Digital Floral Services Agreement'}
                  </h3>
                </div>

                <p className="text-xs text-[#4D544F] leading-relaxed">
                  {isId
                    ? `Dengan menandatangani di bawah ini, Anda menyetujui rincian rangkaian bunga di atas untuk ${proposal.eventDate} di ${proposal.venue}. Musiman bunga tetap disesuaikan untuk menjaga kualitas estetika terbaik.`
                    : `By typing your full legal name below, you approve the floral design scope above for ${proposal.eventDate} at ${proposal.venue}. Seasonal stem substitutions of equal aesthetic value apply only when market harvests require.`}
                </p>

                {proposal.contractSignedBy ? (
                  <div className="p-4 bg-[#ECF5EF] border border-[#C5DFCD] rounded-md flex items-start gap-3 text-xs text-[#166534]">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">
                        {isId ? 'Kontrak Telah Ditandatangani Secara Digital' : 'Proposal Approved & E-Signed'}
                      </div>
                      <div>
                        {isId ? 'Ditandatangani oleh' : 'Signed by'}:{' '}
                        <strong>{proposal.contractSignedBy}</strong>{' '}
                        {proposal.contractSignedAt && (
                          <span className="tabular-nums">
                            ({proposal.contractSignedAt.split('T')[0]})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignSubmit} className="space-y-3">
                    {signError && (
                      <div className="p-3 bg-[#FBF1F0] border border-[#EBD2CE] text-xs text-[#8C433B] rounded-sm">
                        {signError}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={120}
                        value={signatureInput}
                        onChange={(e) => setSignatureInput(e.target.value)}
                        placeholder={
                          isId
                            ? 'Ketik nama lengkap Anda untuk menyetujui...'
                            : 'Type your full legal name to e-sign...'
                        }
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#A35047]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-xs font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] disabled:opacity-50 rounded-sm cursor-pointer whitespace-nowrap min-h-[42px]"
                      >
                        {isSubmitting
                          ? isId
                            ? 'Menyimpan...'
                            : 'Recording...'
                          : isId
                            ? 'Setujui & Tanda Tangan'
                            : 'Sign & Accept Proposal'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2 flex items-center gap-2 text-[11px] text-[#5C615D]">
                  <ShieldCheck className="w-4 h-4 text-[#2D3B32] shrink-0" aria-hidden="true" />
                  <span>
                    {isId
                      ? 'Dokumen proposal tanpa data kontak sensitif dan tersinkronisasi aman dengan Studio CRM.'
                      : 'Encrypted client portal synced directly with Studio CRM.'}
                  </span>
                </div>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
