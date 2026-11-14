import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Store, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { merchantsApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PilotReport: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [repRes, logRes] = await Promise.all([
        merchantsApi.getPilotReport(),
        merchantsApi.getAuditLogs(1)
      ]);
      setReport(repRes.data);
      setAuditLogs(logRes.data);
    } catch (err) {
      console.error(err);
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

  if (!report) {
    return <div className="p-8 text-center text-slate-500">Could not load pilot metrics.</div>;
  }

  const { merchant_metrics, customer_metrics, platform_metrics } = report;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0075E3] px-2.5 py-0.5 rounded-full">
              Phase 4.5 Pilot Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {report.sample_indicator}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#172B4D] tracking-tight">
            Real-World Pilot Metrics & Audit Log
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            System performance measurements across Kirana merchants, neighborhood bulk buyers, and platform integrity.
          </p>
        </div>

        <div className="text-right self-start md:self-auto">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block">Generated At</span>
          <span className="text-xs font-mono font-bold text-[#172B4D]">
            {formatDate(report.generated_at)}
          </span>
        </div>
      </div>

      {/* 3 Metrics Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Merchant Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-[#0075E3]" />
            <h3 className="font-extrabold text-sm text-[#172B4D]">Merchant Growth Metrics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Active Merchants:</span>
              <strong className="text-[#172B4D]">{merchant_metrics.active_merchants} Kiranas</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Published Bulk Offers:</span>
              <strong className="text-[#172B4D]">{merchant_metrics.published_offers} Offers</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Bookings / Merchant:</span>
              <strong className="text-[#0075E3] font-black">{merchant_metrics.bookings_per_merchant}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Fulfillment Rate:</span>
              <strong className="text-[#16A34A]">{merchant_metrics.fulfillment_rate_pct}%</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Stock Accuracy:</span>
              <strong className="text-emerald-700">{merchant_metrics.stock_accuracy_pct}%</strong>
            </div>
          </div>
        </div>

        {/* 2. Customer Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Users className="w-5 h-5 text-[#16A34A]" />
            <h3 className="font-extrabold text-sm text-[#172B4D]">Customer Savings Metrics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Active Shoppers:</span>
              <strong className="text-[#172B4D]">{customer_metrics.active_customers} Buyers</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Bulk Bookings Created:</span>
              <strong className="text-[#172B4D]">{customer_metrics.bookings_created_count} Orders</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Repeat Bookings:</span>
              <strong className="text-[#0075E3] font-black">{customer_metrics.repeat_bookings_count} Repeat</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Total Customer Savings:</span>
              <strong className="text-[#16A34A] font-black">{formatCurrency(customer_metrics.total_customer_savings_inr)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Order Completion Rate:</span>
              <strong className="text-[#172B4D]">{customer_metrics.booking_completion_pct}%</strong>
            </div>
          </div>
        </div>

        {/* 3. Platform Health & Integrity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-[#172B4D]">Platform & Security Metrics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Booking Success Rate:</span>
              <strong className="text-[#16A34A] font-black">{platform_metrics.booking_success_rate_pct}%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Cancellation Rate:</span>
              <strong className="text-[#172B4D]">{platform_metrics.cancellation_rate_pct}%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Group Buying Completion:</span>
              <strong className="text-[#0075E3]">{platform_metrics.group_buying_completion_rate_pct}%</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-[#64748B]">Merchant Retention:</span>
              <strong className="text-emerald-700">{platform_metrics.merchant_retention_pct}%</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Customer Retention:</span>
              <strong className="text-emerald-700">{platform_metrics.customer_retention_pct}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Trail (Phase 4.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-[#0075E3]" />
            <h3 className="font-extrabold text-base text-[#172B4D]">
              Security Audit Trail & Compliance Log
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Immutable Historical Log ({auditLogs.length} Records)
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Audit logs will record automatically on offer creation, stock adjustment, booking confirmation, and campaign approval.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold bg-slate-50">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {formatDate(l.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#172B4D] capitalize">
                      {l.actor_type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-[#0075E3] border border-blue-100">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md truncate">
                      {l.details || 'System operation executed.'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-emerald-700 font-black">
                        ✓ {l.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PilotReport;
