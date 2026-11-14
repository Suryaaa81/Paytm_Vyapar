import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Check, 
  X, 
  Truck, 
  Search, 
  Filter, 
  ShoppingBag,
  Clock
} from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';

export const Bookings: React.FC = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsApi.getByMerchant(1);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, nextStatus: string) => {
    try {
      setActionLoading(bookingId);
      await bookingsApi.updateStatus(bookingId, nextStatus);
      await loadBookings();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = activeFilter === 'all' || b.status === activeFilter;
    const matchesSearch = !search || 
      (b.customer_name?.toLowerCase().includes(search.toLowerCase())) ||
      (b.offer_name?.toLowerCase().includes(search.toLowerCase())) ||
      (b.booking_reference?.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0075E3]" />
            <span>{t.orders} & Order Pipeline</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Review incoming neighborhood bookings, confirm orders in 1-click, and notify customers when ready.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#64748B]">Total Orders:</span>
          <span className="px-3 py-1 bg-blue-50 text-[#0075E3] font-black rounded-xl text-xs border border-blue-200">
            {bookings.length} Orders
          </span>
        </div>
      </div>

      {/* Simplified Status Tabs (Part 2: New, Confirmed, Ready, Completed, Cancelled) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'New / Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'ready_for_pickup', label: 'Ready for Pickup' },
              { id: 'fulfilled', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => {
              const count = tab.id === 'all' ? bookings.length : bookings.filter(b => b.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeFilter === tab.id
                      ? 'bg-[#0075E3] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, order, ref..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
            />
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#172B4D]">No orders in this category</h3>
          <p className="text-xs text-[#64748B] mt-1">Check other filter tabs or await incoming customer bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div 
              key={b.id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black text-[#172B4D] bg-slate-100 px-2.5 py-0.5 rounded">
                    {b.booking_reference}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusColor(b.status)}`}>
                    {getStatusLabel(b.status)}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#172B4D]">
                  {b.customer_name || `Customer #${b.customer_id}`}
                </h3>

                <p className="text-xs text-[#64748B] font-medium">
                  Reserved: <strong className="text-[#172B4D]">{b.quantity} bags/units</strong> of <strong>{b.offer_name || 'Bulk Staple'}</strong>
                </p>

                <p className="text-[11px] text-slate-400">
                  Booked on {formatDate(b.created_at)} • Preference: Store Pickup
                </p>
              </div>

              {/* Amount & Direct Large Action Buttons (Part 2: 1-click confirmation) */}
              <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="md:text-right">
                  <span className="text-[10px] text-[#64748B] uppercase font-bold block">Booking Amount</span>
                  <span className="text-lg font-black text-[#0075E3]">{formatCurrency(b.total_amount)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                        disabled={actionLoading === b.id}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t.confirm_order}</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(b.id, 'rejected')}
                        disabled={actionLoading === b.id}
                        className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition"
                      >
                        {t.reject_order}
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'ready_for_pickup')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2.5 bg-[#0075E3] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{t.mark_ready}</span>
                    </button>
                  )}

                  {b.status === 'ready_for_pickup' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'fulfilled')}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.mark_completed}</span>
                    </button>
                  )}

                  {(b.status === 'fulfilled' || b.status === 'cancelled') && (
                    <span className="text-xs text-slate-400 font-bold italic px-3 py-2 bg-slate-50 rounded-xl">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
