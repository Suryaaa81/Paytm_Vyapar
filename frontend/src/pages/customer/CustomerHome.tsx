import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  Percent,
  CheckCircle2,
  Store
} from 'lucide-react';
import { marketplaceApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductImage from '../../components/ProductImage';

export const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Ameerpet');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/customer/deals?search=${encodeURIComponent(search)}`);
  };

  // 1. Offers close to group-buying completion (>= 60%)
  const closeToGoalOffers = offers.filter(o => {
    const pct = ((o.booked_quantity || 0) / (o.minimum_quantity || 1)) * 100;
    return pct >= 50 && pct < 100;
  });

  // 2. Best Value Offers (highest absolute savings)
  const bestValueOffers = [...offers].sort((a, b) => {
    const savA = (a.retail_price || 0) - (a.bulk_price || 0);
    const savB = (b.retail_price || 0) - (b.bulk_price || 0);
    return savB - savA;
  }).slice(0, 4);

  // 3. Popular / Recently added offers
  const popularOffers = [...offers].sort((a, b) => (b.booked_quantity || 0) - (a.booked_quantity || 0)).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Search Banner */}
      <div className="bg-gradient-to-r from-[#002970] via-[#00429d] to-[#0075E3] rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-sky-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#00A5FF]" />
            <span>Welcome, Rahul! Save up to 15-20% on monthly groceries</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Buy in Bulk from Your Neighborhood Kiranas
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed">
            Local stores in Ameerpet, SR Nagar, and Madhapur publish wholesale-rate bulk offers. Compare prices side-by-side, join neighborhood group buys, and pick up fresh stock locally.
          </p>

          {/* Quick Search & Neighborhood Selector */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Sona Masoori Rice, Toor Dal, Sunflower Oil..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#172B4D] bg-white focus:outline-none focus:ring-2 focus:ring-[#00A5FF] shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-3 bg-[#00A5FF] hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Explore Deals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Neighborhood Pill Top Right */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-3.5 py-1.5 rounded-2xl absolute top-8 right-8 text-xs font-semibold text-white">
          <MapPin className="w-4 h-4 text-[#00A5FF]" />
          <span>Active Neighborhood: <strong>Ameerpet, Hyderabad</strong></span>
        </div>
      </div>

      {/* Value Proposition Strip (Customer Benefits) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0075E3] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#172B4D]">Transparent Rates</h4>
            <p className="text-[11px] text-[#64748B]">Real merchant prices</p>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center flex-shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#172B4D]">Wholesale Savings</h4>
            <p className="text-[11px] text-[#64748B]">Save ₹100-300 per pack</p>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#172B4D]">Local Kiranas</h4>
            <p className="text-[11px] text-[#64748B]">Pick up in ~500m</p>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#172B4D]">Zero Fees</h4>
            <p className="text-[11px] text-[#64748B]">Pay only at pickup</p>
          </div>
        </div>
      </div>

      {/* 1. Offers Close to Group-Buying Completion */}
      {closeToGoalOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-base font-extrabold text-[#172B4D]">
                  Almost Unlocked! Group Deals Near Minimum Threshold
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                These neighborhood offers only need a few more units to trigger confirmed merchant fulfilment.
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/deals')}
              className="text-xs font-bold text-[#0075E3] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {closeToGoalOffers.map((offer) => {
              const booked = Number(offer.booked_quantity) || 0;
              const minQty = Math.max(1, Number(offer.minimum_quantity) || 1);
              const progress = Math.min(100, Math.round((booked / minQty) * 100));
              const remaining = Math.max(0, minQty - booked);
              const savings = Math.max(0, (offer.retail_price || 0) - (offer.bulk_price || 0));

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 cursor-pointer"
                  onClick={() => navigate(`/customer/offers/${offer.id}`)}
                >
                  <div>
                    <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <ProductImage
                        name={offer.product_name}
                        category={offer.product_category}
                        src={offer.image_url}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {remaining} more needed to unlock!
                      </span>
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0075E3]" />
                        <span>{offer.merchant_neighborhood || 'Ameerpet'}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#172B4D] leading-snug">
                      {offer.product_name}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      By <strong>{offer.merchant_name}</strong> • Pack size: {offer.pack_size}
                    </p>

                    <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] uppercase block">Bulk Price</span>
                        <span className="text-lg font-black text-[#0075E3]">{formatCurrency(offer.bulk_price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 line-through font-semibold block">Retail: {formatCurrency(offer.retail_price)}</span>
                        <span className="text-xs font-bold text-[#16A34A]">Save {formatCurrency(savings)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
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
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customer/offers/${offer.id}`);
                    }}
                    className="w-full py-2 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Join Group Buy & Reserve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Multi-Store Compare Feature Spotlight */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 rounded-3xl border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0075E3] bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
            Compare Feature
          </span>
          <h3 className="text-lg font-black text-[#172B4D]">
            Multi-Store Price Comparison Engine
          </h3>
          <p className="text-xs text-[#64748B] font-medium leading-relaxed">
            Why pay more when a Kirana 400 meters away has fresh bulk bags at wholesale rates? Compare identical staple items across Ameerpet, SR Nagar & Madhapur.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/compare')}
          className="px-5 py-2.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 self-start md:self-center flex-shrink-0"
        >
          <span>Open Price Comparison</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Popular Bulk Deals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Popular Neighborhood Bulk Staples
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              High-velocity staple deals trending across Hyderabad Kiranas
            </p>
          </div>

          <button
            onClick={() => navigate('/customer/deals')}
            className="text-xs font-bold text-[#0075E3] hover:underline flex items-center gap-1"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularOffers.map((offer) => {
            const savings = Math.max(0, (offer.retail_price || 0) - (offer.bulk_price || 0));
            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-[#0075E3] hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
                onClick={() => navigate(`/customer/offers/${offer.id}`)}
              >
                <div>
                  <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                    <ProductImage
                      name={offer.product_name}
                      category={offer.product_category}
                      src={offer.image_url}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {offer.product_category || 'Grocery'}
                  </span>

                  <h4 className="font-extrabold text-sm text-[#172B4D] mt-1.5 leading-snug">
                    {offer.product_name}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {offer.merchant_name} • {offer.pack_size}
                  </p>

                  <div className="my-2.5 p-2.5 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-[#64748B] block uppercase">Bulk Rate</span>
                      <span className="text-base font-black text-[#0075E3]">{formatCurrency(offer.bulk_price)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 line-through block">Retail: {formatCurrency(offer.retail_price)}</span>
                      <span className="text-[11px] font-bold text-[#16A34A]">Save {formatCurrency(savings)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customer/offers/${offer.id}`);
                  }}
                  className="w-full py-1.5 bg-slate-100 hover:bg-[#0075E3] hover:text-white text-[#172B4D] font-bold text-xs rounded-lg transition"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
