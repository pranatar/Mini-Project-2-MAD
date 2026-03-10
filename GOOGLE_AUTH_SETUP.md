# Setup Google OAuth Authentication

## Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Create Project** atau pilih project yang sudah ada
3. Beri nama project (misalnya: "Digital Library")

## Langkah 2: Enable Google Sign-In API

1. Di dashboard project, klik **APIs & Services** > **Library**
2. Cari "Google Sign-In API"
3. Klik **Enable**

## Langkah 3: Buat OAuth Credentials

1. Klik **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth client ID**

### Untuk Android:
- Application type: **Android**
- Package name: `com.yourapp.library` (sesuaikan dengan package app Anda)
- SHA-1 certificate fingerprint: 
  ```bash
  cd android
  ./gradlew signingReport
  ```
  Copy SHA-1 dari output

### Untuk iOS:
- Application type: **iOS**
- Bundle ID: `com.yourapp.library` (sesuaikan dengan Bundle ID di app.json)

### Untuk Web:
- Application type: **Web application**
- Authorized JavaScript origins: `http://localhost:19006`, `https://your-app-url.com`
- Authorized redirect URIs: `https://auth.expo.io/@your-username/your-app-slug`

### Untuk Development (General):
- Application type: **Web application**
- Name: "Development Client"
- Authorized JavaScript origins: `http://localhost:19000`, `http://localhost:19006`

## Langkah 4: Copy Client IDs

Setelah membuat OAuth credentials, Anda akan mendapatkan:
- **Web Client ID** (untuk development)
- **Android Client ID**
- **iOS Client ID**

Copy semua Client IDs tersebut.

## Langkah 5: Update .env File

Edit file `.env` di root project:

```env
# Convex
EXPO_PUBLIC_CONVEX_URL=https://your-deployment:your-region.convex.cloud

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

## Langkah 6: Update app.json

Tambahkan konfigurasi berikut di `app.json`:

```json
{
  "expo": {
    "scheme": "exercisemad",
    "ios": {
      "bundleIdentifier": "com.yourapp.library"
    },
    "android": {
      "package": "com.yourapp.library",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Langkah 7: Test Login

1. Jalankan app: `npm start`
2. Klik tombol "Continue with Google"
3. Login dengan akun Google Anda

## Default User Roles

Setelah login pertama kali, user akan memiliki role **"mahasiswa"** secara default.

Untuk mengubah role menjadi **"admin"**:

1. Buka Convex Dashboard: `npx convex dashboard`
2. Pergi ke tab **Functions** > **auth**
3. Jalankan mutation `updateUserRole` dengan parameters:
   - `userId`: ID user yang ingin diubah
   - `role`: "admin"

Atau jalankan dari terminal:
```bash
npx convex run auth.updateUserRole --userId <USER_ID> --role admin
```

## Login Credentials untuk Testing

Setelah menjalankan seed data, Anda bisa login dengan:

**Admin:**
- Email: admin@library.com
- Role: Admin

**Mahasiswa:**
- Email: user@example.com  
- Role: Mahasiswa

> **Note:** Untuk login dengan Google, pastikan email yang digunakan sudah terdaftar di sistem atau login pertama kali akan membuat user baru secara otomatis.

## Troubleshooting

### Error: "Sign in failed"
- Pastikan semua Client IDs sudah benar di .env
- Restart Expo Dev Server: `npm start -- --clear`
- Pastikan SHA-1 fingerprint sudah benar untuk Android

### Error: "Invalid redirect URI"
- Pastikan redirect URI sudah ditambahkan di Google Cloud Console
- Untuk development: `https://auth.expo.io/@your-username/your-app-slug`

### User tidak muncul di Convex
- Pastikan Convex URL sudah benar di .env
- Jalankan: `npx convex dev` untuk sync functions
