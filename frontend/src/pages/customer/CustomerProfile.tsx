import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, ShieldCheck, Bell, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';

export const CustomerProfile: React.FC = () => {
  const [allowPromos, setAllowPromos] = useState<boolean>(true);
  const [prefLang, setPrefLang] = useState<string>('en');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch customer profile
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authApi.getMe('customer');
      if (res.data) {
        if (res.data.allow_promotions !== undefined) setAllowPromos(res.data.allow_promotions);
        if (res.data.preferred_language) setPrefLang(res.data.preferred_language);
      }
    } catch (err) {
      console.error('Could not load profile', err);
    }
  };

  const handleSavePreferences = async (nextPromo: boolean, nextLang: string) => {
    try {
      setAllowPromos(nextPromo);
      setPrefLang(nextLang);
      await authApi.updateCustomerPreferences({
        allow_promotions: nextPromo,
        preferred_language: nextLang
      }, 1);
      setSavedMsg('Preferences saved and updated in privacy ledger!');
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err) {
      alert('Failed to update communication preferences');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#172B4D] flex items-center gap-2">
            <User className="w-5 h-5 text-[#0075E3]" />
            <span>Shopper Profile & Privacy Preferences</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Manage your neighborhood buyer account and promotional consent settings.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-[#0075E3] flex items-center justify-center font-black text-xl">
            RK
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#172B4D]">Rahul Kumar</h3>
            <p className="text-xs text-[#64748B]">Neighborhood Resident • Ameerpet, Hyderabad</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>Primary Neighborhood:</span>
            </span>
            <strong className="text-[#172B4D]">Ameerpet (Within 500m of Sri Vinayaka Kirana)</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>Verified Contact:</span>
            </span>
            <strong className="text-[#172B4D]">+91 98765 43220</strong>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Group Buying Account:</span>
            </span>
            <span className="text-[#16A34A] font-bold">Active Neighborhood Buyer</span>
          </div>
        </div>
      </div>

      {/* Communication Preferences & Consent (Phase 4.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-[#0075E3]" />
          <h3 className="font-extrabold text-sm text-[#172B4D]">
            Privacy & Communication Consent (DPDP Act Aligned)
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Promotional Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-0.5 pr-4">
              <span className="font-bold text-[#172B4D] block">
                Allow Neighborhood Bulk Deal Notifications
              </span>
              <p className="text-[11px] text-[#64748B]">
                Permit Sri Vinayaka Kirana Store to send you re-engagement messages or stock discounts. You can opt out at any time.
              </p>
            </div>
            <button
              onClick={() => handleSavePreferences(!allowPromos, prefLang)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                allowPromos ? 'bg-[#0075E3] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Preferred Language for Notifications */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#172B4D]">
              <Globe className="w-3.5 h-3.5 text-[#0075E3]" />
              <span>Preferred Message Language:</span>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'te', label: 'తెలుగు (Telugu)' },
                { id: 'hi', label: 'हिंदी (Hindi)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSavePreferences(allowPromos, lang.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    prefLang === lang.id
                      ? 'bg-[#0075E3] text-white border-[#0075E3] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
