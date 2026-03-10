# 🔧 Troubleshooting Google Login Error

## Error yang Sering Terjadi

### 1. "Server cannot process request" / "Request incomplete"

**Penyebab:** Redirect URI tidak cocok

**Solusi:**

1. **Buka Google Cloud Console**: https://console.cloud.google.com/apis/credentials

2. **Klik OAuth 2.0 Client ID** Anda

3. **Tambahkan Authorized redirect URIs**:
   ```
   https://auth.expo.io/@YOUR_USERNAME/exercise_mad
   ```
   
   Ganti `YOUR_USERNAME` dengan username Expo Anda!

4. **Cara cek username Expo**:
   - Buka: https://expo.dev/
   - Login dengan akun Expo
   - Username ada di URL profile: `https://expo.dev/@username`

5. **Save** dan tunggu 5 menit

6. **Restart Expo**:
   ```bash
   npm start -- --clear
   ```

---

### 2. "Invalid Client" / "Client not found"

**Penyebab:** Client ID salah atau belum di-enable

**Solusi:**

1. **Cek Client ID** di `.env` sudah benar
2. **Pastikan API enabled**:
   - Buka: https://console.cloud.google.com/apis/library
   - Search "Google Sign-In API"
   - Harus ada tulisan "API enabled"

---

### 3. "Access blocked" / "App isn't verified"

**Penyebab:** App belum verified (normal untuk development)

**Solusi:** 
- Klik "Continue" atau "Advanced" → "Go to app (unsafe)"
- Ini normal untuk development mode

---

### 4. Login berhasil tapi tetap di halaman login

**Penyebab:** Session tidak tersimpan atau Convex error

**Solusi:**

```bash
# Clear cache
npm start -- --clear

# Restart Convex
npx convex dev
```

---

## ✅ Quick Fix - Pakai Manual Login

Jika Google login masih error, pakai manual login:

1. **Buka app** → Halaman login
2. **Tunggu 2 detik** atau klik **"Use manual login instead"**
3. **Isi form**:
   - Email: `test@student.com`
   - Name: `Test User`
4. **Klik "Login"**
5. **Langsung masuk!** ✅

---

## 🔍 Debug Mode

### 1. Cek Console Logs

Buka browser console (F12) atau Metro bundler, cari error seperti:
```
Sign in error: [error message]
```

### 2. Cek Environment Variables

Pastikan `.env` terbaca:
```bash
# Di terminal, jalankan:
npx expo config --json | grep EXPO_PUBLIC
```

### 3. Test di Browser

Buka: `http://localhost:19006/login`

Lihat console browser (F12 → Console) untuk error detail.

---

## 📋 Checklist Setup Google OAuth

- [ ] Project dibuat di Google Cloud Console
- [ ] Google Sign-In API enabled
- [ ] OAuth Consent Screen configured
- [ ] Test users ditambahkan
- [ ] OAuth Client ID dibuat (Web application)
- [ ] Authorized JavaScript origins ditambahkan:
  - `http://localhost:19000`
  - `http://localhost:19006`
  - `https://auth.expo.io`
- [ ] Authorized redirect URIs ditambahkan:
  - `https://auth.expo.io/@YOUR_USERNAME/exercise_mad`
- [ ] Client ID copied ke `.env`
- [ ] Expo username ditambahkan ke `.env`
- [ ] Server restarted dengan `npm start -- --clear`

---

## 🆘 Masih Error?

### Kirim Informasi Ini:

1. **Screenshot error** dari app
2. **Console log** dari browser (F12)
3. **Username Expo** Anda
4. **Redirect URI** yang sudah diset di Google Cloud Console

### Alternatif: Pakai Manual Login

Untuk development, manual login **lebih cepat dan mudah**:
- Tidak perlu OAuth setup
- Langsung test fitur
- User tetap tersimpan di Convex

---

## 🎯 Setup Lengkap di Google Cloud Console

### Step-by-step:

1. **Buka**: https://console.cloud.google.com/

2. **Create Project**:
   - NEW PROJECT
   - Name: "Digital Library"
   - CREATE

3. **Enable API**:
   - APIs & Services → Library
   - Search: "Google Sign-In API"
   - ENABLE

4. **OAuth Consent Screen**:
   - APIs & Services → OAuth consent screen
   - External → CREATE
   - App name: "Digital Library"
   - User support email: your-email@gmail.com
   - SAVE AND CONTINUE
   - SKIP scopes
   - ADD USERS: your-email@gmail.com
   - SAVE AND CONTINUE

5. **Create Credentials**:
   - APIs & Services → Credentials
   - CREATE CREDENTIALS → OAuth client ID
   - Application type: **Web application**
   - Name: "Exercise MAD"
   
   **Authorized JavaScript origins**:
   ```
   http://localhost:19000
   http://localhost:19006
   https://auth.expo.io
   ```
   
   **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@YOUR_USERNAME/exercise_mad
   ```
   
   - CREATE

6. **Copy Client ID**:
   - Akan dapat: `123456789-abc.apps.googleusercontent.com`
   - Copy ke `.env`

7. **Update .env**:
   ```env
   EXPO_PUBLIC_EXPO_USERNAME=username_anda
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   ```

8. **Restart**:
   ```bash
   npm start -- --clear
   ```

---

## ✅ Test Berhasil

Jika berhasil login, Anda akan:
1. Redirect ke Google login
2. Pilih akun Google
3. Kembali ke app
4. Masuk ke Home page
5. Profile menampilkan nama dan email Anda

🎉 Selamat!
