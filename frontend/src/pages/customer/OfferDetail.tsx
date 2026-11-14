import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, ShieldCheck, CheckCircle2, ShoppingCart, UserCheck } from 'lucide-react';
import { marketplaceApi, bookingsApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductImage from '../../components/ProductImage';

export const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(2);
  const [customerId, setCustomerId] = useState<number>(1); // Default Rahul
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) loadOffer(parseInt(id));
  }, [id]);

  const loadOffer = async (offerId: number) => {
    try {
      setLoading(true);
      const res = await marketplaceApi.getOfferById(offerId);
      setOffer(res.data);
    } catch (err) {
      alert('Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!offer) return;
    try {
      setBookingLoading(true);

      const res = await bookingsApi.create({
        customer_id: customerId,
        offer_id: offer.id,
        quantity: quantity,
      });

      // Redirect to booking confirmation screen
      navigate(`/customer/bookings/confirm/${res.data.id}`, { state: { booking: res.data } });
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="font-bold text-[#172B4D]">Offer not found</p>
        <button onClick={() => navigate('/customer/deals')} className="mt-4 px-4 py-2 bg-[#0075E3] text-white rounded-xl text-xs font-bold">
          Back to Deals
        </button>
      </div>
    );
  }

  const booked = Number(offer.booked_quantity) || 0;
  const minQty = Math.max(1, Number(offer.minimum_quantity) || 1);
  const progress = Math.min(100, Math.round((booked / minQty) * 100));
  const remainingQty = Math.max(0, minQty - booked);

  const productName = offer.product?.name || offer.product_name || `Bulk Product #${offer.id}`;
  const category = offer.product?.category || offer.product_category || 'Grocery';
  const packSize = offer.product?.pack_size || offer.pack_size || 'Bulk pack';
  const variety = offer.product?.variety || offer.variety || 'Standard';
  const merchantName = offer.merchant?.name || offer.merchant_name || 'Sri Vinayaka Kirana Store';
  const merchantLocation = offer.merchant?.location || offer.merchant_location || offer.merchant_neighborhood || 'Ameerpet, Hyderabad';
  const unitLabel = offer.product?.unit || offer.unit || 'bags';
  const imageUrl = offer.image_url || offer.product?.image_url || null;

  const savingsPerUnit = Math.max(0, (offer.retail_price || 0) - (offer.bulk_price || 0));
  const totalAmount = quantity * (offer.bulk_price || 0);
  const totalRetail = quantity * (offer.retail_price || 0);
  const totalSavings = quantity * savingsPerUnit;
  const fulfilment = offer.fulfilment_method === 'both' 
    ? 'Store Pickup & Delivery' 
    : offer.fulfilment_method === 'pickup' 
    ? 'Store Pickup' 
    : 'Neighborhood Delivery';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/deals')}
        className="flex items-center space-x-1.5 text-xs font-bold text-[#172B4D] hover:text-[#0075E3] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Nearby Deals</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Product & Merchant Info (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Hero Product Image */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-100">
              <ProductImage
                name={productName}
                category={category}
                src={imageUrl}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white/95 px-3 py-1 rounded-full shadow-xs">
                  {category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-800 bg-emerald-100/95 px-3 py-1 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Merchant Direct • Verified Kirana</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h1 className="text-2xl font-black text-[#172B4D] leading-tight">
                  {productName}
                </h1>
                <p className="text-sm text-[#64748B] font-medium mt-1">
                  Pack size: <strong className="text-[#172B4D]">{packSize}</strong> • Variety: {variety}
                </p>
              </div>

            {/* Merchant Details Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A5FF] to-[#0075E3] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#172B4D]">{merchantName}</h4>
                  <p className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#0075E3]" />
                    <span>{merchantLocation}</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Verified Kirana
              </span>
            </div>

            {/* Group Buying Engine Progress (Clearly Formatted) */}
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-[#172B4D]">
                <span>
                  Booked quantity: <strong>{booked} {unitLabel}</strong> • Minimum quantity: <strong>{minQty} {unitLabel}</strong>
                </span>
                <span className="text-[#0075E3] font-black">
                  Progress: {progress}%
                </span>
              </div>

              <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00A5FF] to-[#0075E3] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="text-xs text-[#64748B] font-medium leading-relaxed">
                {progress >= 100 ? (
                  <span className="text-[#16A34A] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    Minimum group threshold reached! Merchant will confirm fulfilment.
                  </span>
                ) : (
                  <span>
                    Remaining to reach threshold: <strong className="text-[#172B4D]">{remainingQty} {unitLabel}</strong>. Stock available: <strong className="text-[#172B4D]">{offer.available_stock} {unitLabel}</strong>.
                  </span>
                )}
              </div>
            </div>

            {/* Fulfilment & Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-[#64748B]">
              <p>
                Fulfilment method: <strong className="text-[#172B4D]">{fulfilment}</strong>
              </p>
              <p className="leading-relaxed">
                Merchant notes: {offer.description || 'Quality guaranteed. You can pick up at the store or request neighborhood delivery upon merchant confirmation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* Right Column: Price & Booking Action (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-24">
            {/* Price Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Merchant Bulk Price</span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-3xl font-black text-[#0075E3]">{formatCurrency(offer.bulk_price)}</span>
                <span className="text-xs text-slate-400 line-through font-semibold">{formatCurrency(offer.retail_price)}</span>
              </div>
              <p className="text-xs font-bold text-[#16A34A] mt-1">
                You save: {formatCurrency(savingsPerUnit)} / {unitLabel}
              </p>
            </div>

            {/* Demo Shopper Selector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-[#172B4D] mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#0075E3]" />
                <span>Simulated Customer Account:</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(parseInt(e.target.value))}
                className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[#172B4D]"
              >
                <option value={1}>Rahul Kumar (Ameerpet)</option>
                <option value={2}>Priya Sharma (SR Nagar)</option>
                <option value={3}>Suresh Reddy (Madhapur)</option>
                <option value={4}>Anitha Rao (Ameerpet)</option>
                <option value={5}>Ravi Patel (Kukatpally)</option>
              </select>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1.5">Select Quantity to Reserve</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-300 font-black text-[#172B4D] hover:bg-slate-100 flex items-center justify-center text-lg transition"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-lg text-[#172B4D]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(offer.available_stock, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-300 font-black text-[#172B4D] hover:bg-slate-100 flex items-center justify-center text-lg transition"
                >
                  +
                </button>
                <span className="text-xs font-bold text-[#64748B]">{unitLabel}</span>
              </div>
            </div>

            {/* Price Calculation Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B] font-medium">
                <span>Retail price:</span>
                <span className="line-through">{formatCurrency(totalRetail)}</span>
              </div>
              <div className="flex justify-between text-[#16A34A] font-bold">
                <span>You save:</span>
                <span>-{formatCurrency(totalSavings)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-[#172B4D] text-sm">
                <span>Booking Total:</span>
                <span className="text-xl text-[#0075E3] font-black">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBook}
              disabled={bookingLoading}
              className="w-full py-3.5 bg-[#0075E3] hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{bookingLoading ? 'Reserving...' : `Book Now • ${formatCurrency(totalAmount)}`}</span>
            </button>

            <div className="text-[11px] text-[#64748B] text-center font-medium">
              🔒 Simulated booking reservation • Zero online transaction fees
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
