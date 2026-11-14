import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShoppingBag, Store, MapPin, Calendar, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking || {
    id: bookingId,
    booking_reference: `BK-2026-${bookingId || '7821'}`,
    quantity: 2,
    total_amount: 2700,
    unit_price_at_booking: 1350,
    status: 'pending',
    offer_name: 'Sona Masoori Rice (25 kg Bag)',
    merchant_name: 'Sri Vinayaka Kirana Store',
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center py-6">
      {/* Success Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Bulk Booking Confirmed! 🎉
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Your neighborhood bulk reservation has been submitted directly to the merchant.
        </p>
      </div>

      {/* Booking Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 text-left space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Booking Reference</span>
            <p className="font-mono text-base font-black text-slate-900">{booking.booking_reference}</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
            Pending Merchant Confirmation
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Merchant Store:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>{booking.merchant_name || 'Sri Vinayaka Kirana Store (Ameerpet)'}</span>
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Item Reserved:</span>
            <span className="font-bold text-slate-900">{booking.offer_name || 'Sona Masoori Rice (25 kg)'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Quantity Booked:</span>
            <span className="font-bold text-slate-900">{booking.quantity} units</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Merchant Bulk Rate:</span>
            <span className="font-bold text-[#0075E3]">
              {formatCurrency(booking.unit_price_at_booking || 1350)} / unit
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Total Amount Due at Pickup:</span>
            <span className="text-xl text-emerald-600 font-black">
              {formatCurrency(booking.total_amount)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-900 font-medium">
          💡 The merchant (Sri Vinayaka Kirana Store) has received an in-app alert. You can track fulfilment under <strong>My Bookings</strong>.
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/customer/bookings')}
          className="px-6 py-3 bg-[#0075E3] hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>View My Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => navigate('/customer/deals')}
          className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition"
        >
          Explore More Deals
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
