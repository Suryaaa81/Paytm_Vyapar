import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Edit2, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { invoicesApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const InvoiceIntelligence: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sample items state for human-in-the-loop editing
  const [items, setItems] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedData(null);
      setSavedSuccess(false);
    }
  };

  const handleExtract = async () => {
    try {
      setExtracting(true);
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const res = await invoicesApi.extract(formData);
      setExtractedData(res.data);
      setItems(res.data.items || []);
    } catch (err) {
      alert('Failed to extract invoice');
    } finally {
      setExtracting(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSaveToInventory = async () => {
    try {
      setSaving(true);
      await invoicesApi.confirm({
        merchant_id: 1,
        supplier: extractedData?.supplier || 'Hyderabad Wholesale Mart',
        invoice_date: extractedData?.invoice_date || '2026-11-14',
        items: items,
      });
      setSavedSuccess(true);
    } catch (err) {
      alert('Failed to save to inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0075E3]" />
              <span>AI Invoice & Stock Ingestion</span>
            </h1>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sarvam AI / OCR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Turn physical paper bills and supplier distributor invoices into structured inventory.
            Human-in-the-loop review ensures you verify all prices before committing to stock.
          </p>
        </div>

        <div className="text-xs bg-blue-50 text-[#0075E3] px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
          Sri Vinayaka Kirana Store • Ameerpet
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0075E3] transition text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0075E3] flex items-center justify-center mx-auto">
          <Upload className="w-7 h-7" />
        </div>

        <div>
          <h3 className="font-extrabold text-base text-slate-800">
            {file ? file.name : 'Upload Purchase Invoice (PDF or Photo)'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports mobile phone camera photos, scanned PDFs, or distributor receipts
          </p>
        </div>

        <div className="flex justify-center items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
            Choose Document
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={handleExtract}
            disabled={extracting}
            className="px-5 py-2 bg-gradient-to-r from-[#00BAF2] to-[#0075E3] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {extracting ? (
              <span>Extracting Invoice...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract with AI Engine</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Results & Human Verification Table */}
      {extractedData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                AI Extraction Complete • Human Review Required
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Distributor: {extractedData.supplier}
              </h3>
              <p className="text-xs text-slate-500">Invoice Date: {extractedData.invoice_date}</p>
            </div>

            <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
              ✓ Verified Source: {extractedData.source === 'sarvam' ? 'Sarvam Vision API' : 'Sarvam Intelligent Fallback'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Pack Size</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Qty Received</th>
                  <th className="py-2.5 px-3">Purchase Rate (₹)</th>
                  <th className="py-2.5 px-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:border-[#0075E3] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.pack_size}
                        onChange={(e) => handleItemChange(idx, 'pack_size', e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-[#0075E3] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:border-[#0075E3] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold focus:border-[#0075E3] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={item.purchase_price}
                        onChange={(e) => handleItemChange(idx, 'purchase_price', parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-[#0075E3] focus:border-[#0075E3] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 text-xs">
                      {formatCurrency(item.quantity * item.purchase_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              💡 You can manually adjust any quantities or prices above before adding to your store database.
            </p>

            <button
              onClick={handleSaveToInventory}
              disabled={saving || savedSuccess}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <span>Saving to Inventory...</span>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Store Inventory!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Commit to Stock</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceIntelligence;
