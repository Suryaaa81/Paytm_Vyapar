import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, ArrowLeft, AlertTriangle, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { offersApi, productsApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    product_name: 'Sona Masoori Rice',
    category: 'Grains',
    brand: 'Premium Brand',
    variety: 'Aged 12 Months',
    pack_size: '25 kg',
    unit: 'bags',
    retail_price: 1450,
    bulk_price: 1350,
    minimum_quantity: 10,
    available_stock: 30,
    validity_days: 7,
    fulfilment_method: 'both',
    description: 'High quality premium Sona Masoori Rice 25kg bags available for neighborhood bulk group discount.',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    // If edit mode, fetch existing offer
    if (isEditMode && id) {
      loadOffer(parseInt(id));
    }
  }, [id]);

  const loadOffer = async (offerId: number) => {
    try {
      setLoading(true);
      const res = await offersApi.getById(offerId);
      const offer = res.data;
      setFormData({
        product_name: offer.product?.name || '',
        category: offer.product?.category || 'Grains',
        brand: offer.product?.brand || '',
        variety: offer.product?.variety || '',
        pack_size: offer.product?.pack_size || '25 kg',
        unit: offer.product?.unit || 'bags',
        retail_price: offer.retail_price,
        bulk_price: offer.bulk_price,
        minimum_quantity: offer.minimum_quantity,
        available_stock: offer.available_stock,
        validity_days: 7,
        fulfilment_method: offer.fulfilment_method,
        description: offer.description || '',
      });
    } catch (err) {
      alert('Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const nextVal = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: nextVal };
      // Check price warning
      if (name === 'bulk_price' || name === 'retail_price') {
        const bp = name === 'bulk_price' ? Number(nextVal) : prev.bulk_price;
        const rp = name === 'retail_price' ? Number(nextVal) : prev.retail_price;
        if (bp >= rp) {
          setWarning('Note: Merchant bulk price is equal to or higher than regular retail price.');
        } else {
          setWarning(null);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.bulk_price <= 0) {
      alert('Bulk price must be greater than 0.');
      return;
    }
    if (formData.minimum_quantity > formData.available_stock) {
      alert('Minimum group quantity cannot exceed available stock.');
      return;
    }

    try {
      setLoading(true);

      const validityEnd = new Date();
      validityEnd.setDate(validityEnd.getDate() + (Number(formData.validity_days) || 7));

      const payload = {
        merchant_id: 1, // Sri Vinayaka Kirana Store
        product_name: formData.product_name,
        category: formData.category,
        brand: formData.brand,
        variety: formData.variety,
        pack_size: formData.pack_size,
        unit: formData.unit,
        retail_price: Number(formData.retail_price),
        bulk_price: Number(formData.bulk_price),
        minimum_quantity: Number(formData.minimum_quantity),
        available_stock: Number(formData.available_stock),
        validity_end: validityEnd.toISOString(),
        fulfilment_method: formData.fulfilment_method,
        description: formData.description,
      };

      if (isEditMode && id) {
        await offersApi.update(parseInt(id), payload);
        alert('Bulk offer updated successfully!');
      } else {
        await offersApi.create(payload);
        alert('Bulk offer published successfully to the neighborhood marketplace!');
      }
      navigate('/merchant/offers');
    } catch (err: any) {
      const errorMsg =
        typeof err?.response?.data?.detail === 'string'
          ? err.response.data.detail
          : Array.isArray(err?.response?.data?.detail)
          ? err.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : err?.message || 'Failed to save bulk offer';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const savings = Math.max(0, formData.retail_price - formData.bulk_price);
  const savingsPct = formData.retail_price > 0 
    ? Math.round((savings / formData.retail_price) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/merchant/offers')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Offers</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Merchant sets price directly • Zero AI manipulation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-lg font-black text-slate-900 mb-1">
            {isEditMode ? 'Edit Bulk Offer' : 'Create Merchant Bulk Offer'}
          </h1>
          <p className="text-xs text-slate-500 mb-4">
            Publish your wholesale-style bulk offer for nearby Ameerpet shoppers. You retain 100% control over pricing and quantities.
          </p>

          {!isEditMode && (
            <div className="mb-6 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
              <span className="text-[11px] font-bold text-[#0075E3] uppercase tracking-wider block mb-2">
                ⚡ 1-Click Quick Grocery Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Sona Masoori Rice', cat: 'Grains', pack: '25 kg', unit: 'bags', retail: 1450, bulk: 1350, min: 10, stock: 35 },
                  { name: 'Toor Dal Premium', cat: 'Pulses', pack: '30 kg', unit: 'bags', retail: 4800, bulk: 4400, min: 5, stock: 20 },
                  { name: 'Freedom Sunflower Oil', cat: 'Oils', pack: '15 L', unit: 'tins', retail: 1950, bulk: 1800, min: 6, stock: 25 },
                  { name: 'Sugar Madhur', cat: 'Sweeteners', pack: '50 kg', unit: 'bags', retail: 2350, bulk: 2150, min: 5, stock: 30 },
                  { name: 'Aashirvaad Shudh Chakki Atta', cat: 'Grains', pack: '10 kg', unit: 'bags', retail: 460, bulk: 420, min: 15, stock: 50 },
                ].map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        product_name: tpl.name,
                        category: tpl.cat,
                        pack_size: tpl.pack,
                        unit: tpl.unit,
                        retail_price: tpl.retail,
                        bulk_price: tpl.bulk,
                        minimum_quantity: tpl.min,
                        available_stock: tpl.stock,
                        description: `Fresh stock of ${tpl.name} (${tpl.pack}). Special neighborhood bulk group rate direct from Sri Vinayaka Kirana Store.`
                      }));
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-[#172B4D] border border-blue-200 rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    + {tpl.name} ({tpl.pack})
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Product & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Sona Masoori Rice"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-medium bg-white"
                >
                  <option value="Grains">Grains & Rice</option>
                  <option value="Pulses">Pulses & Dals</option>
                  <option value="Oils">Edible Oils & Ghee</option>
                  <option value="Sweeteners">Sugar & Jaggery</option>
                  <option value="Spices">Spices & Masalas</option>
                  <option value="Beverages">Tea & Coffee</option>
                  <option value="Other">Other Grocery</option>
                </select>
              </div>
            </div>

            {/* Brand & Pack Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Variety</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. India Gate / Aged"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pack Size *</label>
                <input
                  type="text"
                  name="pack_size"
                  value={formData.pack_size}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 25 kg, 15 L, 10 kg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] bg-white"
                >
                  <option value="bags">Bags</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tins">Tins</option>
                  <option value="litres">Litres (L)</option>
                  <option value="boxes">Boxes / Cartons</option>
                  <option value="pieces">Pieces / Units</option>
                </select>
              </div>
            </div>

            {/* Pricing Section (Crucial) */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#002970] uppercase tracking-wider flex items-center gap-1.5">
                  <span>💰 Merchant Price Controls</span>
                </span>
                <span className="text-[11px] text-blue-600 font-medium">Full merchant authority</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Regular Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="retail_price"
                    value={formData.retail_price}
                    onChange={handleChange}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Normal single-unit customer price</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0075E3] mb-1">
                    Merchant-Set Bulk Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="bulk_price"
                    value={formData.bulk_price}
                    onChange={handleChange}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#0075E3] focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-extrabold text-[#0075E3] text-base"
                  />
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Customer saves {formatCurrency(savings)} ({savingsPct}%) per {formData.unit}
                  </p>
                </div>
              </div>

              {warning && (
                <div className="flex items-center space-x-2 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>{warning}</span>
                </div>
              )}
            </div>

            {/* Quantities & Inventory */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min. Bulk Quantity *
                </label>
                <input
                  type="number"
                  name="minimum_quantity"
                  value={formData.minimum_quantity}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">Total group threshold required</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Available Stock *
                </label>
                <input
                  type="number"
                  name="available_stock"
                  value={formData.available_stock}
                  onChange={handleChange}
                  required
                  min={formData.minimum_quantity}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">Total units ready to sell</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Validity (Days)
                </label>
                <input
                  type="number"
                  name="validity_days"
                  value={formData.validity_days}
                  onChange={handleChange}
                  min={1}
                  max={60}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
                />
                <p className="text-[11px] text-slate-500 mt-1">Offer duration window</p>
              </div>
            </div>

            {/* Fulfilment & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fulfilment Option *</label>
                <select
                  name="fulfilment_method"
                  value={formData.fulfilment_method}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3] bg-white font-medium"
                >
                  <option value="both">Both Store Pickup & Delivery</option>
                  <option value="pickup">Store Pickup Only</option>
                  <option value="delivery">Neighborhood Delivery Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Note / Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Add details about quality, packaging, or pickup timings..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/merchant/offers')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#00BAF2] to-[#0075E3] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Publishing...' : isEditMode ? 'Save Changes' : '🚀 Publish Bulk Offer'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Marketplace Preview
              </span>
              <span className="text-[10px] bg-blue-50 text-[#0075E3] px-2 py-0.5 rounded font-bold">
                Live Preview
              </span>
            </div>

            {/* Simulated Customer Card */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Save {savingsPct}%
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  {formData.product_name || 'Product Title'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {formData.pack_size} • {formData.brand || 'Merchant Packed'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  By <strong>Sri Vinayaka Kirana Store</strong> (Ameerpet, ~0.4 km)
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Bulk Deal Price</span>
                  <span className="text-lg font-black text-[#0075E3]">{formatCurrency(formData.bulk_price)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through font-semibold block">
                    {formatCurrency(formData.retail_price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    Save {formatCurrency(savings)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-medium">
                <div className="flex justify-between text-[11px]">
                  <span>Group Minimum: <strong>{formData.minimum_quantity} {formData.unit}</strong></span>
                  <span>Stock: <strong>{formData.available_stock}</strong></span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0075E3] w-1/4 rounded-full"></div>
                </div>
                <span className="text-[10px] text-slate-400 block text-right">0 of {formData.minimum_quantity} booked</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                <span className="capitalize">Fulfilment: {formData.fulfilment_method}</span>
                <span className="text-[#0075E3] font-bold">Valid for {formData.validity_days} days</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start space-x-2 text-xs text-blue-900">
              <Info className="w-4 h-4 text-[#0075E3] flex-shrink-0 mt-0.5" />
              <span>
                Once published, nearby customers in Ameerpet can search, compare your rate with Kumar Kirana & Sri Lakshmi Stores, and book their quantity.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;
