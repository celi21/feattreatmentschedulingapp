# FeatTreatment - Business Scheduling Platform

A comprehensive scheduling and storefront platform for service businesses, similar to GlossGenius and Fresha Partners.

## 🌟 Features

### ✅ Completed Core Features

#### **User Authentication & Business Management**
- User registration and authentication with NextAuth
- Business profile creation with custom branding
- Secure password hashing and session management

#### **Subscription Tiers**
- **Free Tier**: Up to 8 services, product catalog, branded booking page
- **Paid Tier 1**: Unlimited services and products, enhanced customization  
- **Paid Tier 2**: Business analytics, marketing tools, custom domain support
- Universal 2.9% transaction fee across all tiers

#### **Branded Scheduling Profiles**
- Custom business profiles with branding (colors, logo, description)
- Public booking pages at `/book/{business-slug}`
- Mobile-responsive design
- Service management with categories and pricing

#### **Product Catalog System**
- Upload and manage physical/digital products
- Image upload with auto-resizing (Sharp integration)
- Inventory management for physical products
- Pricing and SKU management

#### **Booking System**
- Real-time availability checking
- Multi-step booking widget
- Service and provider selection
- Customer information collection
- Email confirmation system (ready for integration)

#### **Business Dashboard**
- Overview with key metrics
- Service management (add/edit/delete/activate)
- Product catalog management
- Appointment viewing
- Business settings and customization

#### **Mobile Optimization**
- Fully responsive design across all components
- Touch-friendly interfaces
- Mobile-first booking experience
- Optimized forms and navigation

### 🔄 Ready for Integration

#### **Stripe Payment Processing**
- Database schema includes payment tracking
- 2.9% platform fee calculation
- Payment intent structure ready
- Stripe integration endpoints prepared

#### **Email System**
- Confirmation email structure in place
- Ready for SendGrid/Mailgun integration

#### **File Storage**
- Image upload system with Sharp processing
- Ready for AWS S3/Cloudinary integration
- Auto-resizing to 800x800px with optimization

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: NextAuth.js with credentials provider
- **UI Components**: Lucide React icons
- **Image Processing**: Sharp
- **Deployment**: Vercel (configured)

## 🚀 Getting Started

### Prerequisites
- Node.js 22.x
- PostgreSQL database
- Environment variables (see below)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local`:
   ```env
   # Database
   POSTGRES_PRISMA_URL="your-postgres-connection-string"
   POSTGRES_URL_NON_POOLING="your-direct-postgres-connection"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Admin (for legacy admin panel)
   ADMIN_SECRET="your-admin-password"
   
   # Stripe (when ready to integrate)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
app/
├── api/                    # API endpoints
│   ├── auth/              # Authentication routes
│   ├── business/          # Business management APIs
│   └── appointments/      # Booking system APIs
├── auth/                  # Auth pages (signin/signup)
├── book/[slug]/          # Public booking pages
├── dashboard/             # Business owner dashboard
├── onboarding/           # New user setup flow
└── globals.css           # Global styles

components/
├── BookingWidget.tsx     # Multi-step booking interface
├── DashboardLayout.tsx   # Main dashboard layout
├── ProductCatalog.tsx    # Product display and cart
├── ServicesManager.tsx   # Service management interface
└── PublicBookingPage.tsx # Public-facing booking page

lib/
├── auth.ts              # NextAuth configuration
├── prisma.ts           # Database client
└── availability.ts     # Scheduling logic

prisma/
└── schema.prisma       # Database schema
```

## 🎯 Business Model

### Revenue Streams
1. **Subscription Revenue**: Monthly recurring revenue from paid tiers
2. **Transaction Fees**: 2.9% fee on all customer payments across all tiers
3. **Premium Features**: Analytics, marketing tools, custom domains

### Tier Comparison
| Feature | Free | Professional ($29/mo) | Enterprise ($79/mo) |
|---------|------|---------------------|-------------------|
| Services | Up to 8 | Unlimited | Unlimited |
| Products | ✅ | ✅ | ✅ |
| Branded Page | ✅ | ✅ | ✅ |
| Enhanced Customization | ❌ | ✅ | ✅ |
| Business Analytics | ❌ | ❌ | ✅ |
| Marketing Tools | ❌ | ❌ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ |
| Transaction Fee | 2.9% | 2.9% | 2.9% |

## 🔧 Next Steps for Production

### 1. Payment Integration
```bash
npm install stripe
```
- Complete Stripe Connect integration
- Set up webhook handling
- Implement subscription management

### 2. Email Service
```bash
npm install @sendgrid/mail
```
- Set up email templates
- Implement booking confirmations
- Add automated reminders

### 3. File Storage
```bash
npm install aws-sdk
```
- Configure AWS S3 or Cloudinary
- Update upload endpoints
- Add CDN for image delivery

### 4. Analytics & Monitoring
```bash
npm install @vercel/analytics
```
- Add business analytics dashboard
- Implement usage tracking
- Set up error monitoring

## 🌐 Deployment

The app is configured for Vercel deployment:

```bash
npm run build
npm run start
```

Environment variables needed in production:
- Database connection strings
- NextAuth configuration
- Stripe keys (when implemented)
- Email service credentials
- File storage credentials

## 📝 License

This is a commercial project. All rights reserved.

## 👥 Team

Built for entrepreneurs and small business owners who need professional scheduling and storefront capabilities without the complexity of enterprise solutions.

---

**Live Demo**: https://feattreatmentschedulingapp.vercel.app/

**Ready to scale**: The platform is built with growth in mind, supporting multiple businesses per user and enterprise features for larger clients.
