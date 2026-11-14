import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  PackageCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface BusinessIntelligenceSectionProps {
  analytics: {
    financial_summary: {
      total_booked_value: number;
      confirmed_value: number;
      fulfilled_sales_value: number;
      pending_value: number;
      customer_savings: number;
      cash_sales_ledger: number;
      credit_sales_ledger: number;
      expenses_ledger: number;
      net_cash_movement: number;
    };
    booking_status_counts: Record<string, number>;
    product_performance: Array<{
      product_name: string;
      quantity_booked: number;
      booking_value: number;
      orders_count: number;
    }>;
    threshold_stats: {
      total_offers: number;
      offers_completed_threshold: number;
      completion_rate_pct: number;
    };
  };
}

export const BusinessIntelligenceSection: React.FC<BusinessIntelligenceSectionProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { financial_summary, booking_status_counts, product_performance, threshold_stats } = analytics;

  const maxProductQty = Math.max(1, ...product_performance.map(p => p.quantity_booked));

  const totalBookingsSum = Math.max(
    1,
    Object.values(booking_status_counts).reduce((a, b) => a + b, 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0075E3] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Business Intelligence & Value Realization
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Strictly separates <strong>Total Booked Value</strong> (reservations), <strong>Confirmed Value</strong>, and <strong>Fulfilled Sales</strong> (realized cash).
          </p>
        </div>

        <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Source: Verified SQLite DB Records
        </span>
      </div>

      {/* 4 Financial Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Booked Value */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
            1. Total Booked Value
          </span>
          <p className="text-xl font-black text-[#172B4D]">
            {formatCurrency(financial_summary.total_booked_value)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Pending merchant confirmation
          </p>
        </div>

        {/* Confirmed Value */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
          <span className="text-[10px] font-bold text-[#0075E3] uppercase tracking-wider block">
            2. Confirmed Value
          </span>
          <p className="text-xl font-black text-[#0075E3]">
            {formatCurrency(financial_summary.confirmed_value)}
          </p>
          <p className="text-[11px] text-blue-700/80 font-medium">
            Ready or accepted orders
          </p>
        </div>

        {/* Realized Fulfilled Sales */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
          <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
            3. Fulfilled Sales Value
          </span>
          <p className="text-xl font-black text-[#16A34A]">
            {formatCurrency(financial_summary.fulfilled_sales_value)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            100% Realized store revenue
          </p>
        </div>

        {/* Customer Savings Unlocked */}
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            4. Customer Savings Created
          </span>
          <p className="text-xl font-black text-purple-900">
            {formatCurrency(financial_summary.customer_savings)}
          </p>
          <p className="text-[11px] text-purple-700/80 font-medium">
            Neighborhood discount value
          </p>
        </div>
      </div>

      {/* Visual Charts Grid (Product Velocity & Status Distribution) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Product-wise Booking Quantities Chart */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>Product Booking Velocity</span>
            </h3>
            <span className="text-[10px] text-slate-400">Total Units Booked</span>
          </div>

          <div className="space-y-3 pt-1">
            {product_performance && product_performance.length > 0 ? (
              product_performance.map((prod) => {
                const barWidth = Math.round((prod.quantity_booked / maxProductQty) * 100);
                return (
                  <div key={prod.product_name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#172B4D] font-bold">{prod.product_name}</span>
                      <span className="text-[#0075E3] font-bold">{prod.quantity_booked} units ({formatCurrency(prod.booking_value)})</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00A5FF] to-[#0075E3] rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No product booking records yet.</p>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>Order Fulfilment Pipeline</span>
            </h3>
            <span className="text-[10px] text-slate-400">Distribution %</span>
          </div>

          <div className="space-y-2 pt-1">
            {[
              { key: 'pending', label: 'Pending Confirmation', count: booking_status_counts.pending || 0, color: 'bg-amber-400' },
              { key: 'confirmed', label: 'Confirmed by Merchant', count: booking_status_counts.confirmed || 0, color: 'bg-blue-500' },
              { key: 'ready_for_pickup', label: 'Ready for Pickup', count: booking_status_counts.ready_for_pickup || 0, color: 'bg-emerald-500' },
              { key: 'fulfilled', label: 'Fulfilled & Completed', count: booking_status_counts.fulfilled || 0, color: 'bg-slate-700' },
              { key: 'cancelled', label: 'Cancelled / Released', count: booking_status_counts.cancelled || 0, color: 'bg-red-400' },
            ].map((status) => {
              const pct = Math.round((status.count / totalBookingsSum) * 100);
              return (
                <div key={status.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#172B4D] flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                      <span>{status.label}</span>
                    </span>
                    <span className="text-slate-600 font-bold">{status.count} orders ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${status.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligenceSection;
