import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import MerchantLayout from './components/Layout/MerchantLayout';
import CustomerLayout from './components/Layout/CustomerLayout';

// Merchant Pages
import Dashboard from './pages/merchant/Dashboard';
import BulkOffers from './pages/merchant/BulkOffers';
import CreateOffer from './pages/merchant/CreateOffer';
import Bookings from './pages/merchant/Bookings';
import Products from './pages/merchant/Products';
import CustomerInsights from './pages/merchant/CustomerInsights';
import CustomerLoyalty from './pages/merchant/CustomerLoyalty';
import InvoiceIntelligence from './pages/merchant/InvoiceIntelligence';
import SpeakLedger from './pages/merchant/SpeakLedger';
import VyaparAssistant from './pages/merchant/VyaparAssistant';
import PilotReport from './pages/merchant/PilotReport';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import NearbyDeals from './pages/customer/NearbyDeals';
import ComparePrices from './pages/customer/ComparePrices';
import OfferDetail from './pages/customer/OfferDetail';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import MyBookings from './pages/customer/MyBookings';
import CustomerSavings from './pages/customer/CustomerSavings';
import SavedOffers from './pages/customer/SavedOffers';
import CustomerProfile from './pages/customer/CustomerProfile';

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        {/* Default route points to Merchant Dashboard */}
        <Route path="/" element={<Navigate to="/merchant/dashboard" replace />} />

        {/* ─── MERCHANT DASHBOARD ROUTES (Command Center) ─── */}
        <Route
          path="/merchant/dashboard"
          element={
            <MerchantLayout>
              <Dashboard />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/offers"
          element={
            <MerchantLayout>
              <BulkOffers />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/offers/create"
          element={
            <MerchantLayout>
              <CreateOffer />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/offers/edit/:id"
          element={
            <MerchantLayout>
              <CreateOffer />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/bookings"
          element={
            <MerchantLayout>
              <Bookings />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/products"
          element={
            <MerchantLayout>
              <Products />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/customer-insights"
          element={
            <MerchantLayout>
              <CustomerInsights />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/loyalty"
          element={
            <MerchantLayout>
              <CustomerLoyalty />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/invoices"
          element={
            <MerchantLayout>
              <InvoiceIntelligence />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/ledger"
          element={
            <MerchantLayout>
              <SpeakLedger />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/assistant"
          element={
            <MerchantLayout>
              <VyaparAssistant />
            </MerchantLayout>
          }
        />
        <Route
          path="/merchant/reports"
          element={
            <MerchantLayout>
              <PilotReport />
            </MerchantLayout>
          }
        />

        {/* ─── CUSTOMER DASHBOARD ROUTES (Shopping & Discovery) ─── */}
        <Route
          path="/customer/home"
          element={
            <CustomerLayout>
              <CustomerHome />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/deals"
          element={
            <CustomerLayout>
              <NearbyDeals />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/compare"
          element={
            <CustomerLayout>
              <ComparePrices />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/offers/:id"
          element={
            <CustomerLayout>
              <OfferDetail />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <CustomerLayout>
              <MyBookings />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/savings"
          element={
            <CustomerLayout>
              <CustomerSavings />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/saved"
          element={
            <CustomerLayout>
              <SavedOffers />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <CustomerLayout>
              <CustomerProfile />
            </CustomerLayout>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/merchant/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
