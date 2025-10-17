# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
bikeshop_pro/
├── public/                        # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── assets/
│       └── images/
│           └── no_image.png
├── src/                           # Source code
│   ├── App.jsx                    # Main application component
│   ├── index.jsx                  # Application entry point
│   ├── Routes.jsx                 # Application routes
│   ├── components/                # Shared/reusable UI components
│   │   ├── AppIcon.jsx
│   │   ├── AppImage.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── ui/                    # UI primitives
│   │       ├── Breadcrumb.jsx
│   │       ├── Button.jsx
│   │       ├── Checkbox.jsx
│   │       ├── Header.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Sidebar.jsx
│   │       └── UserMenu.jsx
│   ├── pages/                     # Top-level pages and features
│   │   ├── NotFound.jsx
│   │   ├── dashboard/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── ActivityFeed.jsx
│   │   │       ├── LowStockAlert.jsx
│   │   │       ├── MetricsCard.jsx
│   │   │       ├── QuickActions.jsx
│   │   │       ├── RecentTransactions.jsx
│   │   │       └── SalesChart.jsx
│   │   ├── inventory-management/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── BulkActionsToolbar.jsx
│   │   │       ├── InventoryFilters.jsx
│   │   │       ├── InventorySidebar.jsx
│   │   │       ├── InventoryTable.jsx
│   │   │       ├── MobileInventoryCard.jsx
│   │   │       └── ProductModal.jsx
│   │   ├── login/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── LoginBackground.jsx
│   │   │       ├── LoginForm.jsx
│   │   │       ├── LoginHeader.jsx
│   │   │       └── SecurityBadges.jsx
│   │   ├── point-of-sale/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── CategoryFilter.jsx
│   │   │       ├── CustomerLookup.jsx
│   │   │       ├── PaymentMethods.jsx
│   │   │       ├── ProductGrid.jsx
│   │   │       ├── ProductSearch.jsx
│   │   │       └── ShoppingCart.jsx
│   │   ├── product-details/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── ProductActions.jsx
│   │   │       ├── ProductHeader.jsx
│   │   │       ├── ProductImageGallery.jsx
│   │   │       └── ProductInfoTabs.jsx
│   │   ├── sales-reports/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── CategoryChart.jsx
│   │   │       ├── InsightsPanel.jsx
│   │   │       ├── KPICards.jsx
│   │   │       ├── ReportHeader.jsx
│   │   │       ├── SalesChart.jsx
│   │   │       └── TransactionTable.jsx
│   │   ├── settings/
│   │   │   ├── Preferences.jsx
│   │   │   └── ProfileSettings.jsx
│   │   └── support/
│   │       └── HelpSupport.jsx
│   ├── styles/                    # Global styles and Tailwind configuration
│   │   ├── index.css
│   │   └── tailwind.css
│   └── utils/                     # Utility functions
│       └── cn.js
├── .env                           # Environment variables
├── index.html                     # HTML template
├── package.json                   # Project dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
└── vite.config.js                 # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.

## 📦 Deployment

Build the application for production:

```bash
npm run build
```