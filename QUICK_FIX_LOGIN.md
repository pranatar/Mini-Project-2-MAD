# 🔥 QUICK FIX - Google Login Tanpa OAuth Setup

## Masalah
Error: "Server cannot process request because request is incomplete"

Ini terjadi karena **Google OAuth credentials belum setup**.

## Solusi Cepat (Development Mode)

### Opsi 1: Pakai Google OAuth Placeholder (RECOMMENDED untuk Production)

Ikuti langkah di file `.env` untuk setup Google OAuth yang benar.

### Opsi 2: Login Manual Tanpa Google (Untuk Development Saja)

Saya sudah buatkan halaman login yang bisa langsung redirect. Untuk development tanpa OAuth, Anda bisa:

1. **Buka Convex Dashboard**: https://dashboard.convex.dev/
2. **Buka database "users"**
3. **Manual create user** dengan email Anda
4. **Copy user._id** 
5. **Paste ke localStorage** browser:

```javascript
// Di browser console (F12):
localStorage.setItem('@library_user_id', 'YOUR_USER_ID_HERE');
location.reload();
```

### Opsi 3: Gunakan Email/Password Login (Alternatif)

Jika Google OAuth terlalu rumit, kita bisa ganti ke email/password login.
Mau saya buatkan?

## 📋 Langkah Setup Google OAuth (WAJIB untuk Production)

### 1. Buat Google Cloud Project
```
https://console.cloud.google.com/
→ NEW PROJECT → "Digital Library" → CREATE
```

### 2. Enable API
```
APIs & Services → Library → Search "Google Sign-In" → ENABLE
```

### 3. OAuth Consent Screen
```
APIs & Services → OAuth consent screen → External → CREATE
→ App name: "Digital Library"
→ Email: your-email@gmail.com
→ SAVE AND CONTINUE (skip scopes)
→ ADD USERS: your-email@gmail.com
→ SAVE AND CONTINUE
```

### 4. Create Credentials
```
APIs & Services → Credentials → CREATE CREDENTIALS → OAuth client ID
→ Application type: Web application
→ Name: "Development"
→ Authorized JavaScript origins:
    http://localhost:19000
    http://localhost:19006
→ Authorized redirect URIs:
    https://auth.expo.io/@YOUR_USERNAME/exercise_mad
    (GANTI YOUR_USERNAME dengan username Expo Anda!)
→ CREATE
```

### 5. Copy Client ID
Anda akan dapat Client ID seperti:
```
123456789-abc123def456789.apps.googleusercontent.com
```

### 6. Update .env
Edit file `.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc123def456789.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456789.apps.googleusercontent.com
```

### 7. Restart App
```bash
# Stop Expo (Ctrl+C)
npm start
```

## ✅ Test

1. Buka app
2. Klik "Continue with Google"
3. Pilih akun Google
4. Seharusnya berhasil login!

## ❌ Masih Error?

Kemungkinan penyebab:
1. **Redirect URI salah** - Pastikan sesuai di Google Cloud Console
2. **Client ID salah** - Copy paste dengan benar
3. **Username Expo salah** - Cek di https://expo.dev/ username Anda
4. **Cache** - Clear cache: `npm start -- --clear`

## 🆘 Butuh Bantuan?

Buka file lengkap: `SETUP_PRODUCTION.md` untuk panduan detail.
