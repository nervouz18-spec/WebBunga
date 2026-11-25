import { ArrowLeft, Flower2, Lock, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { WEDDING_IMAGE } from '../data/catalog';
import { Language } from '../types/store';
import { ResilientImage } from './ResilientImage';

interface CrmLoginScreenProps {
  language: Language;
  isSigningIn: boolean;
  authError: string | null;
  unauthorizedEmail?: string | null;
  onSetLanguage: (lang: Language) => void;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onBackToStorefront: () => void;
}

export function CrmLoginScreen({
  language,
  isSigningIn,
  authError,
  unauthorizedEmail,
  onSetLanguage,
  onSignInWithGoogle,
  onSignOut,
  onBackToStorefront,
}: CrmLoginScreenProps) {
  const isId = language === 'id';

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C211E] flex flex-col">
      {/* Top Bar matching Storefront palette */}
      <header className="h-14 bg-white border-b border-[#E5E1D8] px-4 sm:px-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStorefront}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1C211E] hover:text-[#A35047] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isId ? 'Kembali ke Storefront' : 'Return to Storefront'}</span>
        </button>

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
      </header>

      {/* Main Split Editorial Login Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#E5E1D8] rounded-sm overflow-hidden shadow-xs">
          {/* Editorial Botanical Side Panel */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[500px] bg-[#2D3B32] overflow-hidden flex flex-col justify-between p-7 text-white">
            <div className="absolute inset-0">
              <ResilientImage
                src={WEDDING_IMAGE}
                alt="Bloom & Botanica floral atelier conservatory table"
                fallbackTitle={siteConfig.brandName}
                className="w-full h-full object-cover opacity-55"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1C211E]/90 via-[#1C211E]/45 to-[#1C211E]/55"
              />
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-[#F3DCD8]" aria-hidden="true" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-[#F3DCD8]">
                {siteConfig.brandName} · Studio CRM
              </span>
            </div>

            <div className="relative z-10 space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl leading-tight font-normal text-white">
                {isId
                  ? 'Kelola prospek, kalkulator harga & kontrak acara.'
                  : 'Quietly manage inquiries, estimators & signed proposals.'}
              </h1>
              <p className="text-xs text-[#E8E2DC] leading-relaxed">
                {isId
                  ? 'Seluruh simulasi harga dan pesanan storefront Anda terhubung aman ke workspace studio pribadi.'
                  : 'Your storefront price simulator, wedding calendar, stem counter, and client contracts synced securely.'}
              </p>
            </div>
          </div>

          {/* Authentication Form Card */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-7 bg-white">
            {unauthorizedEmail ? (
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#8C433B]">
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                  <span>{isId ? 'Akses Studio Dibatasi' : 'Studio Access Restricted'}</span>
                </div>
                <h2 className="font-serif text-3xl text-[#1C211E]">
                  {isId ? 'Email belum terdaftar di tim studio' : 'Account not on studio allowlist'}
                </h2>
                <p className="text-sm text-[#5C615D] leading-relaxed">
                  {isId
                    ? `Akun ${unauthorizedEmail} tidak berada dalam daftar email tim yang diizinkan oleh pemilik studio.`
                    : `The Google account ${unauthorizedEmail} is not currently authorized in Studio Team Access settings.`}
                </p>
                <div className="space-y-3 pt-2">
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => void onSignOut()}
                      className="w-full py-3.5 px-6 bg-[#A35047] hover:bg-[#8E433B] text-white text-sm font-medium rounded-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {isId
                          ? 'Keluar & Gunakan Akun Google Lain'
                          : 'Sign Out & Switch Google Account'}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onBackToStorefront}
                    className="w-full py-3 px-6 bg-[#F9F8F6] hover:bg-[#EFECE6] text-[#1C211E] border border-[#DCD7CE] text-xs font-medium rounded-sm transition-colors cursor-pointer"
                  >
                    {isId ? 'Kembali ke Halaman Depan' : 'Back to Storefront'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-[#A35047]">
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isId ? 'Akses Khusus Tim Studio' : 'Private Studio Access'}</span>
                  </div>
                  <h2 className="font-serif text-3xl text-[#1C211E]">
                    {isId ? 'Masuk ke Studio CRM' : 'Sign in to Studio CRM'}
                  </h2>
                  <p className="text-sm text-[#5C615D] leading-relaxed">
                    {isId
                      ? 'Masuk dengan akun Google Anda untuk membuka pipeline acara, mengatur kalkulator website, dan memantau laporan studio.'
                      : 'Sign in with your Google account to unlock your floral pipeline, live website calculator editor, and studio ledger.'}
                  </p>
                </div>

                {authError && (
                  <div
                    role="alert"
                    className="p-3.5 bg-[#FBF1F0] border border-[#EBD2CE] rounded-sm text-xs text-[#8C433B]"
                  >
                    {authError}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={isSigningIn}
                    onClick={() => void onSignInWithGoogle()}
                    className="w-full py-3.5 px-6 bg-[#A35047] hover:bg-[#8E433B] disabled:opacity-60 text-white text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-3 cursor-pointer min-h-[48px]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
                      />
                    </svg>
                    <span>
                      {isSigningIn
                        ? isId
                          ? 'Menghubungkan akun...'
                          : 'Signing in...'
                        : isId
                          ? 'Masuk dengan Google'
                          : 'Sign in with Google'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onBackToStorefront}
                    className="w-full py-3 px-6 bg-[#F9F8F6] hover:bg-[#EFECE6] text-[#1C211E] border border-[#DCD7CE] text-xs font-medium rounded-sm transition-colors cursor-pointer"
                  >
                    {isId ? 'Kembali ke Halaman Depan' : 'Back to Storefront'}
                  </button>
                </div>

                <div className="pt-5 border-t border-[#ECE8E1] flex items-start gap-2.5 text-xs text-[#5C615D]">
                  <ShieldCheck className="w-4 h-4 text-[#2D3B32] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {isId
                      ? 'Dilindungi Firebase Authentication & aturan isolasi data per studio. Data prospek dan harga hanya dapat diubah setelah Anda masuk.'
                      : 'Protected by Firebase Authentication and tenant-isolated Firestore security rules.'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
