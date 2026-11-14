import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Store,
  Info
} from 'lucide-react';
import { marketplaceApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const ComparePrices: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('Sona Masoori Rice');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await marketplaceApi.getOffers();
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group offers by product title for genuine comparison
  const productsAvailable = Array.from(
    new Set(offers.map(o => o.product_name || o.product?.name))
  ).filter(Boolean);

  const matchedOffers = offers
    .filter(o => (o.product_name || o.product?.name) === selectedProduct)
    .sort((a, b) => (a.bulk_price || 0) - (b.bulk_price || 0));

  const lowestPrice = matchedOffers.length > 0 ? matchedOffers[0].bulk_price : 0;

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
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-[#0075E3] rounded-full text-xs font-bold border border-blue-100 mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Multi-Merchant Rate Comparison</span>
          </div>
          <h1 className="text-xl font-black text-[#172B4D]">
            Compare Nearby Kirana Bulk Prices
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Merchants set their own independent rates. Compare genuinely identical pack sizes side-by-side, check stock, and choose who you want to buy from.
          </p>
        </div>

        {/* Product Selector */}
        <div className="w-full sm:w-64">
          <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
            Select Staple to Compare:
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
          >
            {productsAvailable.map((p: any) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Comparing: {selectedProduct}
            </h2>
            <p className="text-xs text-[#64748B]">
              Pack size: {matchedOffers[0]?.pack_size || 'Wholesale Standard'} • {matchedOffers.length} Stores Offering Bulk Deals
            </p>
          </div>

          <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold self-start sm:self-auto">
            Lowest Rate: <strong>{formatCurrency(lowestPrice)}</strong>
          </div>
        </div>

        {/* Comparison Cards / Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matchedOffers.map((offer, idx) => {
            const isLowest = offer.bulk_price === lowestPrice;
            const savings = Math.max(0, (offer.retail_price || 0) - (offer.bulk_price || 0));
            const booked = Number(offer.booked_quantity) || 0;
            const minQty = Math.max(1, Number(offer.minimum_quantity) || 1);
            const progress = Math.min(100, Math.round((booked / minQty) * 100));
            const fulfilment = offer.fulfilment_method === 'both' 
              ? 'Store Pickup & Delivery' 
              : offer.fulfilment_method === 'pickup' 
              ? 'Store Pickup' 
              : 'Delivery';

            return (
              <div
                key={offer.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition ${
                  isLowest
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    {isLowest ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Best Rate 🥇
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Option #{idx + 1}
                      </span>
                    )}

                    <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#0075E3]" />
                      <span>{offer.merchant_neighborhood || 'Hyderabad'}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#172B4D]">{offer.merchant_name}</h3>
                    <p className="text-xs text-[#64748B] font-medium">{offer.pack_size}</p>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] block uppercase">Bulk Price</span>
                      <span className={`text-xl font-black ${isLowest ? 'text-[#16A34A]' : 'text-[#0075E3]'}`}>
                        {formatCurrency(offer.bulk_price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through block">Retail: {formatCurrency(offer.retail_price)}</span>
                      <span className="text-xs font-bold text-[#16A34A]">Save {formatCurrency(savings)}</span>
                    </div>
                  </div>

                  {/* Group Buying Progress Bar */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                      <span>Booked: <strong>{booked}/{minQty} {offer.unit || 'units'}</strong></span>
                      <span className="text-[#0075E3] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00A5FF] to-[#0075E3] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stock & Fulfilment Details */}
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-[#64748B] space-y-1">
                    <div className="flex justify-between">
                      <span>Available stock:</span>
                      <strong className="text-[#172B4D]">{offer.available_stock} {offer.unit || 'units'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Fulfilment:</span>
                      <strong className="text-[#172B4D]">{fulfilment}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/customer/offers/${offer.id}`)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                    isLowest
                      ? 'bg-[#0075E3] hover:bg-blue-700 text-white'
                      : 'bg-slate-100 hover:bg-[#0075E3] hover:text-white text-[#172B4D]'
                  }`}
                >
                  <span>Select {offer.merchant_name?.split(' ')[0]} & Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start space-x-2 text-xs text-blue-900">
          <Info className="w-4 h-4 text-[#0075E3] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Customer Choice Principle:</strong> You are not forced to select the lowest price. Proximity, store familiarity, and pickup convenience are equally important when choosing your neighborhood merchant.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparePrices;
