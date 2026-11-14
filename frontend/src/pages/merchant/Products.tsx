import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { offersApi, productsApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductImage from '../../components/ProductImage';
import { useLanguage } from '../../context/LanguageContext';

export const Products: React.FC = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'available'>('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await offersApi.getByMerchant(1);
      setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // One-tap stock update
  const handleStockAdjust = async (offer: any, delta: number) => {
    const newStock = Math.max(0, (offer.available_stock || 0) + delta);
    try {
      await offersApi.update(offer.id, {
        merchant_id: 1,
        product_name: offer.product?.name,
        category: offer.product?.category,
        pack_size: offer.product?.pack_size,
        unit: offer.product?.unit || 'bags',
        retail_price: offer.retail_price,
        bulk_price: offer.bulk_price,
        minimum_quantity: offer.minimum_quantity,
        available_stock: newStock,
        fulfilment_method: offer.fulfilment_method,
        description: offer.description
      });
      await loadInventory();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const filteredOffers = offers.filter(o => {
    const matchesSearch = !search || o.product?.name?.toLowerCase().includes(search.toLowerCase());
    if (stockFilter === 'low') return matchesSearch && (o.available_stock < 5);
    if (stockFilter === 'available') return matchesSearch && (o.available_stock >= 5);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0075E3]" />
            <span>{t.products_stock} Management</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            One-tap stock adjustment, inventory alerts, and fast-moving staple tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-[#64748B]">Total Items:</span>
          <span className="px-3 py-1 bg-blue-50 text-[#0075E3] font-black rounded-xl border border-blue-200">
            {offers.length} Products
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {(['all', 'available', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStockFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                stockFilter === f
                  ? 'bg-[#0075E3] text-white shadow-xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All Stock' : f === 'available' ? 'In Stock (≥5)' : 'Low Stock Alert (<5)'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
          />
        </div>
      </div>

      {/* Product Grid with One-Tap Stock Buttons */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-[#172B4D]">No stock matching your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => {
            const isLow = (offer.available_stock || 0) < 5;
            const isOut = (offer.available_stock || 0) <= 0;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <ProductImage
                      name={offer.product?.name}
                      category={offer.product?.category}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Available'}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#172B4D] mt-1 leading-snug">
                        {offer.product?.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">Pack: {offer.product?.pack_size}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Bulk Rate</span>
                      <strong className="text-[#0075E3]">{formatCurrency(offer.bulk_price)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Booked So Far</span>
                      <strong className="text-[#172B4D]">{offer.booked_quantity || 0} units</strong>
                    </div>
                  </div>
                </div>

                {/* One-Tap Stock Controls (Part 2 requirement) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Stock</span>
                    <span className="text-lg font-black text-[#172B4D]">{offer.available_stock} {offer.product?.unit || 'bags'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleStockAdjust(offer, -5)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition"
                      title="Decrease stock by 5"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleStockAdjust(offer, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition"
                      title="Decrease stock by 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleStockAdjust(offer, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-[#0075E3] hover:text-white text-[#0075E3] font-bold text-xs flex items-center justify-center transition"
                      title="Increase stock by 1"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleStockAdjust(offer, 5)}
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-[#0075E3] hover:text-white text-[#0075E3] font-bold text-xs flex items-center justify-center transition"
                      title="Increase stock by 5"
                    >
                      +5
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

export default Products;
