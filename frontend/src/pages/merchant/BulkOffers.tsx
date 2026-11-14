import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Tag, AlertCircle, Trash2, Edit3, Pause, Play, CheckCircle2, Copy, Layers } from 'lucide-react';
import { offersApi } from '../../services/api';
import { formatCurrency, getStatusColor, getStatusLabel } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductImage from '../../components/ProductImage';

export const BulkOffers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await offersApi.getByMerchant(1);
      setOffers(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (offer: any) => {
    try {
      await offersApi.toggleStatus(offer.id);
      await loadOffers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleQuickStock = async (offerId: number, delta: number) => {
    try {
      await offersApi.adjustStock(offerId, { delta });
      await loadOffers();
    } catch (err) {
      alert('Failed to adjust stock');
    }
  };

  const handleDuplicateOffer = async (offer: any) => {
    try {
      setDuplicatingId(offer.id);
      const res = await offersApi.duplicate(offer.id, {
        bulk_price: offer.bulk_price,
        minimum_quantity: offer.minimum_quantity,
        available_stock: offer.available_stock,
        validity_days: 7
      });
      alert(`Success! Duplicated offer created (#${res.data.id}). You can now adjust its price or stock.`);
      await loadOffers();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to duplicate offer');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this bulk offer?')) return;
    try {
      await offersApi.delete(id);
      await loadOffers();
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  const filteredOffers = offers.filter(o => {
    if (filter === 'active') return o.status === 'active';
    if (filter === 'paused') return o.status === 'paused';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#0075E3]" />
            <span>My Bulk Offers (Merchant Controlled)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You dictate the bulk price, minimum group thresholds, and stock allocation. AI never changes your rates.
          </p>
        </div>

        <button
          onClick={() => navigate('/merchant/offers/create')}
          className="flex items-center space-x-2 bg-[#0075E3] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {(['all', 'active', 'paused'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              filter === tab
                ? 'bg-[#0075E3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} Offers ({offers.filter(o => tab === 'all' || o.status === tab).length})
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No bulk offers found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create your first bulk deal to attract neighborhood customers!</p>
          <button
            onClick={() => navigate('/merchant/offers/create')}
            className="px-4 py-2 bg-[#0075E3] text-white rounded-xl text-xs font-bold"
          >
            Create Offer Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const savings = Math.max(0, (offer.retail_price || 0) - offer.bulk_price);
            const minQty = Math.max(1, offer.minimum_quantity || 1);
            const progress = Math.min(100, Math.round(((offer.booked_quantity || 0) / minQty) * 100));

            return (
              <div 
                key={offer.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-300 transition"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <ProductImage 
                      name={offer.product?.name} 
                      category={offer.product?.category} 
                      src={offer.image_url || offer.product?.image_url}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white/95 px-2.5 py-0.5 rounded-full shadow-xs">
                        {offer.product?.category || 'Grocery'}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${getStatusColor(offer.status)}`}>
                        {getStatusLabel(offer.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {offer.product?.name || `Product #${offer.product_id}`}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Pack size: {offer.product?.pack_size || 'Standard Unit'}</p>
                    </div>

                    {/* Pricing Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Merchant Bulk Price</p>
                        <p className="text-lg font-black text-[#0075E3]">{formatCurrency(offer.bulk_price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Regular Retail</p>
                        <p className="text-xs text-slate-400 line-through font-semibold">{formatCurrency(offer.retail_price)}</p>
                        <p className="text-[11px] font-bold text-emerald-600">Save {formatCurrency(savings)}</p>
                      </div>
                    </div>

                    {/* Group Buying Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Group Progress</span>
                        <span className="text-[#0075E3] font-bold">{offer.booked_quantity} / {offer.minimum_quantity} min</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00BAF2] to-[#0075E3] rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {progress >= 100 && (
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Target unlocked! Ready for fulfillment.
                        </p>
                      )}
                    </div>

                    {/* 1-Tap Quick Stock Adjustments */}
                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                      <span className="text-xs text-slate-700 font-semibold">
                        Stock: <strong className="text-[#0075E3] font-black">{offer.available_stock}</strong>
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleQuickStock(offer.id, -5)}
                          disabled={offer.available_stock < 5}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-xs font-black rounded hover:bg-slate-100 disabled:opacity-30"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleQuickStock(offer.id, -1)}
                          disabled={offer.available_stock < 1}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-xs font-black rounded hover:bg-slate-100 disabled:opacity-30"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickStock(offer.id, 1)}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-xs font-black rounded hover:bg-blue-600 hover:text-white"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickStock(offer.id, 5)}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-xs font-black rounded hover:bg-blue-600 hover:text-white"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleStatus(offer)}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      {offer.status === 'active' ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    {/* Quick Repeat / Duplicate Offer Button */}
                    <button
                      onClick={() => handleDuplicateOffer(offer)}
                      disabled={duplicatingId === offer.id}
                      className="text-xs font-bold text-[#0075E3] hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                      title="Duplicate this bulk offer with fresh dates"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{duplicatingId === offer.id ? 'Copying...' : 'Duplicate'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/merchant/offers/edit/${offer.id}`)}
                      className="p-1.5 text-slate-500 hover:text-[#0075E3] rounded-lg hover:bg-white"
                      title="Edit Offer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-white"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BulkOffers;
