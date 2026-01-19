# Madadgaar Expert Partner - Frontend

<div align="center">
  <img src="public/Media/Group%2033.png" alt="Madadgaar Logo" width="200"/>
  
  **Pakistan's Most Trusted Marketplace for Property, Insurance, Loans & Installment Plans**
  
  [![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-Private-red.svg)]()
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [SEO Features](#-seo-features)
- [Key Components](#-key-components)
- [Pages](#-pages)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Team](#-team)
- [Contact](#-contact)

---

## 🌟 Overview

Madadgaar Expert Partner is a comprehensive marketplace platform that simplifies access to essential services across Pakistan. Our platform connects users with verified service providers for:

- **Property Solutions** - Buy, sell, rent properties nationwide
- **Insurance Support** - Resolve complaints and find the best coverage
- **Loan Services** - Access flexible financing options
- **Installment Plans** - Buy now, pay later with easy monthly payments

### Mission
To simplify life by offering trusted solutions through a single, reliable platform while partnering with service providers and connecting them with verified local agents across Pakistan.

### Vision
To become Pakistan's largest and most trusted marketplace for service and financial solutions, driving sustainable growth and contributing to Pakistan's economic development.

---

## ✨ Features

### Core Features
- ✅ **Multi-Service Marketplace** - Property, Insurance, Loans, Installments
- ✅ **Advanced Search & Filters** - Find exactly what you need
- ✅ **Comparison Tools** - Compare multiple options side-by-side
- ✅ **User Authentication** - Secure login with OTP verification
- ✅ **Responsive Design** - Optimized for mobile, tablet, and desktop
- ✅ **SEO Optimized** - Full meta tags, structured data, and sitemap
- ✅ **PWA Ready** - Progressive Web App capabilities
- ✅ **Real-time Updates** - Dynamic content loading
- ✅ **Blog System** - News, tips, and insights

### User Experience
- 🎨 **Modern UI/UX** - Clean, intuitive interface
- 📱 **Mobile-First Design** - 2-column grid layouts on mobile
- ⚡ **Fast Loading** - Optimized performance with lazy loading
- 🔍 **Smart Search** - Intelligent filtering and sorting
- 🎭 **Skeleton Loaders** - Smooth loading experiences
- 🌐 **Multi-Language Ready** - English and Urdu support structure

### Business Features
- 👥 **Team Showcase** - Dynamic team member profiles with roles
- 🎯 **Lead Generation** - Contact forms and inquiry system
- 📊 **Analytics Integration** - Google Analytics tracking
- 🔒 **Secure** - Protected routes and authentication
- 📧 **Email Integration** - Automated notifications
- 🤝 **Partner Management** - Showcase partner companies

---

## 🛠 Tech Stack

### Frontend Core
- **React 19.2** - UI library
- **React Router DOM 7.9** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework

### UI & Animations
- **Framer Motion 12.23** - Smooth animations
- **Lucide React** - Icon library
- **React CountUp** - Number animations

### SEO & Performance
- **React Helmet Async** - Dynamic meta tags
- **Sitemap.xml** - Search engine optimization
- **Structured Data** - Schema.org markup
- **Progressive Web App** - PWA support

### Data & State
- **Axios** - HTTP client
- **Date-fns** - Date manipulation
- **Recharts** - Data visualization

### Development Tools
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **React Scripts 5.0** - Build tooling

---

## 📁 Project Structure

```
madagaar-frontend/
├── public/
│   ├── Media/                    # Images and assets
│   ├── favcions/                 # Favicon files
│   ├── index.html               # HTML template
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # SEO robots file
│   └── sitemap.xml              # SEO sitemap
│
├── src/
│   ├── Accounts/                # Authentication pages
│   │   ├── LoginPage.jsx
│   │   ├── SignupPages.jsx
│   │   ├── OtpVerifications.jsx
│   │   ├── forgotpassword.jsx
│   │   └── NewPassword.jsx
│   │
│   ├── components/              # Reusable components
│   │   ├── SEO.jsx             # SEO meta tags component
│   │   ├── TeamMemberCard.jsx  # Team member card
│   │   ├── SkeletonLoader.jsx  # Loading skeletons
│   │   └── OptionBuilder.jsx   # Dynamic options
│   │
│   ├── compontents/             # Layout components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Footer.jsx          # Footer
│   │   ├── Loader.jsx          # Loading spinner
│   │   └── ProtectedRoute.jsx  # Route protection
│   │
│   ├── pages/
│   │   ├── clients/            # Public pages
│   │   │   ├── HomePages.jsx
│   │   │   ├── About.jsx
│   │   │   ├── TeamMemberDetail.jsx
│   │   │   ├── Properties/
│   │   │   │   ├── properties.jsx
│   │   │   │   └── PropertyDetails.jsx
│   │   │   ├── Installment/
│   │   │   │   ├── InstallementPage.jsx
│   │   │   │   └── installmentoverview.jsx
│   │   │   ├── Loans/
│   │   │   │   ├── clientPageLoan.jsx
│   │   │   │   └── LoanDeailtsById.jsx
│   │   │   ├── Insurance/
│   │   │   │   ├── insurance.jsx
│   │   │   │   └── apply-insurance.jsx
│   │   │   └── blogs/
│   │   │       └── Blogs.jsx
│   │   └── 404Page.jsx
│   │
│   ├── constants/               # Configuration & data
│   │   ├── apiUrl.js           # API endpoints
│   │   ├── cities.js           # Pakistan cities
│   │   ├── teamMembers.js      # Team data
│   │   └── PropertiesData.js   # Property types
│   │
│   ├── utils/                   # Utility functions
│   │   └── auth.js             # Authentication helpers
│   │
│   ├── App.js                   # Main app component
│   ├── index.js                 # Entry point
│   └── index.css               # Global styles
│
├── package.json                 # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Madadgaar3377/madagaar-frontend.git
   cd madagaar-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   > **Note**: The `.npmrc` file automatically handles React 19 compatibility with `legacy-peer-deps=true`
   > 
   > This is required because `react-helmet-async@2.0.5` has peer dependency constraints with React 19.

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   REACT_APP_API_URL=your_backend_api_url
   REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📜 Available Scripts

### Development

```bash
# Start development server
npm start

# Alternative command
npm run dev
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Production

```bash
# Build for production
npm run build
```

Creates optimized production build in the `build` folder

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Check for linting issues
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=https://api.madadgaar.com.pk
REACT_APP_API_TIMEOUT=30000

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Application
REACT_APP_NAME=Madadgaar Expert Partner
REACT_APP_VERSION=0.1.0

# Features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
```

---

## 🎯 SEO Features

### Comprehensive SEO Implementation

#### 1. **Meta Tags**
- Dynamic title and description for each page
- Open Graph tags for social media
- Twitter Card tags
- Canonical URLs

#### 2. **Structured Data**
- Organization schema
- Person schema (team members)
- Product schema (properties, loans, installments)
- BreadcrumbList schema

#### 3. **Performance**
- Lazy loading images
- Code splitting
- Minified assets
- Optimized bundle size

#### 4. **Accessibility**
- ARIA labels
- Semantic HTML
- Keyboard navigation
- Screen reader support

#### 5. **Technical SEO**
- robots.txt
- sitemap.xml
- Mobile-friendly design
- Fast loading times
- HTTPS ready

### SEO Component Usage

```jsx
import SEO from '../components/SEO';

<SEO
  title="Your Page Title"
  description="Page description for SEO"
  keywords="keyword1, keyword2, keyword3"
  canonicalUrl="https://madadgaar.com.pk/page"
  ogImage="https://madadgaar.com.pk/image.jpg"
/>
```

---

## 🧩 Key Components

### SEO Component
Dynamic meta tags and structured data for search engines

```jsx
<SEO
  title="Page Title"
  description="Description"
  keywords="keywords"
  canonicalUrl="https://url.com"
  structuredData={schemaObject}
/>
```

### TeamMemberCard
Displays team member information with social links

```jsx
<TeamMemberCard
  member={memberObject}
  showDetails={true}
/>
```

### SkeletonLoader
Loading placeholders for better UX

```jsx
import { TeamMemberSkeleton, GridSkeletonLoader } from './components/SkeletonLoader';

<GridSkeletonLoader
  count={6}
  SkeletonComponent={TeamMemberSkeleton}
  columns="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
/>
```

### ProtectedRoute
Route protection for authenticated pages

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 📄 Pages

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with services overview |
| About | `/about` | Company information, team, mission |
| Team Member | `/team/:id` | Individual team member profile |
| Properties | `/properties` | Property listings with filters |
| Property Details | `/property/:id` | Single property details |
| Loans | `/loans` | Loan options and plans |
| Loan Details | `/loans/:id` | Single loan details |
| Installments | `/installments` | Installment plans |
| Installment Details | `/installment/:id` | Single installment details |
| Insurance | `/insurance` | Insurance information |
| Blog | `/blog` | News and articles |

### Authentication Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/account` | User login |
| Register | `/account/register` | User registration |
| OTP Verify | `/account/verify-otp` | OTP verification |
| Forgot Password | `/account/forgot` | Password recovery |
| Reset Password | `/account/reset` | New password setup |

---

## 🌐 Deployment

### Quick Deployment Fix

**⚠️ Important for Vercel/Netlify**: The project includes configuration files to handle React 19 compatibility:
- `.npmrc` - Sets `legacy-peer-deps=true` for automatic dependency resolution
- `vercel.json` - Optimized routing and caching for SPA
- `.vercelignore` - Excludes unnecessary files from deployment

These files ensure successful deployment without dependency conflicts.

### Build for Production

```bash
npm run build
```

For detailed deployment instructions to Vercel, Netlify, cPanel, or Docker, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deploy to Hosting

#### Vercel

**Important**: The project includes a `.npmrc` file with `legacy-peer-deps=true` for React 19 compatibility.

```bash
# Deploy using Vercel CLI
npm i -g vercel
vercel

# Or connect your GitHub repo to Vercel dashboard
# The .npmrc file will automatically handle dependency installation
```

**Vercel Configuration**:
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install` (automatically uses .npmrc settings)

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### cPanel/VPS
1. Build the project: `npm run build`
2. Upload `build` folder to server
3. Configure `.htaccess` for React Router:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📚 Documentation

### Available Guides

- **[CHANGELOG.md](./CHANGELOG.md)** - Version history, feature updates, and bug fixes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide for Vercel, Netlify, cPanel, and Docker
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Developer guidelines and coding standards
- **[README.md](./README.md)** - This file (project overview and quick start)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style

- Use ES6+ features
- Follow React best practices
- Write clean, readable code
- Add comments for complex logic
- Maintain consistent formatting

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Add or update tests
chore: Maintenance tasks
```

---

## 👥 Team

### Leadership

- **Raja Afzal** - Founder & CEO
  - Email: ceo@madadgaar.com.pk
  - Phone: +92 310 4179363

- **Saud Ch** - Director & CEO
  - Email: saud.ch@madadgaar.com.pk
  - Phone: +92 307 111 333 0

### Operations & Marketing

- **Ayesha** - Head of Marketing & Operations
  - Email: ayesha@madadgaar.com.pk
  - Phone: +92 307 111 333 0

### Technology

- **Abubakkar Sajid** - Head of IT & Innovation | Lead Software Engineer
  - Email: abubakkarsajid4@gmail.com
  - Phone: +92 324 185 147 6
  - GitHub: [@Innocent-Developer](https://github.com/Innocent-Developer)
  - LinkedIn: [Abubakkar Sajid](https://www.linkedin.com/in/mughal-abubakkar/)

---

## 📞 Contact

### Company Information

**Madadgaar Expert Partner**

- **Website**: [https://madadgaar.com.pk](https://madadgaar.com.pk)
- **Email**: support@madadgaar.com.pk
- **Phone**: +92 307 111 333 0
- **Address**: Gulberg III, Lahore, Pakistan

### Support

For technical support or inquiries:
- Email: support@madadgaar.com.pk
- Phone: +92 307 111 333 0

### Social Media

- **LinkedIn**: [Madadgaar Expert Partner](#)
- **Facebook**: [Madadgaar](#)
- **Instagram**: [@madadgaar](#)

---

## 📝 License

This project is **proprietary and confidential**. All rights reserved by Madadgaar Expert Partner.

© 2024-2026 Madadgaar Expert Partner. Designed & Developed By Code-XA.

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors
- Our amazing team and partners

---

<div align="center">
  <strong>Built with ❤️ in Pakistan</strong>
  
  <br/><br/>
  
  **Making life easier, one service at a time**
</div>
