import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ArrowRight, Store, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import ProductImage from '../../components/ProductImage';

export const SavedOffers: React.FC = () => {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<any[]>([]);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      setLoading(true);
      const [favRes, offRes] = await Promise.all([
        marketplaceApi.getFavourites(1),
        marketplaceApi.getOffers()
      ]);
      setFavs(favRes.data);
      setAllOffers(offRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favId: number) => {
    try {
      await marketplaceApi.removeFavourite(favId);
      setFavs(prev => prev.filter(f => f.id !== favId));
    } catch (err) {
      alert('Failed to remove favourite');
    }
  };

  // If DB favourites is empty for demo, display default favorites (Sri Vinayaka Kirana deals)
  const savedOffersList = favs.length > 0 
    ? allOffers.filter(o => favs.some(f => f.target_id === o.id))
    : allOffers.slice(0, 3); // Fallback to 3 staple favorites for interactive demonstration

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>Saved Neighborhood Offers & Stores</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Monitor bulk group rate milestones and repeat orders from your preferred Kirana merchants.
          </p>
        </div>
      </div>

      {savedOffersList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#172B4D]">No saved offers yet</h3>
          <p className="text-xs text-[#64748B] mt-1 mb-4">
            Browse nearby kirana offers and save products you regularly purchase in bulk.
          </p>
          <button
            onClick={() => navigate('/customer/deals')}
            className="px-4 py-2 bg-[#0075E3] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            Explore Nearby Deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedOffersList.map((offer) => {
            const savings = Math.max(0, (offer.retail_price || 0) - offer.bulk_price);
            const progress = offer.group_progress_pct || 0;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition"
              >
                <div>
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <ProductImage
                      name={offer.product_name}
                      category={offer.product_category}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs">
                        {offer.product_category || 'Grocery'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        onClick={() => {
                          const matchFav = favs.find(f => f.target_id === offer.id);
                          if (matchFav) handleRemove(matchFav.id);
                          else setFavs(prev => prev.filter(f => f.target_id !== offer.id));
                        }}
                        className="w-7 h-7 bg-white/95 rounded-full flex items-center justify-center text-red-500 hover:text-red-700 shadow-xs"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-[#64748B]">
                      <span className="font-semibold flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-[#0075E3]" />
                        <span>{offer.merchant_name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0075E3]" />
                        <span>{offer.merchant_neighborhood || 'Ameerpet'}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#172B4D] leading-snug">
                      {offer.product_name}
                    </h3>
                    <p className="text-xs text-[#64748B]">Pack: {offer.pack_size}</p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-bold">Bulk Deal</span>
                        <span className="text-base font-black text-[#0075E3]">{formatCurrency(offer.bulk_price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 line-through block">₹{offer.retail_price}</span>
                        <span className="text-xs font-bold text-[#16A34A]">Save ₹{savings}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] font-semibold text-[#172B4D]">
                        <span>Group Progress:</span>
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
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => navigate(`/customer/offers/${offer.id}`)}
                    className="w-full py-2.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View Deal & Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

export default SavedOffers;
