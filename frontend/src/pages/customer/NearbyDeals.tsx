import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, Store, CheckCircle2, TrendingUp, Filter, ArrowRight, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { marketplaceApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductImage from '../../components/ProductImage';

export const NearbyDeals: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price_asc'); // price_asc, savings_desc, nearest, popular

  useEffect(() => {
    fetchDeals();
  }, [search, selectedCategory, selectedNeighborhood]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedNeighborhood !== 'all') params.neighborhood = selectedNeighborhood;

      const res = await marketplaceApi.getOffers(params);
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sorting logic
  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return (a.bulk_price || 0) - (b.bulk_price || 0);
    }
    if (sortBy === 'savings_desc') {
      const savA = (a.retail_price || 0) - (a.bulk_price || 0);
      const savB = (b.retail_price || 0) - (b.bulk_price || 0);
      return savB - savA;
    }
    if (sortBy === 'popular') {
      return (b.booked_quantity || 0) - (a.booked_quantity || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-[#0075E3] rounded-full text-xs font-bold border border-blue-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Neighborhood Bulk Deals Marketplace</span>
          </div>
          <h1 className="text-2xl font-black text-[#172B4D] tracking-tight">
            Discover & Compare Nearby Bulk Prices
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-xl font-medium leading-relaxed">
            Neighborhood kiranas publish bulk group rates. Compare identical products across stores, choose your preferred merchant, and reserve your quantity directly.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700 font-semibold border border-slate-200 self-start md:self-center">
          <MapPin className="w-3.5 h-3.5 text-[#0075E3]" />
          <span>Active Area: <strong>Ameerpet & Hyderabad</strong></span>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rice, dal, oil, sugar, atta..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
            />
          </div>

          {/* Neighborhood Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
            >
              <option value="all">All Neighborhoods</option>
              <option value="Ameerpet">Ameerpet (Sri Vinayaka Kirana)</option>
              <option value="SR Nagar">SR Nagar (Kumar Kirana)</option>
              <option value="Madhapur">Madhapur (Sri Lakshmi)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
              >
                <option value="price_asc">Sort: Lowest Price</option>
                <option value="savings_desc">Sort: Highest Savings</option>
                <option value="popular">Sort: Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {['all', 'Grains', 'Pulses', 'Oils', 'Sweeteners'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0075E3] text-white shadow-xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* KEY COMPARISON HIGHLIGHT: Side-by-Side Sona Masoori Rice Comparison */}
      {(!search || search.toLowerCase().includes('rice') || search.toLowerCase().includes('sona')) && (
        <div className="bg-white rounded-2xl border-2 border-[#00A5FF]/40 shadow-sm p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0075E3] px-2.5 py-0.5 rounded-full">
                  Multi-Store Comparison
                </span>
                <h2 className="text-base font-extrabold text-[#172B4D]">
                  Sona Masoori Rice (25 kg Bag) — Multi-Store Rate Comparison
                </h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Transparent merchant-set rates. Compare stores side by side and choose your merchant.
              </p>
            </div>

            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 self-start sm:self-auto">
              ✓ 3 Neighborhood Offers Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Offer 1: Sri Vinayaka Kirana Store */}
            <div className="border-2 border-emerald-500/40 rounded-2xl p-4 bg-emerald-50/20 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Lowest Bulk Price 🥇
                  </span>
                  <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-[#0075E3]" /> Ameerpet
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#172B4D]">Sri Vinayaka Kirana Store</h3>
                  <p className="text-xs text-[#64748B] font-medium">Sona Masoori Rice • 25kg Bag</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">Bulk Deal Rate</span>
                    <span className="text-xl font-black text-[#16A34A]">₹1,350</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through font-semibold block">Retail: ₹1,450</span>
                    <span className="text-xs font-bold text-[#16A34A]">You save: ₹100</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                    <span>Booked: <strong>7 bags</strong> (Min: 10 bags)</span>
                    <span className="text-[#0075E3] font-bold">Progress: 70%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#16A34A] w-[70%] rounded-full"></div>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>Stock available: <strong>23 bags</strong></span>
                  <span>Fulfilment: <strong>Store pickup & delivery</strong></span>
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/offers/1')}
                className="w-full mt-4 py-2.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1"
              >
                <span>Select Sri Vinayaka & Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Offer 2: Kumar Kirana */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    Fast Delivery 🚚
                  </span>
                  <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-[#0075E3]" /> SR Nagar
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#172B4D]">Kumar Kirana</h3>
                  <p className="text-xs text-[#64748B] font-medium">Sona Masoori Rice • 25kg Bag</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">Bulk Deal Rate</span>
                    <span className="text-xl font-black text-[#0075E3]">₹1,380</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through font-semibold block">Retail: ₹1,480</span>
                    <span className="text-xs font-bold text-[#16A34A]">You save: ₹100</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                    <span>Booked: <strong>4 bags</strong> (Min: 8 bags)</span>
                    <span className="text-[#0075E3] font-bold">Progress: 50%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0075E3] w-[50%] rounded-full"></div>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>Stock available: <strong>21 bags</strong></span>
                  <span>Fulfilment: <strong>Neighborhood delivery</strong></span>
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/offers/4')}
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-[#0075E3] hover:text-white text-[#172B4D] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>Select Kumar Kirana</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Offer 3: Sri Lakshmi Stores */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    Aged Variety ✨
                  </span>
                  <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-[#0075E3]" /> Madhapur
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#172B4D]">Sri Lakshmi Stores</h3>
                  <p className="text-xs text-[#64748B] font-medium">Sona Masoori Rice • 25kg Bag</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase">Bulk Deal Rate</span>
                    <span className="text-xl font-black text-[#0075E3]">₹1,400</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through font-semibold block">Retail: ₹1,500</span>
                    <span className="text-xs font-bold text-[#16A34A]">You save: ₹100</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                    <span>Booked: <strong>0 bags</strong> (Min: 5 bags)</span>
                    <span className="text-[#0075E3] font-bold">Progress: 0%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0075E3] w-[0%] rounded-full"></div>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>Stock available: <strong>17 bags</strong></span>
                  <span>Fulfilment: <strong>Store pickup</strong></span>
                </div>
              </div>

              <button
                onClick={() => navigate('/customer/offers/7')}
                className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-[#0075E3] hover:text-white text-[#172B4D] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>Select Sri Lakshmi Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Product Card Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#172B4D]">
            All Available Bulk Deals ({sortedOffers.length} Offers)
          </h2>
          <span className="text-xs text-[#64748B] font-semibold">
            Showing verified neighborhood grocery listings
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : sortedOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-[#172B4D]">No bulk offers matched your filters</h3>
            <p className="text-xs text-[#64748B] mt-1">Try resetting the search query or selecting All Neighborhoods.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedOffers.map((offer) => {
              const booked = Number(offer.booked_quantity) || 0;
              const minQty = Math.max(1, Number(offer.minimum_quantity) || 1);
              const progress = Math.min(100, Math.round((booked / minQty) * 100));
              const savings = Math.max(0, (offer.retail_price || 0) - (offer.bulk_price || 0));
              const stockRemaining = offer.available_stock || 0;
              const unitLabel = offer.unit || 'units';
              const fulfilment = offer.fulfilment_method === 'both' 
                ? 'Store Pickup & Delivery' 
                : offer.fulfilment_method === 'pickup' 
                ? 'Store Pickup' 
                : 'Delivery';

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#0075E3] hover:shadow-md transition cursor-pointer group"
                  onClick={() => navigate(`/customer/offers/${offer.id}`)}
                >
                  <div className="relative overflow-hidden bg-slate-100">
                    <ProductImage
                      name={offer.product_name}
                      category={offer.product_category}
                      src={offer.image_url}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white/95 px-2.5 py-1 rounded-full shadow-xs">
                        {offer.product_category || 'Grocery'}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/95 px-2.5 py-1 rounded-full shadow-xs">
                          Save {formatCurrency(savings)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs text-[#64748B]">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Store className="w-3.5 h-3.5 text-[#0075E3]" />
                        <span className="truncate max-w-[150px]">{offer.merchant_name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0075E3]" />
                        <span>{offer.merchant_neighborhood || 'Ameerpet'}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-[#172B4D] leading-snug line-clamp-1">
                        {offer.product_name || `Bulk Product #${offer.id}`}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">
                        Pack size: <strong className="text-slate-700">{offer.pack_size}</strong>
                      </p>
                    </div>

                    {/* Pricing Box - Strictly separated */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#64748B] block uppercase">Bulk Price</span>
                        <span className="text-lg font-black text-[#0075E3]">
                          {formatCurrency(offer.bulk_price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 line-through font-semibold block">
                          Retail price: {formatCurrency(offer.retail_price)}
                        </span>
                        <span className="text-xs font-bold text-[#16A34A]">
                          You save: {formatCurrency(savings)}
                        </span>
                      </div>
                    </div>

                    {/* Group Buying Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                        <span>Booked: <strong>{booked} {unitLabel}</strong> (Min: {minQty} {unitLabel})</span>
                        <span className="text-[#0075E3] font-bold">Progress: {progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00A5FF] to-[#0075E3] rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Clearly separated stock and fulfilment */}
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-[#64748B] flex justify-between items-center">
                      <span>Stock available: <strong className="text-[#172B4D]">{stockRemaining} {unitLabel}</strong></span>
                      <span>Fulfilment: <strong className="text-[#172B4D]">{fulfilment}</strong></span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/offers/${offer.id}`);
                      }}
                      className="w-full py-2 bg-[#0075E3] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>View Deal & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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

export default NearbyDeals;
