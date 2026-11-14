import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  ShoppingCart, 
  Package, 
  IndianRupee, 
  PlusCircle, 
  ClipboardList, 
  Users, 
  Mic, 
  FileText, 
  Bot,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { merchantsApi } from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [dailySummary, setDailySummary] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, sumRes] = await Promise.all([
        merchantsApi.getDashboard(1),
        merchantsApi.getDailySummary(1)
      ]);
      setData(dashRes.data);
      setDailySummary(sumRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-semibold text-sm">{error || 'Could not load merchant data.'}</p>
        <button 
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, recent_bookings, active_offers, growth_insights } = data;
  const storeName = data.merchant?.name || 'Sri Vinayaka Kirana Store';

  // Part 2: Show top 3 most important actionable suggestions on home
  const topThreeSuggestions = (growth_insights || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold text-[#0075E3] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {t.merchant_center}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0075E3]" /> Ameerpet, Hyderabad
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#172B4D] tracking-tight">
            {language === 'te' ? `నమస్తే, ${storeName}!` : language === 'hi' ? `नमस्ते, ${storeName}!` : `Welcome, ${storeName}!`}
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium max-w-xl">
            {language === 'te' 
              ? 'మీ దుకాణపు బల్క్ ఆఫర్లను నిర్వహించండి, కస్టమర్ ఆర్డర్లను ధృవీకరించండి మరియు వాయిస్ ద్వారా అమ్మకాలను నమోదు చేయండి.'
              : language === 'hi'
              ? 'अपनी दुकान के थोक सौदों का प्रबंधन करें, ग्राहकों के ऑर्डर की पुष्टि करें और आवाज से बिक्री दर्ज करें।'
              : 'Manage neighborhood bulk offers, review customer orders, and record daily transactions easily.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/merchant/offers/create')}
          className="flex items-center space-x-2 bg-[#0075E3] hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-md transition self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.add_bulk_offer}</span>
        </button>
      </div>

      {/* Daily Merchant Business Summary (Phase 3.3) */}
      {dailySummary && (
        <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-2xl p-5 border border-blue-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200/50">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-[#002970] uppercase tracking-wider">
                Daily Operations Briefing • {dailySummary.date}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Live DB Metrics</span>
          </div>

          <p className="text-xs font-semibold text-[#172B4D] leading-relaxed">
            {dailySummary.headline}
          </p>

          {/* Strictly separated financial breakdown */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Fulfilled Value</span>
              <span className="text-sm font-black text-[#16A34A]">{formatCurrency(dailySummary.fulfilled_sales_value)}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Confirmed Sales</span>
              <span className="text-sm font-black text-[#0075E3]">{formatCurrency(dailySummary.confirmed_sales_value)}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Pending Demand</span>
              <span className="text-sm font-black text-[#F59E0B]">{formatCurrency(dailySummary.pending_booking_value)}</span>
            </div>
          </div>
        </div>
      )}

      {/* A. Today's Business (Large Clear KPI Cards answering the 4 core questions) */}
      <div>
        <h2 className="text-sm font-extrabold text-[#172B4D] uppercase tracking-wider mb-3">
          A. {t.todays_business}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. New Bookings / Pending Confirmations */}
          <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">{t.pending_confirmations}</p>
              <h3 className="text-3xl font-black text-[#172B4D] mt-1.5">{stats.pending_bookings_count}</h3>
            </div>
            <p className="text-xs text-[#64748B] font-semibold mt-2 flex items-center justify-between">
              <span>{t.new_bookings}: {stats.total_bookings_count}</span>
              <button onClick={() => navigate('/merchant/bookings')} className="text-[#0075E3] hover:underline font-bold">
                View →
              </button>
            </p>
          </div>

          {/* 2. Fulfilled Orders / Realized Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider">{t.todays_fulfilled_sales}</p>
              <h3 className="text-3xl font-black text-[#16A34A] mt-1.5">
                {formatCurrency(data.analytics?.financial_summary?.fulfilled_sales_value || 1700)}
              </h3>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-2">
              {stats.total_quantity_booked} units booked in total
            </p>
          </div>

          {/* 3. Active Offers Live */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#0075E3] uppercase tracking-wider">{t.available_offers}</p>
              <h3 className="text-3xl font-black text-[#172B4D] mt-1.5">{stats.active_offers_count}</h3>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Visible in Ameerpet feed</span>
            </p>
          </div>

          {/* 4. Total Booking Demand Generated */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Booking Demand</p>
              <h3 className="text-3xl font-black text-[#0075E3] mt-1.5">{formatCurrency(stats.estimated_sales_value)}</h3>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-2">
              Across {stats.customers_reached} neighborhood shoppers
            </p>
          </div>
        </div>
      </div>

      {/* B. Quick Actions (Large recognizable buttons) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-[#172B4D] uppercase tracking-wider">
          B. {t.quick_actions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/merchant/offers/create')}
            className="p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/40 hover:bg-[#0075E3] hover:text-white hover:border-[#0075E3] transition flex flex-col items-center text-center group shadow-xs"
          >
            <PlusCircle className="w-6 h-6 text-[#0075E3] group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.add_bulk_offer}</span>
          </button>

          <button
            onClick={() => navigate('/merchant/bookings')}
            className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] transition flex flex-col items-center text-center group shadow-xs"
          >
            <ClipboardList className="w-6 h-6 text-[#16A34A] group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.view_new_orders}</span>
          </button>

          <button
            onClick={() => navigate('/merchant/products')}
            className="p-4 rounded-2xl border-2 border-purple-100 bg-purple-50/40 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition flex flex-col items-center text-center group shadow-xs"
          >
            <Package className="w-6 h-6 text-purple-600 group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.update_stock}</span>
          </button>

          <button
            onClick={() => navigate('/merchant/customer-insights')}
            className="p-4 rounded-2xl border-2 border-amber-100 bg-amber-50/40 hover:bg-[#F59E0B] hover:text-white hover:border-[#F59E0B] transition flex flex-col items-center text-center group shadow-xs"
          >
            <Users className="w-6 h-6 text-[#F59E0B] group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.customer_offers}</span>
          </button>

          <button
            onClick={() => navigate('/merchant/ledger')}
            className="p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition flex flex-col items-center text-center group shadow-xs"
          >
            <Mic className="w-6 h-6 text-indigo-600 group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.record_sale_by_voice}</span>
          </button>

          <button
            onClick={() => navigate('/merchant/assistant')}
            className="p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/40 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition flex flex-col items-center text-center group shadow-xs"
          >
            <Bot className="w-6 h-6 text-sky-600 group-hover:text-white mb-2" />
            <span className="text-xs font-extrabold">{t.view_ai_suggestions}</span>
          </button>
        </div>
      </div>

      {/* C. Today's AI Suggestions (Max 3 on Home screen, clean & actionable) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0075E3] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-extrabold text-[#172B4D] uppercase tracking-wider">
              C. {t.ai_suggestions_title}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Merchant Approval Required</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThreeSuggestions.map((sug: any) => (
            <div 
              key={sug.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0075E3]">
                  {sug.category?.replace('_', ' ')}
                </span>
                <h4 className="font-extrabold text-sm text-[#172B4D] leading-snug">
                  {sug.title}
                </h4>
                <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                  {sug.observation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-[#16A34A] font-bold">
                  {sug.expected_benefit?.slice(0, 32)}...
                </span>
                <button
                  onClick={() => {
                    if (sug.action_type === 'draft_campaign') navigate('/merchant/loyalty');
                    else if (sug.action_type === 'open_ledger') navigate('/merchant/ledger');
                    else navigate('/merchant/offers');
                  }}
                  className="px-3 py-1.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Act Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders & Offers Quick Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Orders (Actionable with 1-click confirmation) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-[#172B4D]">New Orders Awaiting Confirmation</h3>
            <button onClick={() => navigate('/merchant/bookings')} className="text-xs font-bold text-[#0075E3] hover:underline">
              View All Orders →
            </button>
          </div>

          <div className="space-y-2.5">
            {recent_bookings && recent_bookings.length > 0 ? (
              recent_bookings.slice(0, 3).map((b: any) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#172B4D]">{b.customer_name || 'Rahul Kumar'}</p>
                    <p className="text-[#64748B]">{b.offer_name || 'Bulk Rice'} • <strong>{b.quantity} units</strong></p>
                    <p className="text-[11px] font-black text-[#0075E3]">{formatCurrency(b.total_amount)}</p>
                  </div>
                  <button
                    onClick={() => navigate('/merchant/bookings')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                  >
                    Review Order
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No pending orders.</p>
            )}
          </div>
        </div>

        {/* Live Offers Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-[#172B4D]">Active Bulk Offers</h3>
            <button onClick={() => navigate('/merchant/offers')} className="text-xs font-bold text-[#0075E3] hover:underline">
              Manage Offers →
            </button>
          </div>

          <div className="space-y-2.5">
            {active_offers && active_offers.length > 0 ? (
              active_offers.slice(0, 3).map((o: any) => (
                <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#172B4D]">{o.product?.name || 'Bulk Staple'}</h4>
                    <p className="text-[#64748B]">{o.product?.pack_size || 'Wholesale pack'} • Stock: {o.available_stock}</p>
                    <p className="text-[#0075E3] font-bold">Goal: {o.booked_quantity}/{o.minimum_quantity} booked</p>
                  </div>
                  <span className="text-sm font-black text-[#0075E3]">{formatCurrency(o.bulk_price)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No active bulk offers.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
