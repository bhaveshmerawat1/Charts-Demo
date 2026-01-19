# Chart Options - Project Overview

## 📊 Project Description

**Chart Options** is a modern, feature-rich data visualization application built with Next.js 16. The project provides multiple charting library implementations (ECharts and Highcharts) for creating interactive, responsive charts and dashboards. It includes a comprehensive stock market dashboard with real-time data visualization, KPI tracking, and export capabilities.

## 🚀 Technology Stack

### Core Framework
- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5** - Type-safe development

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- Dark mode support with theme toggle

### Charting Libraries
- **Highcharts 11.4.8** - Professional charting library
- **highcharts-react-official 3.2.3** - Official React wrapper
- **@highcharts/dashboards 4.0.0** - Dashboard components
- **ECharts 6.0.0** - Apache ECharts library
- **echarts-for-react 3.0.5** - React wrapper for ECharts

### Data Management & Export
- **xlsx 0.18.5** - Excel file generation
- **jsPDF 4.0.0** - PDF generation
- **html2canvas-pro 1.6.4** - Screenshot/canvas export
- **html2pdf.js 0.14.0** - HTML to PDF conversion

### UI Components
- **react-icons 5.5.0** - Icon library
- **clsx 2.1.1** - Conditional className utility

### Development Tools
- **ESLint 9** - Code linting
- **Babel React Compiler 1.0.0** - React optimization

## ✨ Key Features

### 1. **Multi-Library Chart Support**
   - Dual implementation with both ECharts and Highcharts
   - Side-by-side comparison of charting libraries
   - Library-specific configuration and theming

### 2. **Stock Market Dashboard**
   - Real-time market index tracking (NIFTY 50)
   - Stock KPI cards with key metrics
   - Interactive price charts with multiple time periods
   - Most active stocks monitoring
   - Shareholding pattern visualization
   - CAGR (Compound Annual Growth Rate) calculations

### 3. **Data Visualization Components**
   - Area charts with gradient fills
   - Line charts with animated markers
   - Bar charts for comparative data
   - Donut/Pie charts for distribution data
   - Custom tooltips and legends

### 4. **Export Functionality**
   - **PDF Export** - Full dashboard to PDF
   - **Excel Export** - Data tables to Excel
   - **PNG Export** - Charts as images
   - **CSV Export** - Raw data export

### 5. **Theming & Dark Mode**
   - Light/Dark theme toggle
   - Theme persistence
   - Custom color schemes for each charting library
   - Responsive design for all screen sizes

### 6. **Interactive Features**
   - Time period selection (1D, 1W, 1M, 3M, 6M, 1Yr, 3Yr, 5Yr)
   - Real-time data updates
   - Hover interactions with detailed tooltips
   - Blinking markers for latest data points
   - Responsive grid layouts

## 📁 Project Structure

```
chart_options/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API routes
│   │   │   └── stock/
│   │   │       ├── batch-quotes/    # Batch stock quotes endpoint
│   │   │       ├── quote/           # Single stock quote endpoint
│   │   │       └── time-series/     # Historical data endpoint
│   │   ├── echarts/                 # ECharts demo page
│   │   ├── highcharts/              # Highcharts demo page
│   │   ├── stock-dashboard/         # Main stock dashboard
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   │
│   ├── assets/                      # Image assets and exports
│   │
│   ├── components/                  # Reusable components
│   │   ├── Button/                  # Custom button component
│   │   ├── Charts/
│   │   │   ├── echarts/             # ECharts wrapper components
│   │   │   │   ├── Chart.tsx
│   │   │   │   ├── dataTransformers.ts
│   │   │   │   └── KPICard.tsx
│   │   │   └── HighCharts/          # Highcharts wrapper components
│   │   │       ├── config.ts
│   │   │       ├── HighchartWrapper.tsx
│   │   │       ├── registryData.ts
│   │   │       ├── themes.ts
│   │   │       └── types.ts
│   │   ├── SelectDropdown/          # Dropdown component
│   │   ├── Stock/                   # Stock-specific components
│   │   │   ├── MarketIndexChart.tsx
│   │   │   ├── MostActiveStocks.tsx
│   │   │   ├── ShareholdingPattern.tsx
│   │   │   ├── StockKPICards.tsx
│   │   │   └── StockPriceChart.tsx
│   │   ├── SubComponents/           # Dashboard sub-components
│   │   │   └── Dashboard/
│   │   └── ThemeToggle/             # Theme switcher
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── StockContext.tsx         # Stock data state management
│   │   └── ThemeContext.tsx         # Theme state management
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── echarts.ts
│   │   └── stock.ts
│   │
│   └── utils/                       # Utility functions and data
│       ├── dashboardData.json
│       ├── userData.json
│       └── echarts/
│           ├── dashboardData.json
│           └── userData.json
│
├── eslint.config.mjs                # ESLint configuration
├── next.config.ts                   # Next.js configuration
├── package.json                     # Project dependencies
├── postcss.config.mjs               # PostCSS configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Setup instructions
```

