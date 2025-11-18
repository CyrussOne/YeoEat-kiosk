# YeoEat Kiosk - APK Build Guide

## 🚀 How to Build and Deploy APK

### Prerequisites
- ✅ Code changes are tested in browser (http://localhost:8080)
- ✅ Supabase is configured and working
- ✅ .env file contains correct Supabase credentials
- ✅ Android Studio is installed

---

## Step-by-Step Build Process

### Step 1: Build the Web App

```bash
# Stop the dev server first (Ctrl+C in terminal)

# Build the production version
npm run build

# This creates optimized files in dist/ folder
```

**What happens:**
- Vite compiles and minifies your code
- Creates production-ready HTML, CSS, JS files
- Output: `dist/` folder with all assets

---

### Step 2: Sync with Capacitor

```bash
# Copy built files to Android project
npx cap sync android

# Or sync all platforms
npx cap sync
```

**What happens:**
- Copies `dist/` contents to `android/app/src/main/assets/public/`
- Updates Capacitor plugins
- Syncs configuration

---

### Step 3: Open in Android Studio

```bash
# Open Android project in Android Studio
npx cap open android
```

**Or manually:**
1. Open Android Studio
2. File → Open
3. Navigate to `/workspaces/YeoEat-kiosk/android`
4. Click "OK"

---

### Step 4: Build APK in Android Studio

1. **Wait for Gradle sync** to complete (bottom right of Android Studio)

2. **Build the APK:**
   - Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or use: Build → Generate Signed Bundle / APK

3. **Wait for build** (can take 2-5 minutes)

4. **Locate APK:**
   - Success notification will appear: "APK(s) generated successfully"
   - Click "locate" in notification
   - Or find it at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### Step 5: Install on Android Device

#### Method 1: Via USB

1. **Enable USB Debugging** on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect device via USB**

3. **In Android Studio:**
   - Top toolbar: Select your device from dropdown
   - Click green "Run" button (▶️)
   - APK installs automatically

#### Method 2: Via File Transfer

1. **Copy APK to device:**
   - Connect via USB
   - Copy `app-debug.apk` to device Downloads folder
   - Or email APK to yourself

2. **Install on device:**
   - Open file manager on device
   - Navigate to Downloads
   - Tap `app-debug.apk`
   - Allow "Install from unknown sources" if prompted
   - Tap "Install"

---

## 🔄 Development Workflow

### Daily Development (Code Changes)

```bash
# 1. Make code changes in src/
# 2. Test in browser
npm run dev

# 3. Open http://localhost:8080/
# 4. Verify changes work

# 5. When satisfied, build APK (see steps above)
```

### Quick Testing (No APK Rebuild)

```bash
# Just use browser on Android device
# Visit: http://YOUR-COMPUTER-IP:8080/

# Example:
# http://10.0.11.248:8080/
```

### Production Deployment

```bash
# 1. Update version in package.json
# 2. Build web app
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Build signed APK in Android Studio
#    (Build → Generate Signed Bundle)

# 5. Upload to Google Play Store
#    (or distribute APK directly)
```

---

## 📊 What Changes Require APK Rebuild?

### ✅ REQUIRES Rebuild:

| Change Type | Example | Rebuild? |
|-------------|---------|----------|
| UI Changes | New button, layout changes | ✅ YES |
| Features | New admin page | ✅ YES |
| Bug Fixes | Fixed product display | ✅ YES |
| Styling | Changed colors, fonts | ✅ YES |
| Dependencies | Added new npm package | ✅ YES |
| Configuration | Changed .env variables | ✅ YES |

### ❌ NO Rebuild Needed:

| Change Type | Example | Rebuild? |
|-------------|---------|----------|
| Database Data | Added new products | ❌ NO |
| User Roles | Assigned admin role | ❌ NO |
| Orders | New customer orders | ❌ NO |
| Supabase Settings | Changed RLS policies | ❌ NO |

**Why?** The APK connects to Supabase, so data changes are reflected immediately.

---

## 🎯 Best Practices

### For Development:

1. **Use browser testing** for rapid iteration
2. **Test on network URL** for mobile-specific testing
3. **Build APK** only when ready for production-like testing

### For Production:

1. **Always test in browser first**
2. **Build and test APK** before deployment
3. **Use signed APKs** for release (not debug)
4. **Version your APKs** (increment version number)

---

## 🚨 Common Issues

### Issue: APK shows old code

**Solution:**
```bash
# Clear build cache
rm -rf android/app/build
rm -rf dist

# Rebuild from scratch
npm run build
npx cap sync android
# Then rebuild APK in Android Studio
```

### Issue: APK can't connect to Supabase

**Solution:**
- Check `.env` file has correct credentials
- Rebuild APK after changing .env
- Verify internet connection on device

### Issue: "App not installed" error

**Solution:**
- Uninstall old version first
- Enable "Install from unknown sources"
- Use same signing key for updates

---

## 📦 Build Commands Reference

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run preview             # Preview production build

# Capacitor
npx cap sync                # Sync all platforms
npx cap sync android        # Sync Android only
npx cap open android        # Open in Android Studio
npx cap copy                # Copy web assets only
npx cap update              # Update Capacitor

# Android
cd android && ./gradlew assembleDebug    # Build debug APK via CLI
cd android && ./gradlew assembleRelease  # Build release APK via CLI
```

---

## 🎉 Quick Reference

**Build APK in 3 commands:**
```bash
npm run build
npx cap sync android
npx cap open android
# Then: Build → Build APK in Android Studio
```

**Test without rebuild:**
```bash
npm run dev
# Open http://YOUR-IP:8080/ on Android device
```

---

**Last Updated:** 2025-11-18
