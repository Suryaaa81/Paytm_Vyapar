import React, { useEffect, useState } from 'react';
import { BookOpen, ShoppingBag, Store, Clock, ArrowRight, UserCheck, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import { bookingsApi, marketplaceApi } from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const MyBookings: React.FC = () => {
  const [customerId, setCustomerId] = useState<number>(1); // Default Rahul
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [repeatingId, setRepeatingId] = useState<number | null>(null);

  useEffect(() => {
    loadBookings(customerId);
  }, [customerId]);

  const loadBookings = async (cid: number) => {
    try {
      setLoading(true);
      const res = await bookingsApi.getByCustomer(cid);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatBooking = async (bookingId: number) => {
    try {
      setRepeatingId(bookingId);
      const res = await marketplaceApi.repeatBooking(bookingId);
      alert(`Success! ${res.data.message}. New Reference: ${res.data.booking.booking_reference}`);
      await loadBookings(customerId);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to repeat booking. Offer may be out of stock or expired.');
    } finally {
      setRepeatingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this bulk reservation?')) return;
    try {
      await bookingsApi.updateStatus(bookingId, 'cancelled');
      alert('Booking cancelled successfully and stock released.');
      await loadBookings(customerId);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'ready_for_pickup': return 3;
      case 'fulfilled': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0075E3]" />
            <span>My Bulk Bookings & Order History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status updates, merchant confirmation, and pickup notices for your bulk group deals.
          </p>
        </div>

        {/* Customer Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <UserCheck className="w-4 h-4 text-[#0075E3] ml-1" />
          <select
            value={customerId}
            onChange={(e) => setCustomerId(parseInt(e.target.value))}
            className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none pr-2"
          >
            <option value={1}>Rahul Kumar (Ameerpet)</option>
            <option value={2}>Priya Sharma (SR Nagar)</option>
            <option value={3}>Suresh Reddy (Madhapur)</option>
            <option value={4}>Anitha Rao (Ameerpet)</option>
            <option value={5}>Ravi Patel (Kukatpally)</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No bookings found for this customer</h3>
          <p className="text-xs text-slate-500 mt-1">Browse nearby deals and reserve your first bulk grocery order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const step = getStepIndex(b.status);
            const canCancel = ['pending', 'confirmed'].includes(b.status);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-blue-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                        {b.booking_reference}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusColor(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
                      {b.offer_name || 'Bulk Grocery Deal'}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#0075E3]" />
                      <span>Reserved: <strong>{b.quantity} bags/units</strong> at ₹{b.unit_price_at_booking}/unit</span>
                      <span>•</span>
                      <span>Booked on {formatDate(b.created_at)}</span>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Amount</span>
                    <span className="text-xl font-black text-[#0075E3]">
                      {formatCurrency(b.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Status Stepper */}
                {b.status !== 'cancelled' && b.status !== 'rejected' && (
                  <div className="py-2 border-t border-b border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className={`p-1.5 rounded-lg ${step >= 1 ? 'bg-blue-50 text-[#0075E3] border border-blue-200' : 'text-slate-400'}`}>
                        1. Reserved
                      </div>
                      <div className={`p-1.5 rounded-lg ${step >= 2 ? 'bg-blue-50 text-[#0075E3] border border-blue-200' : 'text-slate-400'}`}>
                        2. Confirmed
                      </div>
                      <div className={`p-1.5 rounded-lg ${step >= 3 ? 'bg-blue-50 text-[#0075E3] border border-blue-200' : 'text-slate-400'}`}>
                        3. Ready
                      </div>
                      <div className={`p-1.5 rounded-lg ${step >= 4 ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'text-slate-400'}`}>
                        4. Fulfilled ✓
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-500 font-medium">
                    {b.status === 'fulfilled' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Order fulfilled and collected.
                      </span>
                    ) : b.status === 'ready_for_pickup' ? (
                      <span className="text-[#0075E3] font-bold">
                        Ready for pickup at Sri Vinayaka Kirana Store!
                      </span>
                    ) : canCancel ? (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    ) : (
                      <span>Reservation status: {b.status}</span>
                    )}
                  </div>

                  {/* 1-Click Repeat Booking */}
                  <button
                    onClick={() => handleRepeatBooking(b.id)}
                    disabled={repeatingId === b.id}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#0075E3] hover:text-white text-slate-800 font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{repeatingId === b.id ? 'Revalidating...' : 'Repeat Booking'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
