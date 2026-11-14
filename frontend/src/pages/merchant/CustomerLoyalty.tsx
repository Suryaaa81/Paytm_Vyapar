import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, MessageSquare, Send, CheckCircle2, Globe, HeartHandshake, ShieldCheck, Ban, Check } from 'lucide-react';
import { loyaltyApi } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const CustomerLoyalty: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [language, setLanguage] = useState<'english' | 'telugu' | 'hindi'>('english');
  const [campaignMessage, setCampaignMessage] = useState<string>('');
  const [draftId, setDraftId] = useState<number | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [campaignStatus, setCampaignStatus] = useState<string>('draft');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLoyaltyData();
  }, [segmentFilter]);

  const loadLoyaltyData = async () => {
    try {
      setLoading(true);
      const res = await loyaltyApi.getCustomers(1, segmentFilter === 'all' ? undefined : segmentFilter);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setStatusMessage(null);
    setCampaignStatus('draft');
    generateMessage(customer, language);
  };

  const generateMessage = async (customer: any, lang: string) => {
    try {
      setGenerating(true);
      const res = await loyaltyApi.createCampaign({
        merchant_id: 1,
        customer_id: customer.customer_id,
        language: lang,
      });
      setCampaignMessage(res.data.message_text);
      setDraftId(res.data.id);
      setCampaignStatus(res.data.status || 'draft');
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        setStatusMessage(err.response.data.detail);
      }
      // Fallback preview
      if (lang === 'telugu') {
        setCampaignMessage(`నమస్తే ${customer.customer_name} గారు! శ్రీ వినాయక కిరాణా స్టోర్ లో మీ కోసం ప్రత్యేక బల్క్ ఆఫర్లు ఉన్నాయి. ఈ వారం తప్పకుండా సందర్శించండి.`);
      } else if (lang === 'hindi') {
        setCampaignMessage(`नमस्ते ${customer.customer_name} जी! श्री विनायक किराना स्टोर में आपके लिए विशेष थोक छूट उपलब्ध है। इस सप्ताह अवश्य पधारें।`);
      } else {
        setCampaignMessage(`Hi ${customer.customer_name}! We miss you at Sri Vinayaka Kirana Store. Check out our fresh bulk discounts on Sona Masoori Rice and Dal this week!`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleLanguageChange = (lang: 'english' | 'telugu' | 'hindi') => {
    setLanguage(lang);
    if (selectedCustomer) {
      generateMessage(selectedCustomer, lang);
    }
  };

  const handleApproveCampaign = async () => {
    if (!draftId) return;
    try {
      await loyaltyApi.updateCampaignStatus(draftId, 'approved');
      setCampaignStatus('approved');
      setStatusMessage('Campaign approved by merchant. Ready for dispatch.');
    } catch (err) {
      alert('Failed to approve campaign');
    }
  };

  const handleSendSimulation = async () => {
    if (!draftId) return;
    try {
      await loyaltyApi.updateCampaignStatus(draftId, 'simulated_sent');
      setCampaignStatus('simulated_sent');
      setStatusMessage('Campaign sent via simulated neighborhood delivery network!');
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (err) {
      alert('Failed to dispatch campaign');
    }
  };

  const atRiskCount = customers.filter(c => c.is_at_risk).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0075E3]" />
              <span>Customer Loyalty & AI Retention</span>
            </h1>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              Lapse Detection Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detects neighborhood shoppers who exceed 1.5x their historical cycle. Generates approved Telugu/Hindi/English retention campaigns.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">At-Risk Shoppers:</span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-lg text-xs">
            {atRiskCount} Flagged
          </span>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Shoppers' },
          { id: 'Potentially Inactive', label: '⚠️ Potentially Inactive' },
          { id: 'Active Customer', label: 'Active Shoppers' },
          { id: 'Regular Customer', label: 'Regular Customers' },
          { id: 'High-Value Repeat Customer', label: '⭐ High-Value Repeat' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSegmentFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              segmentFilter === tab.id
                ? 'bg-[#0075E3] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-1">Neighborhood Shopper Activity</h2>
          <p className="text-xs text-slate-500 mb-4">Click any customer to review visit evidence and draft an approved retention offer.</p>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No customers found in this segment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50/70">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Avg Cycle</th>
                    <th className="py-2.5 px-3">Last Visit</th>
                    <th className="py-2.5 px-3">Consent</th>
                    <th className="py-2.5 px-3">Segment</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr 
                      key={c.customer_id} 
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        selectedCustomer?.customer_id === c.customer_id ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleSelectCustomer(c)}
                    >
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{c.customer_name}</p>
                        <p className="text-[11px] text-slate-400">Spend: {formatCurrency(c.total_purchases || 0)}</p>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-slate-700">
                        {c.avg_interval_days ? `Every ${c.avg_interval_days} days` : 'Variable'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-bold text-slate-800">{c.days_since_last_visit} days ago</span>
                      </td>
                      <td className="py-3 px-3">
                        {c.allow_promotions !== false ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Opted In ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Opted Out ✗
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {c.is_at_risk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Potentially Inactive</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0075E3]">
                            <span>{c.segment}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomer(c);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#0075E3] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition"
                        >
                          Draft
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Campaign Draft Assistant (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#0075E3]" />
                <span>Multilingual Re-engagement</span>
              </h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded">
                AI Growth Copilot
              </span>
            </div>

            {selectedCustomer ? (
              <div className="space-y-4">
                {/* Evidence Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{selectedCustomer.customer_name}</span>
                    <span className="text-amber-700 font-bold text-[11px]">
                      {selectedCustomer.days_since_last_visit} days absent
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Evidence:</strong> {selectedCustomer.risk_evidence}
                  </p>
                </div>

                {/* Consent Warning if opted out */}
                {selectedCustomer.allow_promotions === false && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <Ban className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Customer has Opted Out</p>
                      <p className="text-[11px] mt-0.5">
                        In accordance with privacy and DPDP Act standards, direct promotional dispatch is disabled for this customer.
                      </p>
                    </div>
                  </div>
                )}

                {/* Language Selectors */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select Language (Telugu / Hindi / English)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['english', 'telugu', 'hindi'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => handleLanguageChange(l)}
                        className={`py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                          language === l
                            ? 'bg-[#0075E3] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Message Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campaign Message (Reviewable)
                  </label>
                  <textarea
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    rows={4}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0075E3] font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Status: <strong className="uppercase text-[#0075E3]">{campaignStatus}</strong> • Merchant must approve before dispatch.
                  </p>
                </div>

                {statusMessage && (
                  <div className="p-2.5 bg-blue-50 text-[#0075E3] border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <HeartHandshake className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Select a customer from the left</p>
                <p className="text-[11px] mt-0.5">Generate customized Telugu or Hindi re-engagement offers</p>
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {campaignStatus === 'draft' && selectedCustomer.allow_promotions !== false && (
                <button
                  onClick={handleApproveCampaign}
                  className="w-full py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>1. Merchant Approve Message</span>
                </button>
              )}

              {campaignStatus === 'approved' && selectedCustomer.allow_promotions !== false && (
                <button
                  onClick={handleSendSimulation}
                  className="w-full py-2.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>2. Dispatch Campaign (Simulated)</span>
                </button>
              )}

              {campaignStatus === 'simulated_sent' && (
                <div className="text-center p-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                  ✓ Campaign Simulated & Logged
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerLoyalty;
