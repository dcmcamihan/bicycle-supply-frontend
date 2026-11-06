# Jolen's Bicycle Supply: Frontend

A point-of-sale (POS) and inventory management system for Jolen's Bicycle Supply, a bicycle shop in Digos City, Philippines. It replaces the shop's paper logs and spreadsheets with one web app for sales, stock tracking and reports.

**Live site:** https://bicycle-supply-frontend.onrender.com
**Backend:** [bicycle-supply-backend](https://github.com/dcmcamihan/bicycle-supply-backend) (Node.js, Express, MySQL)

## Features

- **Dashboard:** today's sales, total inventory, low-stock alerts, pending orders and a sales chart by day, week or month
- **Point of sale:** product search and category filters, a cart, customer lookup, and cash, card, bank transfer and e-wallet payments
- **Inventory:** add, edit, archive and adjust stock, with a product details page and image gallery
- **Orders and returns:** pending orders and return processing
- **Sales reports:** KPIs, best sellers, category and payment breakdowns, peak hours and staff performance, exportable to PDF and Excel
- **Management:** employees, suppliers, brands, categories and attendance, with manager-only routes
- **Accounts:** login, sign-up, password reset, profile and preferences

## Tech stack

- React 18 with React Router v6
- Vite
- Tailwind CSS
- Axios for API calls, with all endpoints in `src/config/api.js`
- Recharts and D3 for charts
- jsPDF and ExcelJS for report exports
- Framer Motion for animations

## Getting started

Requires Node.js 18 or later and a running instance of the backend.

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the project root that points to the backend API:
   ```sh
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
3. Start the development server:
   ```sh
   npm start
   ```
   The app runs at http://localhost:4028.

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Vite development server |
| `npm run build` | Builds the app into `build/` |
| `npm run serve` | Previews the production build |

To run the app with Docker instead, see [README_DOCKER.md](README_DOCKER.md).

## Project structure

```
src/
├── components/   Shared UI (buttons, inputs, header, sidebar, toasts)
├── config/       API endpoint definitions
├── contexts/     AuthContext for login state and protected routes
├── pages/        One folder per screen (dashboard, point-of-sale, inventory, sales reports, ...)
├── styles/       Global styles and Tailwind setup
├── utils/        Helpers for the cart, report exports and class names
└── Routes.jsx    App routes
```
