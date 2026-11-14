import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  ShoppingBag, 
  ArrowLeftRight, 
  BookOpen, 
  Heart, 
  User, 
  MapPin, 
  Sparkles,
  Store,
  Percent
} from 'lucide-react';
import RoleSwitcher from '../RoleSwitcher';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const customerNavItems = [
    { to: '/customer/home', label: 'Home', icon: Home },
    { to: '/customer/deals', label: 'Nearby Deals', icon: ShoppingBag },
    { to: '/customer/compare', label: 'Compare Prices', icon: ArrowLeftRight },
    { to: '/customer/bookings', label: 'My Bookings', icon: BookOpen },
    { to: '/customer/savings', label: 'My Savings', icon: Percent },
    { to: '/customer/saved', label: 'Saved Offers', icon: Heart },
    { to: '/customer/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FC] font-sans flex flex-col text-[#172B4D]">
      {/* Top Customer Shopping Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A5FF] to-[#0075E3] flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
                ₹
              </div>
              <div>
                <span className="font-extrabold text-base text-[#002970] tracking-tight">
                  Paytm <span className="text-[#00A5FF]">Vyapar</span>
                </span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-[#0075E3] rounded-full border border-sky-200">
                  Customer Hub
                </span>
              </div>
            </div>

            {/* Desktop Horizontal Navigation Links (Customer-Focused) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {customerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-blue-50 text-[#0075E3] border border-blue-200 shadow-xs'
                          : 'text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Badge & Platform Role Switcher */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-xs text-emerald-900 font-medium">
                  Shopper: <strong>Rahul (Ameerpet)</strong>
                </span>
              </div>

              <div className="w-44">
                <RoleSwitcher currentRole="customer" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50/70 scrollbar-none">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-[#0075E3] text-white shadow-xs'
                      : 'text-slate-600 bg-white border border-slate-200'
                  }`
                }
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Customer Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-[#172B4D]">
            Paytm Vyapar-Brain — Neighborhood Bulk Buying Platform
          </p>
          <p className="text-slate-400">
            Customer Mode: Discover • Compare • Book • Save
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
