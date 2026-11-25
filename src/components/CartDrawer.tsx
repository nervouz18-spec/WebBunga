import { ArrowLeft, CheckCircle2, Minus, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { formatPrice, siteConfig } from '../config/siteConfig';
import { copy } from '../data/translations';
import { CartItem, CurrencyCode, Language, OrderSubmission } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  language: Language;
  currency: CurrencyCode;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderCompleted?: (order: OrderSubmission) => void;
}

export function CartDrawer({
  isOpen,
  items,
  language,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
}: CartDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('10:00 – 13:00');
  const [paymentMethod, setPaymentMethod] = useState<'bank-transfer' | 'card' | 'whatsapp-concierge'>('whatsapp-concierge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSubmission | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && items.length > 0 && step === 'confirmed') {
      setStep('bag');
    }
  }, [isOpen, items.length, step]);

  if (!isOpen) return null;

  const t = copy[language].cart;
  const subtotalSGD = items.reduce((sum, item) => sum + item.unitPriceSGD * item.quantity, 0);
  const qualifiesFreeDelivery = subtotalSGD >= siteConfig.freeDeliveryThresholdSGD || subtotalSGD === 0;
  const deliveryFeeSGD = qualifiesFreeDelivery ? 0 : siteConfig.standardDeliveryFeeSGD;
  const totalSGD = subtotalSGD + deliveryFeeSGD;

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload: OrderSubmission = {
      orderNumber: `BB-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      currency,
      customerName,
      customerPhone,
      customerEmail,
      recipientName: recipientName || customerName,
      deliveryAddress,
      postalCode,
      deliverySlot,
      paymentMethod,
      items: [...items],
      subtotalSGD,
      deliveryFeeSGD,
      totalSGD,
    };

    if (siteConfig.webhookEndpoint) {
      try {
        await fetch(siteConfig.webhookEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
      } catch {
        // Proceed with client confirmation & concierge fallback if endpoint is unreachable
      }
    }

    setConfirmedOrder(orderPayload);
    onOrderCompleted?.(orderPayload);
    onClearCart();
    setStep('confirmed');
    setIsSubmitting(false);
  };

  const buildWhatsAppHref = (order: OrderSubmission) => {
    const lines = [
      `Hello ${siteConfig.brandName}, I have placed Order #${order.orderNumber}:`,
      ...order.items.map(
        (item) =>
          `- ${item.quantity}x ${item.name} (${item.sizeLabel}, ${item.palette}) | Date: ${item.deliveryDate}`
      ),
      `Recipient: ${order.recipientName}`,
      `Address: ${order.deliveryAddress} (${order.postalCode})`,
      `Slot: ${order.deliverySlot}`,
      `Total: ${formatPrice(order.totalSGD, order.currency)}`,
    ];
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleFinish = () => {
    setStep('bag');
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1C211E]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F9F8F6] h-full border-l border-[#E5E1D8] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E5E1D8] bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label={t.backToBag}
                className="w-9 h-9 inline-flex items-center justify-center text-[#5C615D] hover:text-[#1C211E] hover:bg-[#F2F0EC] rounded-sm transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 id="cart-drawer-title" className="font-serif text-2xl text-[#1C211E]">
              {step === 'bag'
                ? t.title
                : step === 'checkout'
                  ? t.checkoutTitle
                  : t.confirmedTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="w-10 h-10 -mr-2 inline-flex items-center justify-center text-[#5C615D] hover:text-[#1C211E] hover:bg-[#F2F0EC] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="space-y-6">
              <div className="p-5 bg-white border border-[#E5E1D8] rounded-sm space-y-3">
                <div className="flex items-center gap-2.5 text-[#2D3B32]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">
                    Order #{confirmedOrder.orderNumber} Confirmed
                  </span>
                </div>
                <p className="text-sm text-[#4D544F] leading-relaxed">{t.confirmedSubtitle}</p>
                <div className="pt-3 border-t border-[#ECE8E1] text-xs text-[#5C615D] space-y-1">
                  <div>
                    <span className="font-medium text-[#1C211E]">{t.recipientName}:</span>{' '}
                    {confirmedOrder.recipientName}
                  </div>
                  <div>
                    <span className="font-medium text-[#1C211E]">{t.deliverySlot}:</span>{' '}
                    {confirmedOrder.deliverySlot}
                  </div>
                  <div>
                    <span className="font-medium text-[#1C211E]">{t.total}:</span>{' '}
                    <span className="tabular-nums font-medium text-[#1C211E]">
                      {formatPrice(confirmedOrder.totalSGD, confirmedOrder.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {confirmedOrder.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex justify-between gap-4 py-2 border-b border-[#E5E1D8] text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#1C211E]">
                        {item.quantity}x {item.name}
                      </div>
                      <div className="text-[#5C615D]">
                        {item.sizeLabel} · {item.deliveryDate}
                      </div>
                    </div>
                    <div className="tabular-nums font-medium text-[#1C211E] shrink-0">
                      {formatPrice(item.unitPriceSGD * item.quantity, confirmedOrder.currency)}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={buildWhatsAppHref(confirmedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 inline-flex items-center justify-center text-sm font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm transition-colors"
              >
                {t.whatsappOrder}
              </a>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 px-4 text-sm font-medium text-[#1C211E] border border-[#DCD7CE] bg-white hover:bg-[#F2F0EC] rounded-sm transition-colors cursor-pointer"
              >
                {t.doneBtn}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="font-serif text-2xl text-[#1C211E] mb-2">{t.emptyTitle}</p>
              <p className="text-sm text-[#5C615D] max-w-xs mb-6 leading-relaxed">{t.emptyDesc}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] rounded-sm transition-colors cursor-pointer"
              >
                {t.browseBtn}
              </button>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-5">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-4 bg-white border border-[#E5E1D8] rounded-sm"
                >
                  <div className="w-20 h-20 shrink-0 bg-[#EFECE6] rounded-sm overflow-hidden">
                    <ResilientImage
                      src={item.image}
                      alt={item.name}
                      fallbackTitle={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg text-[#1C211E] leading-snug truncate">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#8A8F8B] hover:text-[#1C211E] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#5C615D] mt-0.5">
                      {item.sizeLabel} · {item.palette}
                    </p>
                    <p className="text-xs text-[#5C615D] mt-0.5 tabular-nums">
                      {item.deliveryDate}
                    </p>
                    {item.cardMessage && (
                      <p className="text-xs italic text-[#4D544F] mt-1.5 line-clamp-2">
                        “{item.cardMessage}”
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F0EDE7]">
                      <div className="inline-flex items-center border border-[#DCD7CE] rounded-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 inline-flex items-center justify-center text-[#4D544F] hover:bg-[#F2F0EC] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 inline-flex items-center justify-center text-[#4D544F] hover:bg-[#F2F0EC] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-[#1C211E] tabular-nums">
                        {formatPrice(item.unitPriceSGD * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1C211E] mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1C211E] mb-1">
                    {t.customerPhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C211E] mb-1">
                    {t.customerEmail} *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C211E] mb-1">
                  {t.recipientName}
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={customerName || 'Same as sender'}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C211E] mb-1">
                  {t.deliveryAddress} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1C211E] mb-1">
                    {t.postalCode} *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C211E] mb-1">
                    {t.deliverySlot}
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCD7CE] rounded-sm focus:outline-none focus:border-[#2D3B32]"
                  >
                    <option value="10:00 – 13:00">10:00 – 13:00</option>
                    <option value="13:00 – 17:00">13:00 – 17:00</option>
                    <option value="17:00 – 20:00">17:00 – 20:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C211E] mb-1.5">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'whatsapp-concierge' as const,
                      label:
                        language === 'en'
                          ? 'Direct Invoice & WhatsApp Concierge'
                          : 'Invoice Langsung & Konfirmasi WhatsApp',
                    },
                    {
                      id: 'bank-transfer' as const,
                      label:
                        language === 'en'
                          ? 'Bank Transfer / PayNow / QRIS'
                          : 'Transfer Bank / PayNow / QRIS',
                    },
                    {
                      id: 'card' as const,
                      label:
                        language === 'en'
                          ? 'Credit / Debit Payment Link'
                          : 'Link Pembayaran Kartu Kredit / Debit',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 px-3 py-2.5 text-xs border rounded-sm cursor-pointer transition-colors ${
                        paymentMethod === opt.id
                          ? 'border-[#2D3B32] bg-white text-[#1C211E] font-medium'
                          : 'border-[#DCD7CE] bg-[#F9F8F6] text-[#5C615D]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="accent-[#2D3B32]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-[#E5E1D8] bg-white space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5C615D]">
                <span>{t.subtotal}</span>
                <span className="tabular-nums text-[#1C211E]">
                  {formatPrice(subtotalSGD, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#5C615D]">
                <span>{t.deliveryFee}</span>
                <span className="tabular-nums text-[#1C211E]">
                  {deliveryFeeSGD === 0 ? t.freeLabel : formatPrice(deliveryFeeSGD, currency)}
                </span>
              </div>
              {!qualifiesFreeDelivery && (
                <p className="text-xs text-[#5C615D] pt-0.5">
                  {t.freeHint} {formatPrice(siteConfig.freeDeliveryThresholdSGD, currency)}
                </p>
              )}
              <div className="flex justify-between text-base font-medium text-[#1C211E] pt-2 border-t border-[#ECE8E1]">
                <span>{t.total}</span>
                <span className="tabular-nums">{formatPrice(totalSGD, currency)}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-6 text-sm font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] transition-colors rounded-sm cursor-pointer min-h-[44px]"
              >
                {t.proceedCheckout}
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3 px-6 text-sm font-medium text-white bg-[#2D3B32] hover:bg-[#1E2822] disabled:opacity-60 transition-colors rounded-sm cursor-pointer min-h-[44px]"
              >
                {isSubmitting ? '...' : t.placeOrder}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
