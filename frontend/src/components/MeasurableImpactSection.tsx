import React from 'react';
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MeasurableImpactSectionProps {
  impactData: {
    merchant_impact: {
      total_merchants: number;
      total_booking_value: number;
      fulfilled_sales_value: number;
      total_quantity_booked: number;
      customers_reached: number;
    };
    customer_impact: {
      total_savings: number;
      total_reservations: number;
      unique_customers: number;
      avg_savings_per_booking: number;
    };
    marketplace_impact: {
      published_offers: number;
      active_offers: number;
      threshold_completion_rate_pct: number;
    };
  } | null;
}

export const MeasurableImpactSection: React.FC<MeasurableImpactSectionProps> = ({ impactData }) => {
  if (!impactData) return null;

  const { merchant_impact, customer_impact, marketplace_impact } = impactData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Measurable Platform Impact Dashboard
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Aggregated metrics measuring Merchant Growth, Customer Household Savings, and Neighborhood Marketplace Velocity.
          </p>
        </div>

        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          ✓ Verified Realized Impact
        </span>
      </div>

      {/* 3 Pillar Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Merchant Growth Impact */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
            <Building2 className="w-4 h-4 text-[#0075E3]" />
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              1. Merchant Growth
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Active Stores:</span>
              <strong className="text-[#172B4D]">{merchant_impact.total_merchants} Kirana Stores</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Demand Generated:</span>
              <strong className="text-[#0075E3]">{formatCurrency(merchant_impact.total_booking_value)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Fulfilled Sales:</span>
              <strong className="text-[#16A34A]">{formatCurrency(merchant_impact.fulfilled_sales_value)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Volume Moved:</span>
              <strong className="text-[#172B4D]">{merchant_impact.total_quantity_booked} units</strong>
            </div>
          </div>
        </div>

        {/* Pillar 2: Customer Household Savings */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              2. Shopper Savings
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Household Savings:</span>
              <strong className="text-[#16A34A] font-black">{formatCurrency(customer_impact.total_savings)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Avg Savings / Order:</span>
              <strong className="text-[#16A34A]">{formatCurrency(customer_impact.avg_savings_per_booking)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Reservations:</span>
              <strong className="text-[#172B4D]">{customer_impact.total_reservations} bookings</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Shoppers Benefited:</span>
              <strong className="text-[#172B4D]">{customer_impact.unique_customers} households</strong>
            </div>
          </div>
        </div>

        {/* Pillar 3: Marketplace Health */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              3. Marketplace Health
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Published Bulk Offers:</span>
              <strong className="text-[#172B4D]">{marketplace_impact.published_offers} live deals</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Threshold Completion Rate:</span>
              <strong className="text-[#0075E3] font-bold">{marketplace_impact.threshold_completion_rate_pct}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Ecosystem Model:</span>
              <strong className="text-[#172B4D]">Merchant-Led Pricing</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Transaction Model:</span>
              <strong className="text-[#16A34A]">Reservation-First</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurableImpactSection;
