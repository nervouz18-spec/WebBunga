import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { Language } from '../types/store';

interface IntegrationModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

const SAMPLE_WEBHOOK_JSON = `{
  "orderNumber": "BB-4821",
  "createdAt": "2026-11-24T15:30:00.000Z",
  "currency": "SGD",
  "customerName": "Clara Wijaya",
  "customerPhone": "+628123456789",
  "customerEmail": "clara@example.com",
  "recipientName": "Elena Tan",
  "deliveryAddress": "Jl. Kemang Raya No. 18",
  "postalCode": "12730",
  "deliverySlot": "10:00 – 13:00",
  "paymentMethod": "whatsapp-concierge",
  "items": [
    {
      "productId": "prod-signature-bloombox",
      "name": "Maison Ivory Bloombox",
      "sizeLabel": "Classic (34–38 cm)",
      "palette": "Ivory & Sage",
      "deliveryDate": "2026-11-25",
      "unitPriceSGD": 155,
      "quantity": 1
    }
  ],
  "subtotalSGD": 155,
  "deliveryFeeSGD": 0,
  "totalSGD": 155
}`;

export function IntegrationModal({ isOpen, language, onClose }: IntegrationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_WEBHOOK_JSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C211E]/55 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="integration-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#F9F8F6] border border-[#E5E1D8] rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between">
          <h3 id="integration-modal-title" className="font-serif text-2xl text-[#1C211E]">
            {language === 'en'
              ? 'Independent Web Integration Guide'
              : 'Panduan Integrasi Web Independen'}
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

        <div className="p-6 space-y-5 text-sm text-[#4D544F] max-h-[80vh] overflow-y-auto">
          <p className="leading-relaxed">
            {language === 'en'
              ? 'This storefront is built as a standalone, self-contained React + Vite bundle ready to host on any custom domain, Vercel, Cloudflare Pages, or Nginx server.'
              : 'Storefront ini dibangun sebagai aplikasi React + Vite mandiri yang siap dipasang di domain pribadi, Vercel, Cloudflare Pages, atau server Nginx Anda.'}
          </p>

          <div className="space-y-2">
            <h4 className="font-medium text-[#1C211E]">
              {language === 'en' ? '1. Brand & Checkout Configuration' : '1. Konfigurasi Brand & Checkout'}
            </h4>
            <p className="text-xs leading-relaxed">
              {language === 'en'
                ? 'Edit src/config/siteConfig.ts to change brand name, WhatsApp concierge number, currency exchange rates (SGD/IDR/USD), free delivery threshold, and webhookEndpoint.'
                : 'Ubah src/config/siteConfig.ts untuk mengganti nama brand, nomor WhatsApp admin, kurs mata uang (SGD/IDR/USD), batas gratis ongkir, serta webhookEndpoint backend Anda.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-[#1C211E]">
              {language === 'en' ? '2. Catalog & Pricing Data' : '2. Data Katalog & Harga'}
            </h4>
            <p className="text-xs leading-relaxed">
              {language === 'en'
                ? 'Edit src/data/catalog.ts to add your own floral arrangements, pricing tiers, or swap product photography.'
                : 'Edit src/data/catalog.ts untuk menambahkan rangkaian bunga Anda sendiri, variasi ukuran, atau mengganti foto produk.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#1C211E]">
                {language === 'en'
                  ? '3. Webhook Order POST Payload'
                  : '3. Contoh Payload JSON Webhook Pesanan'}
              </h4>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1C211E] bg-white border border-[#DCD7CE] hover:bg-[#F2F0EC] rounded-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#1C211E] text-[#E6E2DC] text-xs font-mono rounded-sm overflow-x-auto leading-relaxed">
              {SAMPLE_WEBHOOK_JSON}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
