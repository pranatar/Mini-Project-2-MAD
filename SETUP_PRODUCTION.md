# Panduan Setup Google OAuth - Production Ready

## Langkah 1: Buat Project di Google Cloud Console

1. **Buka** [Google Cloud Console](https://console.cloud.google.com/)
2. **Login** dengan akun Google Anda (gunakan akun yang akan jadi admin)
3. **Klik** "Select a project" → "NEW PROJECT"
4. **Nama Project**: `digital-library-[nama-universitas-anda]`
5. **Klik** "CREATE"

## Langkah 2: Enable Google Sign-In API

1. **Buka** menu "APIs & Services" → "Library"
2. **Search**: "Google Sign-In API"
3. **Klik** "Google Sign-In API"
4. **Klik** "ENABLE"

## Langkah 3: Configure OAuth Consent Screen

1. **Buka** "APIs & Services" → "OAuth consent screen"
2. **Pilih** "External" → Klik "CREATE"
3. **Isi form**:
   - App name: `Digital Library [Nama Universitas]`
   - User support email: pilih email Anda
   - App logo: (opsional) upload logo universitas
   - App domain: kosongkan untuk development
   - Developer contact: email Anda
4. **Klik** "SAVE AND CONTINUE"
5. **Scopes**: Klik "SAVE AND CONTINUE" (tidak perlu tambah scope)
6. **Test users**: Klik "ADD USERS" dan tambahkan email Google yang akan digunakan untuk testing
7. **Klik** "SAVE AND CONTINUE"

## Langkah 4: Buat OAuth Credentials

### 4a. Web Client (untuk development & web)

1. **Buka** "APIs & Services" → "Credentials"
2. **Klik** "+ CREATE CREDENTIALS" → "OAuth client ID"
3. **Application type**: Web application
4. **Name**: `Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:19000
   http://localhost:19006
   https://your-app-url.expo.app (jika deploy ke Expo)
   ```
6. **Authorized redirect URIs**:
   ```
   https://auth.expo.io/@your-username/exercise_mad
   ```
7. **Klik** "CREATE"
8. **Copy** "Your Client ID" → simpan untuk `.env`

### 4b. Android Client (jika build APK)

1. **Klik** "+ CREATE CREDENTIALS" → "OAuth client ID"
2. **Application type**: Android
3. **Name**: `Android Client`
4. **Package name**: `com.youruniversity.library` (sesuaikan)
5. **SHA-1 certificate fingerprint**:
   ```bash
   # Di folder project
   cd android
   ./gradlew signingReport
   ```
   Copy SHA-1 dari output (yang debug)
6. **Klik** "CREATE"
7. **Download** JSON → simpan sebagai `google-services.json`

### 4c. iOS Client (jika build untuk iOS)

1. **Klik** "+ CREATE CREDENTIALS" → "OAuth client ID"
2. **Application type**: iOS
3. **Name**: `iOS Client`
4. **Bundle ID**: `com.youruniversity.library`
5. **Klik** "CREATE"
6. **Copy** Client ID → simpan untuk `.env`

## Langkah 5: Update Environment Variables

Buat file `.env.local` (untuk development):

```env
# Convex Production URL
EXPO_PUBLIC_CONVEX_URL=https://your-deployment:your-region.convex.cloud

# Google OAuth - GANTI DENGAN YANG ANDA DAPAT DARI GOOGLE CLOUD
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

## Langkah 6: Update app.json

```json
{
  "expo": {
    "name": "Digital Library",
    "slug": "exercise_mad",
    "scheme": "digitallibrary",
    "ios": {
      "bundleIdentifier": "com.youruniversity.library",
      "supportsTablet": true
    },
    "android": {
      "package": "com.youruniversity.library",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "output": "static"
    },
    "plugins": [
      "expo-router",
      [
        "expo-auth-session",
        {
          "googleClientId": "YOUR_WEB_CLIENT_ID_HERE"
        }
      ]
    ]
  }
}
```

## Langkah 7: Setup Convex Production

```bash
# Login ke Convex
npx convex login

# Create production deployment
npx convex deploy --prod

# Copy URL yang ditampilkan ke .env
```

## Langkah 8: Jalankan Development Server

```bash
# Install dependencies
npm install

# Jalankan Convex (terminal 1)
npx convex dev

# Jalankan Expo (terminal 2)
npm start
```

## Langkah 9: Test Login

1. **Buka** app di browser/emulator
2. **Klik** "Continue with Google"
3. **Login** dengan akun Google yang sudah ditambahkan di test users
4. **User akan dibuat otomatis** dengan role "mahasiswa"

## Langkah 10: Setup Admin User

Setelah login pertama kali, set admin manually:

### Cara 1: Via Convex Dashboard
1. **Buka** [Convex Dashboard](https://dashboard.convex.dev/)
2. **Pilih** deployment Anda
3. **Klik** "Functions" → "auth"
4. **Klik** mutation `updateUserRole`
5. **Input**:
   ```json
   {
     "userId": "USER_ID_DARI_DATABASE",
     "role": "admin"
   }
   ```

### Cara 2: Via Terminal
```bash
npx convex run auth:updateUserRole --userId <USER_ID> --role admin
```

### Cara 3: Via Database
1. **Buka** Convex Dashboard → "Database"
2. **Klik** table "users"
3. **Find** user yang mau dijadikan admin
4. **Copy** `_id` nya
5. **Edit** field `role` jadi `"admin"`

## Troubleshooting

### Error: "Sign in failed - Invalid redirect URI"
**Solusi**: Tambahkan redirect URI di Google Cloud Console:
```
https://auth.expo.io/@YOUR_USERNAME/exercise_mad
```

### Error: "Access blocked - App isn't verified"
**Solusi**: Ini normal untuk development. Klik "Continue" untuk lanjut.

Untuk production, perlu verifikasi app di OAuth consent screen.

### User tidak tersimpan di Convex
**Solusi**:
1. Pastikan `EXPO_PUBLIC_CONVEX_URL` benar
2. Jalankan `npx convex dev` untuk sync
3. Cek Convex Dashboard → "Logs" untuk error

### Login berhasil tapi tetap di halaman login
**Solusi**: Clear cache dan restart:
```bash
npm start -- --clear
```

## Production Deployment

### Deploy ke Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login EAS
eas login

# Configure EAS
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build untuk Production
eas build --platform android --profile production
```

## Security Best Practices

1. **Jangan commit .env** ke Git (sudah ada di .gitignore)
2. **Gunakan .env.local** untuk development
3. **Gunakan .env.production** untuk production
4. **Rotate credentials** secara berkala
5. **Enable 2FA** untuk akun Google Cloud admin

## Monitoring & Analytics

Untuk tracking login activity:

1. **Convex Logs**: Dashboard → "Logs"
2. **Google Analytics**: Tambahkan ke app untuk tracking user behavior
3. **Sentry**: Untuk error tracking

## Support

Untuk bantuan lebih lanjut:
- [Convex Docs](https://docs.convex.dev/)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
