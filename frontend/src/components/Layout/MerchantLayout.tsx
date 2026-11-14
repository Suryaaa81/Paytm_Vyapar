import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Tag, 
  ClipboardList, 
  Users, 
  MoreHorizontal,
  Package, 
  HeartHandshake, 
  FileText, 
  Mic, 
  Bot, 
  Store, 
  Bell, 
  Globe,
  Settings,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import RoleSwitcher from '../RoleSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../utils/i18n';

interface MerchantLayoutProps {
  children?: React.ReactNode;
}

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  // Simplified primary navigation items (Part 2: 1. Home, 2. Bulk Offers, 3. Orders, 4. Customers, 5. More)
  const primaryNavItems = [
    { to: '/merchant/dashboard', label: t.home, icon: Home },
    { to: '/merchant/offers', label: t.bulk_offers, icon: Tag },
    { to: '/merchant/bookings', label: t.orders, icon: ClipboardList },
    { to: '/merchant/customer-insights', label: t.customers, icon: Users },
  ];

  const moreNavItems = [
    { to: '/merchant/products', label: t.products_stock, icon: Package },
    { to: '/merchant/loyalty', label: t.customer_loyalty, icon: HeartHandshake },
    { to: '/merchant/invoices', label: t.invoice_intel, icon: FileText },
    { to: '/merchant/ledger', label: t.speak_ledger, icon: Mic },
    { to: '/merchant/assistant', label: t.ai_assistant, icon: Bot },
    { to: '/merchant/reports', label: 'Pilot Report & Audit', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[#F5F8FC] font-sans overflow-hidden text-[#172B4D]">
      {/* Desktop Collapsible / Clean Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#002970] text-white flex-col shadow-xl z-20 flex-shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A5FF] to-[#0075E3] flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
              ₹
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight flex items-center gap-1 text-white">
                Paytm <span className="text-[#00A5FF]">Vyapar</span>
              </h1>
              <p className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider">
                {t.merchant_center}
              </p>
            </div>
          </div>
        </div>

        {/* Store Identifier */}
        <div className="px-4 py-3 bg-black/15 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-sm">
              SV
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate leading-tight">Sri Vinayaka Kirana</div>
              <div className="text-[11px] text-blue-200 flex items-center gap-1 font-medium">
                <Store className="w-3 h-3 text-[#00A5FF]" /> Ameerpet, Hyd
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-bold">
            Live
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-blue-200/60 px-3 py-1">
            Core Operations
          </div>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0075E3] text-white shadow-md font-bold'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More Tools Section */}
          <div className="pt-3">
            <div className="text-[10px] uppercase font-bold text-blue-200/60 px-3 py-1">
              {t.more} Tools & AI
            </div>
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0075E3] text-white shadow-md font-bold'
                        : 'text-blue-200/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom Language Selector & Role Switcher */}
        <div className="p-3 border-t border-white/10 bg-black/20 space-y-2.5">
          {/* Language Switcher Bar */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-1.5 border border-white/10 text-xs">
            <Globe className="w-3.5 h-3.5 text-blue-200 ml-1.5" />
            <div className="flex space-x-1">
              {(['en', 'te', 'hi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    language === lang
                      ? 'bg-white text-[#002970] shadow-xs'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          <RoleSwitcher currentRole="merchant" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs flex-shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0075E3] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {t.merchant_center}
            </span>
            <span className="text-slate-300 text-sm hidden sm:inline">|</span>
            <span className="text-xs font-medium text-slate-600 hidden lg:inline">
              Sri Vinayaka Kirana Store • Ameerpet, Hyderabad
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Header Language Switcher (Quick access for judges/merchants) */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-[#0075E3] text-white shadow-xs' : 'text-slate-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 rounded ${language === 'te' ? 'bg-[#0075E3] text-white shadow-xs' : 'text-slate-600'}`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-[#0075E3] text-white shadow-xs' : 'text-slate-600'}`}
              >
                हिंदी
              </button>
            </div>

            <button 
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F8FC] pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Part 2: Simplified 5-item mobile nav) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center z-30 shadow-lg">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1 px-2 text-[10px] font-bold transition ${
                    isActive ? 'text-[#0075E3]' : 'text-slate-500'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center py-1 px-2 text-[10px] font-bold text-slate-500 hover:text-[#0075E3]"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span>{t.more}</span>
          </button>
        </div>

        {/* Mobile "More" Drawer Modal */}
        {moreOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-[#172B4D]">{t.more} Tools</h3>
                <button onClick={() => setMoreOpen(false)} className="text-xs font-bold text-slate-400">Close</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className="p-3 rounded-xl border border-slate-200 flex items-center space-x-2.5 font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0075E3]"
                    >
                      <Icon className="w-4 h-4 text-[#0075E3]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-2">
                <RoleSwitcher currentRole="merchant" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantLayout;
