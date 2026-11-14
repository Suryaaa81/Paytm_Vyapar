import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  ArrowRight,
  HeartHandshake,
  Calendar,
  IndianRupee,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loyaltyApi, merchantsApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const CustomerInsights: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await loyaltyApi.getCustomers(1);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCustomers = customers.length;
  const atRiskList = customers.filter(c => c.is_at_risk);
  const activeList = customers.filter(c => !c.is_at_risk);
  const frequentBuyers = [...customers].sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0));
  const topSpenders = [...customers].sort((a, b) => (b.total_purchases || 0) - (a.total_purchases || 0));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-[#0075E3] rounded-full text-xs font-bold border border-blue-100 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Merchant Intelligence Pillar</span>
          </div>
          <h1 className="text-xl font-black text-[#172B4D]">
            Customer Activity & Retention Insights
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Understand neighborhood shopper visit cycles, identify top repeat buyers, and act before customer churn occurs.
          </p>
        </div>

        <button
          onClick={() => navigate('/merchant/loyalty')}
          className="px-4 py-2 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Open Campaign Drafter</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Tracked Customers</p>
          <h3 className="text-2xl font-black text-[#172B4D] mt-1">{totalCustomers} Shoppers</h3>
          <p className="text-[11px] text-[#16A34A] font-semibold mt-1">
            {activeList.length} regular active shoppers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Potentially Inactive Shoppers</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{atRiskList.length} At-Risk</h3>
          <p className="text-[11px] text-[#64748B] font-semibold mt-1">
            Exceeding 1.5x expected visit cycle
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Top Customer Spend</p>
          <h3 className="text-2xl font-black text-[#0075E3] mt-1">
            {formatCurrency(topSpenders[0]?.total_purchases || 0)}
          </h3>
          <p className="text-[11px] text-[#64748B] font-semibold mt-1">
            Highest cumulative store loyalty
          </p>
        </div>
      </div>

      {/* At-Risk Alert Banner */}
      {atRiskList.length > 0 && (
        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Attention: Lapsed Shoppers Detected by Retention AI</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Shoppers highlighted below have not returned within their usual shopping frequency. Proactive re-engagement with bulk grocery offers can recover footfall before permanent churn to distant supermarkets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {atRiskList.map(c => (
              <div key={c.customer_id} className="p-3 bg-white rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-[#172B4D]">{c.customer_name}</h4>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Absent for <strong>{c.days_since_last_visit} days</strong> (Normal cycle: {Math.round(c.avg_interval_days || 3)} days)
                  </p>
                </div>
                <button
                  onClick={() => navigate('/merchant/loyalty')}
                  className="px-3 py-1.5 bg-[#0075E3] text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition"
                >
                  Draft Campaign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Customer Registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D]">Customer Visit & Purchase Registry</h2>
            <p className="text-xs text-[#64748B]">Deterministic calculations based on historical transaction intervals</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[#64748B] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Visit Frequency</th>
                <th className="py-2.5 px-3">Total Store Visits</th>
                <th className="py-2.5 px-3">Total Spend</th>
                <th className="py-2.5 px-3">Last Visit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172B4D]">
              {customers.map((c) => (
                <tr key={c.customer_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-bold text-[#172B4D]">
                    {c.customer_name}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    Every {c.avg_interval_days ? `${c.avg_interval_days} days` : 'Periodic'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#172B4D]">
                    {c.total_visits} visits
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0075E3]">
                    {formatCurrency(c.total_purchases)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-medium">
                    {c.days_since_last_visit} days ago
                  </td>
                  <td className="py-3 px-3">
                    {c.is_at_risk ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Potentially Inactive
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#16A34A]">
                        Active Regular
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('/merchant/loyalty')}
                      className="text-[11px] font-bold text-[#0075E3] hover:underline"
                    >
                      Re-engage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