## 🎯 Core Components

### Context Providers

#### StockContext
- Manages stock market data state
- Handles API calls for quotes and time-series data
- Provides export functionality (PDF, Excel, PNG, CSV)
- Time period selection management
- Loading states and error handling

#### ThemeContext
- Theme state management (light/dark mode)
- Theme persistence to localStorage
- System preference detection

### Chart Components

#### ECharts Implementation
- `Chart.tsx` - Main ECharts wrapper component
- `KPICard.tsx` - Key Performance Indicator cards
- `dataTransformers.ts` - Data transformation utilities
- Custom themes and configurations

#### Highcharts Implementation
- `HighchartWrapper.tsx` - Reusable Highcharts wrapper
- `config.ts` - Default chart configurations
- `themes.ts` - Custom theme definitions
- `registryData.ts` - Chart type registry
- Support for area, line, bar, donut charts

### Stock Dashboard Components

1. **MarketIndexChart** - Main index tracking with:
   - Interactive time period selection
   - CAGR calculation and display
   - Blinking end-point marker
   - Gradient area fills
   - Responsive design

2. **StockKPICards** - Key metrics display:
   - Current price
   - Day's range
   - 52-week high/low
   - Volume tracking

3. **StockPriceChart** - Detailed price visualization:
   - Historical price data
   - Volume overlay
   - Multiple time periods

4. **MostActiveStocks** - Top active stocks list:
   - Real-time price updates
   - Change indicators
   - Quick stock selection

5. **ShareholdingPattern** - Ownership breakdown:
   - Pie/donut chart visualization
   - Percentage distribution
   - Category legends

## 🔌 API Integration

### API Routes

#### `/api/stock/quote`
- Fetches single stock quote data
- Query params: `symbol`
- Returns: Current price, change, volume, 52-week data

#### `/api/stock/batch-quotes`
- Fetches multiple stock quotes
- Query params: `symbols` (comma-separated)
- Returns: Array of stock quotes

#### `/api/stock/time-series`
- Fetches historical price data
- Query params: `symbol`, `interval`, `outputsize`
- Returns: Time-series data with dates and values

## 🎨 Theming System

### Color Schemes
- **Light Mode**: Clean, professional with blue accents
- **Dark Mode**: Dark gray backgrounds with bright accents
- **Chart Colors**: Context-aware (green for gains, red for losses)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid layouts with Tailwind CSS
- Flexible chart sizing

## 📊 Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Context Provider (StockContext)
    ↓
API Route (/api/stock/*)
    ↓
External Data Source (TwelveData API)
    ↓
Data Processing & Transformation
    ↓
State Update (React Context)
    ↓
Component Re-render
    ↓
Chart Visualization Update
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd chart_options

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 🌐 Application Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with library selection |
| `/echarts` | ECharts demonstration page |
| `/highcharts` | Highcharts demonstration page |
| `/stock-dashboard` | Complete stock market dashboard |

## 🎛️ Configuration Files

- **next.config.ts** - Next.js framework configuration
- **tsconfig.json** - TypeScript compiler options
- **tailwind.config.js** - Tailwind CSS customization
- **eslint.config.mjs** - Code quality rules
- **postcss.config.mjs** - CSS processing pipeline

## 🔧 Key Features Implementation

### Export Functionality
- **PDF**: Uses html2canvas + jsPDF for DOM to PDF conversion
- **Excel**: XLSX library for data table export
- **PNG**: html2canvas for chart screenshots
- **CSV**: Custom CSV generation from data arrays

### Chart Animations
- Smooth transitions on data updates
- Hover effects with tooltips
- Blinking markers for latest data points
- Loading states with spinners

### Performance Optimizations
- React Compiler for automatic optimizations
- Memoization with useMemo and useCallback
- Lazy loading of chart libraries
- Code splitting with Next.js dynamic imports

## 📈 Future Enhancement Opportunities

- Real-time WebSocket data streaming
- More chart types (candlestick, scatter, heatmap)
- Advanced technical indicators
- Watchlist and portfolio tracking
- User authentication and preferences
- Historical data comparison
- Mobile app version
- Multi-language support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js, React, and modern web technologies**
