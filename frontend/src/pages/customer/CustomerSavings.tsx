import React, { useEffect, useState } from 'react';
import { 
  Percent, 
  IndianRupee, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Store,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const CustomerSavings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavings();
  }, []);

  const loadSavings = async () => {
    try {
      setLoading(true);
      const res = await bookingsApi.getByCustomer(1); // Rahul
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute savings
  let realizedSavings = 0;
  let estimatedPendingSavings = 0;
  let totalBookingsCount = bookings.length;
  let fulfilledCount = 0;

  bookings.forEach(b => {
    const qty = b.quantity || 1;
    // Calculate per unit saving if available
    const savingPerUnit = b.offer?.retail_price 
      ? Math.max(0, b.offer.retail_price - b.unit_price_at_booking) 
      : 100;
    const savingTotal = qty * savingPerUnit;

    if (b.status === 'fulfilled') {
      realizedSavings += savingTotal;
      fulfilledCount += 1;
    } else if (b.status !== 'cancelled') {
      estimatedPendingSavings += savingTotal;
    }
  });

  const totalAllSavings = realizedSavings + estimatedPendingSavings;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-[#16A34A] rounded-full text-xs font-bold border border-emerald-100 mb-2">
            <Percent className="w-3.5 h-3.5" />
            <span>Customer Benefit Pillar</span>
          </div>
          <h1 className="text-xl font-black text-[#172B4D]">
            My Household Grocery Savings
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Track how much money your family has saved by pooling demand and buying bulk staples through neighborhood Kiranas.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/deals')}
          className="px-4 py-2 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse More Deals</span>
        </button>
      </div>

      {/* KPI Savings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Savings */}
        <div className="p-5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
            Total Savings Unlocked
          </span>
          <p className="text-3xl font-black">
            {formatCurrency(totalAllSavings)}
          </p>
          <p className="text-xs text-emerald-100 font-medium">
            Across {totalBookingsCount} bulk reservations
          </p>
        </div>

        {/* Realized Savings */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] block">
            Realized Fulfilled Savings
          </span>
          <p className="text-3xl font-black text-[#16A34A]">
            {formatCurrency(realizedSavings)}
          </p>
          <p className="text-xs text-[#64748B] font-medium">
            From {fulfilledCount} completed orders
          </p>
        </div>

        {/* Pending Savings */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0075E3] block">
            Estimated Pending Savings
          </span>
          <p className="text-3xl font-black text-[#0075E3]">
            {formatCurrency(estimatedPendingSavings)}
          </p>
          <p className="text-xs text-[#64748B] font-medium">
            Locked in pending & confirmed orders
          </p>
        </div>
      </div>

      {/* Itemized Savings Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#172B4D]">Itemized Order Savings Log</h2>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No bookings placed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {bookings.map((b) => {
              const qty = b.quantity || 1;
              const savingTotal = qty * (b.offer?.retail_price ? Math.max(0, b.offer.retail_price - b.unit_price_at_booking) : 100);
              const isFulfilled = b.status === 'fulfilled';

              return (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#172B4D]">{b.offer_name || 'Bulk Staple'}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[#64748B] font-medium">{qty} units</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isFulfilled ? 'bg-emerald-100 text-[#16A34A]' : 'bg-blue-100 text-[#0075E3]'
                      }`}>
                        {isFulfilled ? 'Realized Savings' : 'Pending Fulfilment'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Store: <strong>{b.merchant_name}</strong> • Ref: {b.booking_reference} • {formatDate(b.created_at)}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-sm font-black text-[#16A34A] block">
                      +{formatCurrency(savingTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Total bill: {formatCurrency(b.total_amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSavings;
