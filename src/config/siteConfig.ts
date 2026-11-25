import { CurrencyCode } from '../types/store';

/**
 * Independent Storefront Integration Configuration
 * Edit this file to adapt Bloom & Botanica to your own domain, currency,
 * WhatsApp concierge number, or backend checkout webhook.
 */
export const siteConfig = {
  brandName: 'Bloom & Botanica',
  founderName: 'Charlene & Studio Collective',
  locationLabel: 'Independent Floral Atelier',
  contactEmail: 'concierge@bloomandbotanica.com',
  studioOwnerEmail: 'tryzic00@gmail.com',
  whatsappNumber: '6281200008899',
  phoneDisplay: '+65 9071 2779 / +62 812 0000 8899',
  studioAddress: 'Atelier Suite 04, Botanical Courtyard',
  studioHoursEn: 'Tuesday – Sunday, 09:00 – 18:00',
  studioHoursId: 'Selasa – Minggu, 09.00 – 18.00',
  freeDeliveryThresholdSGD: 150,
  standardDeliveryFeeSGD: 18,
  /**
   * Optional independent backend endpoint for POSTing completed orders & wedding inquiries.
   * Leave empty string '' to run purely client-side + WhatsApp concierge handoff.
   */
  webhookEndpoint: '',
  currencyRates: {
    SGD: { symbol: 'S$', rate: 1, decimals: 0 },
    USD: { symbol: '$', rate: 0.74, decimals: 0 },
    IDR: { symbol: 'Rp', rate: 11800, decimals: 0 },
  } as Record<CurrencyCode, { symbol: string; rate: number; decimals: number }>,
};

export function formatPrice(amountSGD: number, currency: CurrencyCode): string {
  const cfg = siteConfig.currencyRates[currency];
  const converted = amountSGD * cfg.rate;
  if (currency === 'IDR') {
    const rounded = Math.round(converted / 1000) * 1000;
    return `Rp ${rounded.toLocaleString('id-ID')}`;
  }
  return `${cfg.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}
