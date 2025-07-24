# Campaign Funnel Dashboard

A modern analytics dashboard for tracking campaign performance with Community Intelligence integration.

## 🚀 Features

- **Real-time**: Track user activity in real time
- **Funnel analytics**: Detailed analysis of conversion at each stage
- **Community Intelligence**: Community sentiment and activity analysis
- **Responsive design**: Full mobile support
- **Dark theme**: Light and dark theme support
- **Modular architecture**: Clear separation of components and logic

## 🛠 Technologies

- **React 19** - Modern library for creating user interfaces
- **TypeScript** - Typed JavaScript for code reliability
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Recharts** - Charting library
- **Lucide React** - Modern icons
- **date-fns** - Utilities for working with dates

## 📁 Project structure

```
src/
├── components/
│ ├── layout/ # Layout components
│ │ ├── AppHeader.tsx
│ │ ├── AppSidebar.tsx
│ │ └── ThemeToggle.tsx
│ ├── views/ # Page views
│ │ ├── OverviewView.tsx
│ │ ├── FunnelView.tsx
│ │ └── UsersView.tsx
│ ├── ui/ # UI components
│ └── ... # Other components
├── lib/
│ ├── api.ts # API module with mock data
│ └── utils.ts # Utilities
├── hooks/ # React hooks
└── ...
```

## 🎯 Main components

### API Module (`src/lib/api.ts`)
Centralized module for working with data:
- `getFunnelData()` - conversion funnel data
- `getCommunityData()` - community data
- `getHistoricalData()` - historical data
- `getUsers()` - user list
- `getUserActivity()` - user activity
- `refreshData()` - refresh data

### Views
- **OverviewView** - General overview with KPIs and graphs
- **FunnelView** - Detailed analysis of the conversion funnel
- **UsersView** - Manage users and their activity

### Layout components
- **AppHeader** - Header with navigation and controls
- **AppSidebar** - Sidebar navigation
- **ThemeToggle** - Switch theme

## 🚀 Installation and launch

1. **Cloning the repository**
```bash
git clone <repository-url>
cd campaign-funnel-dashboard
```

2. **Installing dependencies**
```bash
npm install
```

3. **Running in development mode**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 📊 Functionality

### Overview
- KPI cards with key metrics
- Conversion funnel graph
- Trend analysis
- Community Intelligence panel

### Funnel
- Detailed analysis of each funnel stage
- Conversion rates
- Visualization of losses at each stage

### Users
- List of campaign participants
- Detailed user activity
- Analysis of quest progress

## 🎨 Themes

The application supports automatic switching between light and dark themes depending on the user's system settings.

## 🔧 Configuration

### Vite
Configured with path aliases and dependency optimizations:
```typescript
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
},
},
optimizeDeps: {
include: ['react-is'],
},
```

### Tailwind CSS
Advanced configuration with custom colors and animations to support dark theme.

## 📈 Roadmap

- [ ] Integration with real APIs
- [ ] Export data in various formats
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Integration with external services

## 📄 License

MIT License
