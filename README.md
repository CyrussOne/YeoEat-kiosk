# YeloEat Kiosk - Self-Service Ordering System

A modern self-service kiosk ordering system with WINTEC printer integration, built for fast food restaurants.

## Features

- 🍔 **Multi-language Support** (English/German)
- 🛒 **Smart Cart Management** with real-time calculations
- 💳 **Flexible Payment Options** (Card/Cashier)
- 🖨️ **WINTEC Thermal Printer Integration**
- 📱 **Android Capacitor Integration**
- 🗄️ **Supabase Backend** with real-time database
- 🎨 **Modern UI** with Tailwind CSS and shadcn/ui
- ♿ **Accessibility Features** (font scaling, touch-friendly)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context + TanStack Query
- **Mobile**: Capacitor 7 (Android)
- **Printer**: WINTEC SDK (WT-SDK.jar)

## Prerequisites

- Node.js 18+ and npm
- Android Studio (for APK build)
- WINTEC device (K7, K9, or compatible)
- Supabase account

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/CyrussOne/YeoEat-kiosk.git
cd YeoEat-kiosk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 4. Apply Database Migrations

Go to your Supabase dashboard → SQL Editor and run:
- `supabase/migrations/20251117000000_create_orders_tables.sql`
- `supabase/migrations/20251117000001_seed_products.sql`

### 5. Start Development Server

```bash
npm run dev
```

Open http://localhost:8080/

## Building for Android

### 1. Build Web Assets

```bash
npm run build
```

### 2. Add Android Platform

```bash
npx cap add android
```

### 3. Integrate WINTEC SDK

```bash
# Copy SDK to Android libs
mkdir -p android/app/libs
cp android-integration/WT-SDK.jar android/app/libs/
```

Edit `android/app/build.gradle` and add:
```gradle
dependencies {
    implementation files('libs/WT-SDK.jar')
}
```

### 4. Create PrinterPlugin

Follow instructions in `android-integration/README.md` to:
- Create `PrinterPlugin.java`
- Register plugin in `MainActivity.java`

### 5. Build APK

```bash
npx cap sync
npx cap open android
```

In Android Studio: Build → Build APK(s)

## Project Structure

```
yeloeat-kiosk/
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Cart, Language, Auth)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Supabase client
│   ├── pages/            # Route pages
│   ├── plugins/          # Capacitor plugins
│   ├── services/         # Business logic (orders, products)
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
├── supabase/            # Database migrations
├── android-integration/ # WINTEC SDK files
└── android/            # Generated Android project
```

## Database Schema

- **products**: Menu items (name, price, category, images)
- **orders**: Customer orders (order number, total, status)
- **order_items**: Line items for each order
- **profiles**: User profiles
- **user_roles**: Role-based access control
- **company_settings**: Business information
- **printer_settings**: Printer configuration
- **receipt_layout**: Receipt customization

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | `abc123xyz` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key | `eyJhbGci...` |
| `VITE_SUPABASE_URL` | Supabase API URL | `https://abc123.supabase.co` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Documentation

- [Android Setup Guide](android-integration/README.md) - WINTEC printer integration
- [Clean Migration Plan](CLEAN_MIGRATION_PLAN.md) - Migration from Lovable
- [Deployment Task Plan](DEPLOYMENT_TASK_PLAN.md) - Step-by-step deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@yeloeat.com

## Acknowledgments

- WINTEC for printer SDK
- Supabase for backend infrastructure
- shadcn/ui for beautiful components
- Capacitor for mobile integration
