import { X } from 'lucide-react';
import { useEffect } from 'react';
import { STUDIO_BLOGS, STUDIO_FAQS } from '../data/catalog';
import { InfoModalTopic, Language } from '../types/store';

interface InfoDrawerModalProps {
  topic: InfoModalTopic;
  language: Language;
  onClose: () => void;
}

export function InfoDrawerModal({ topic, language, onClose }: InfoDrawerModalProps) {
  useEffect(() => {
    if (!topic) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [topic, onClose]);

  if (!topic) return null;

  const titles: Record<Exclude<InfoModalTopic, null>, string> = {
    blogs: language === 'en' ? 'Studio Journal & Blogs' : 'Jurnal & Blog Studio',
    faq: language === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan Umum (FAQ)',
    returns:
      language === 'en'
        ? 'Freshness Guarantee, Returns & Refunds'
        : 'Jaminan Kesegaran, Pengembalian & Refund',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C211E]/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between">
          <h3 id="info-modal-title" className="font-serif text-2xl text-[#1C211E]">
            {titles[topic]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 inline-flex items-center justify-center text-[#5C615D] hover:text-[#1C211E] rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {topic === 'blogs' &&
            STUDIO_BLOGS.map((post) => (
              <article
                key={post.id}
                className="p-5 bg-white border border-[#E5E1D8] rounded-sm space-y-2"
              >
                <div className="text-xs text-[#5C615D] flex items-center gap-2">
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>
                <h4 className="font-serif text-2xl text-[#1C211E]">
                  {language === 'en' ? post.titleEn : post.titleId}
                </h4>
                <p className="text-sm text-[#4D544F] leading-relaxed">
                  {language === 'en' ? post.bodyEn : post.bodyId}
                </p>
              </article>
            ))}

          {topic === 'faq' &&
            STUDIO_FAQS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-[#E5E1D8] rounded-sm space-y-1.5"
              >
                <h4 className="text-sm font-semibold text-[#1C211E]">
                  {language === 'en' ? item.qEn : item.qId}
                </h4>
                <p className="text-sm text-[#4D544F] leading-relaxed">
                  {language === 'en' ? item.aEn : item.aId}
                </p>
              </div>
            ))}

          {topic === 'returns' && (
            <div className="p-5 bg-white border border-[#E5E1D8] rounded-sm space-y-4 text-sm text-[#4D544F] leading-relaxed">
              <div>
                <h4 className="font-semibold text-[#1C211E] mb-1">
                  {language === 'en'
                    ? 'Perishable Botanical Policy'
                    : 'Kebijakan Produk Bunga Segar'}
                </h4>
                <p>
                  {language === 'en'
                    ? 'Because fresh flowers are perishable natural goods, completed orders cannot be returned for change of mind once stems have been conditioned and cut.'
                    : 'Karena bunga segar merupakan produk botani alami yang mudah layu, pesanan yang sudah dirangkai tidak dapat dibatalkan atau dikembalikan karena perubahan selera.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C211E] mb-1">
                  {language === 'en'
                    ? 'Damaged or Wilted on Arrival'
                    : 'Kerusakan Saat Pengiriman'}
                </h4>
                <p>
                  {language === 'en'
                    ? 'If your arrangement arrives damaged in transit or below studio freshness standards, send a photograph to our concierge within 12 hours of delivery for a complimentary stem replacement or store credit.'
                    : 'Apabila rangkaian tiba dalam kondisi rusak atau kurang segar, kirimkan foto ke tim concierge kami maksimal 12 jam setelah diterima untuk penggantian gratis atau saldo studio.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1C211E] mb-1">
                  {language === 'en'
                    ? 'Cancellations & Rescheduling'
                    : 'Pembatalan & Penjadwalan Ulang'}
                </h4>
                <p>
                  {language === 'en'
                    ? 'Delivery dates may be rescheduled at no charge at least 24 hours prior to your morning dispatch window.'
                    : 'Perubahan tanggal pengiriman dapat dilakukan tanpa biaya paling lambat 24 jam sebelum jadwal pengiriman pagi.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
