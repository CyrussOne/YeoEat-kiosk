# Diagnostic Logs - Setup Guide

## Overview
This system allows the Android kiosk to save diagnostic logs directly to Supabase, so you can view them remotely without needing a USB stick.

## What's Been Implemented

### 1. **Supabase Database Table**
   - Created `diagnostic_logs` table in `apply-migrations.sql`
   - Stores platform info, printer status, error counts, and full diagnostic logs
   - Indexed for fast queries

### 2. **SystemDiagnostics Page Enhancement**
   - Added "☁️ Save to Supabase" button (green)
   - Automatically collects metadata (platform, printer status, errors)
   - Shows success/error messages

### 3. **Admin Diagnostic Logs Viewer**
   - New admin page at `/admin/diagnostic-logs`
   - View all diagnostic logs from all kiosks
   - Filter by platform, errors, date
   - Download individual logs
   - View full log details in dialog

### 4. **Service Functions**
   - `saveDiagnosticLog()` - Save log to Supabase
   - `getRecentDiagnosticLogs()` - Get recent logs (admin)
   - `getDiagnosticLogsByDevice()` - Get logs by device ID
   - `cleanupOldLogs()` - Delete old logs (keep last 100)

---

## Setup Steps

### Step 1: Apply Database Migration

1. Open Supabase SQL Editor:
   - Go to: https://supabase.com/dashboard/project/tnqdlzbsbbyituoexhku
   - Navigate to: SQL Editor

2. Run the migration:
   ```sql
   -- Copy the ENTIRE apply-migrations.sql file and run it
   -- Or just run the new PART 4 section if tables already exist
   ```

3. Verify the table was created:
   ```sql
   SELECT * FROM diagnostic_logs LIMIT 1;
   ```

### Step 2: Generate TypeScript Types

Run this command in your project root:

```bash
npx supabase gen types typescript --project-id tnqdlzbsbbyituoexhku > src/integrations/supabase/types.ts
```

This will update the TypeScript types to include the new `diagnostic_logs` table.

### Step 3: Build and Deploy

1. **Commit changes to GitHub:**
   ```bash
   git add .
   git commit -m "Add Supabase diagnostic logging system"
   git push
   ```

2. **Vercel will auto-deploy** the web version

3. **Build Android APK:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

4. **Install on kiosk tablet**

---

## How to Use

### On the Kiosk (Android Device):

1. Click the **🔧 Debug** button (blue) on the landing page
2. Click **"▶️ Run Full Diagnostics"**
3. Wait for diagnostics to complete
4. Click **"☁️ Save to Supabase"** (green button)
5. You'll see a success message with the Log ID

### In the Admin Panel:

1. Go to: `https://your-app.vercel.app/admin`
2. Login with admin credentials
3. Click **"Diagnostic Logs"** in the sidebar
4. View all diagnostic logs from all devices
5. Click **"View"** to see full log details
6. Click **"Download"** to save a log file

---

## What Gets Logged

Each diagnostic log contains:

- **Platform Information**: Android, iOS, or Web
- **Device ID**: Unique identifier for the device
- **Printer Status**: connected, disconnected, or error
- **Supabase Connection**: Whether database is reachable
- **Error Count**: Number of errors detected
- **Full Log Text**: Complete diagnostic output
- **User Agent**: Browser/WebView information
- **Timestamp**: When the diagnostic was run

---

## Benefits

✅ **No USB Required**: Logs saved directly to cloud
✅ **Remote Debugging**: View logs from anywhere
✅ **Historical Data**: Keep track of all diagnostics
✅ **Multi-Device**: See logs from all kiosks in one place
✅ **Easy Filtering**: Sort by platform, errors, date
✅ **Fast**: Indexed queries for quick access

---

## Troubleshooting

### "Failed to save to Supabase"
- Check internet connection on kiosk
- Verify Supabase credentials in `.env`
- Check if migration was applied correctly

### "No diagnostic logs found" (Admin)
- Make sure migration was applied
- Verify at least one log was saved from kiosk
- Check Supabase dashboard for data

### Types not found
- Run the `npx supabase gen types` command
- Restart your dev server

---

## Next Steps (Optional Enhancements)

1. **Auto-upload on errors**: Automatically save diagnostics when errors occur
2. **Real-time monitoring**: WebSocket connection to monitor kiosks live
3. **Alerts**: Email/SMS when critical errors detected
4. **Analytics**: Charts showing error trends over time
5. **Export**: Bulk export logs to CSV/Excel

---

## File Changes Summary

### New Files:
- `src/services/diagnosticLogs.ts` - Service functions
- `src/pages/admin/DiagnosticLogs.tsx` - Admin viewer page
- `DIAGNOSTIC_LOGS_SETUP.md` - This guide

### Modified Files:
- `apply-migrations.sql` - Added diagnostic_logs table
- `src/pages/SystemDiagnostics.tsx` - Added Save to Supabase button
- `src/App.tsx` - Added admin route
- `src/components/admin/AdminLayout.tsx` - Added navigation link

---

**You're all set!** 🎉

Now when you test the printer and get an error, just run diagnostics and save to Supabase. Then you can immediately view the logs from the admin panel to debug the issue.
