# Bloom & Botanica — Floral Atelier

Aplikasi React + Vite (SPA) dengan Firebase Authentication & Cloud Firestore.
Versi asli: [AI Studio applet](https://ai.studio/apps/b255db26-75f9-4ae8-81b6-da921bd4271d).

## Jalankan lokal

Butuh Node.js **22.12+** (lihat `engines` di `package.json`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # output: dist/
npm run preview  # cek hasil build produksi
npm run lint     # tsc --noEmit
```

## Deploy ke Vercel

1. Push repo ke GitHub/GitLab/Bitbucket, lalu **Import Project** di Vercel.
2. Vercel akan mendeteksi Vite. `vercel.json` sudah mengunci pengaturan:
   - Framework: `vite`
   - Output directory: `dist`
   - Build command: script `build` dari `package.json`
3. Pastikan hanya **satu lockfile** yang di-commit (`bun.lock` **atau** `package-lock.json`).
   Vercel memilih package manager berdasarkan lockfile. Di lokal tanpa Bun, `npm install`
   akan membuat `package-lock.json` — commit itu dan hapus `bun.lock`, atau sebaliknya.
4. Tidak ada environment variable yang wajib diisi di Vercel. `GEMINI_API_KEY` dan
   `APP_URL` di `.env.example` saat ini **belum dipakai** oleh kode. Jika nanti ditambahkan,
   jangan pernah memasukkan API key rahasia ke variabel berprefix `VITE_` (nilainya ikut
   ke bundle browser). Gunakan Serverless Function/Vercel API route untuk secret.

### Yang WAJIB dilakukan di Firebase Console

Aplikasi memakai project Firebase `gen-lang-client-0196386786` dan **database Firestore
bernama** `ai-studio-bloombotanica-b255db26-75f9-4ae8-81b6-da921bd4271d` (bukan `(default)`).

1. **Authentication → Settings → Authorized domains**
   Tambahkan domain deployment, misalnya `nama-project.vercel.app` dan domain kustom Anda.
   Tanpa ini, login Google akan gagal dengan error `auth/unauthorized-domain`.
   Setiap preview deployment punya URL unik; tambahkan juga jika ingin login di preview.
2. **Deploy security rules** ke database bernama tersebut:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore
   ```

   `firebase.json` dan `.firebaserc` sudah mengarahkan rules ke project & database yang
   benar. Jangan mendeploy rules ini ke database `(default)`.

### Cek setelah deploy

- Halaman utama dan gambar (`/src/assets/images/...`) termuat — Vite menyalin aset itu ke
  `dist/src/assets` lewat plugin di `vite.config.ts`.
- Login Google berhasil di domain Vercel.
- Link proposal (`/?proposal=<id>`) bisa dibuka dan ditandatangani.
- Form simulator/order masuk ke CRM saat akun admin (`tryzic00@gmail.com`) login.

## Catatan pengembangan

- Routing memakai query string `?proposal=...`, bukan path-based routing, jadi tidak perlu
  rewrite SPA di Vercel.
- Layar Studio CRM dan proposal klien di-`lazy` load, sehingga bundle awal storefront lebih
  ringan (sekitar 284 kB gzip). Firebase SDK tetap masuk bundle utama karena dipakai sejak
  boot.
- `firestore.rules.test.ts` berisi spesifikasi payload adversarial; belum ada runner test
  otomatis — bisa ditambahkan emulator suite jika diperlukan.
- Dependensi `express`, `dotenv`, `@google/genai`, dan `autoprefixer` saat ini tidak dipakai;
  bisa dibersihkan untuk mempercepat install (perlu regenerate lockfile).
- `npm run lint` hanya berjalan manual. Bila ingin build gagal saat ada error tipe, ubah
  script `build` menjadi `tsc --noEmit && vite build`.
