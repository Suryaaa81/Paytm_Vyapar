import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Save, CheckCircle2, AlertCircle, IndianRupee, ArrowDownUp, RefreshCw } from 'lucide-react';
import { ledgerApi } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SpeakLedger: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('te-IN');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await ledgerApi.getSummary(1);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateVoice = async (text: string) => {
    setTranscribedText(text);
    await parseText(text);
  };

  const parseText = async (text: string) => {
    try {
      setLoading(true);
      const res = await ledgerApi.parse({ text });
      setParsedData(res.data);
      setSavedSuccess(false);
    } catch (err) {
      alert('Failed to parse text');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitTransactions = async () => {
    if (!parsedData || !parsedData.transactions) return;
    try {
      setLoading(true);
      await ledgerApi.saveTransactions({
        merchant_id: 1,
        transactions: parsedData.transactions,
        source: 'voice',
        raw_text: transcribedText,
      });
      setSavedSuccess(true);
      await loadSummary();
      setTimeout(() => {
        setSavedSuccess(false);
        setParsedData(null);
        setTranscribedText('');
      }, 2000);
    } catch (err) {
      alert('Failed to save transactions to ledger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#0075E3]" />
              <span>Speak Ledger — Voice Accounting</span>
            </h1>
            <span className="text-[10px] font-bold bg-sky-100 text-[#0075E3] px-2 py-0.5 rounded-full">
              Sarvam AI Voice Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Speak natural voice entries in Telugu, Hindi, or English. Audio is parsed into Cash Sales, Credit (Receivables), and Expenses.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-bold border border-slate-200">
          Bookkeeping Assistant • Sri Vinayaka Kirana Store
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Voice Input & Transcription */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-2">1. Voice / Audio Input</h2>
            
            {/* Language Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Audio Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
              >
                <option value="te-IN">Telugu (తెలుగు) — Primary</option>
                <option value="hi-IN">Hindi (हिंदी)</option>
                <option value="en-IN">Indian English</option>
              </select>
            </div>

            {/* Mic Button UI */}
            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <button
                onClick={() => setRecording(!recording)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#0075E3] text-white hover:bg-blue-700'
                }`}
              >
                {recording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <p className="text-xs font-bold text-slate-700 mt-3">
                {recording ? 'Listening in ' + language + '...' : 'Press Mic to Record Audio'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">or choose a quick demo audio scenario</p>
            </div>

            {/* Demo Audio Chips */}
            <div className="mt-4 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Quick Demo Voice Examples:</p>
              <button
                onClick={() => handleSimulateVoice("Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees")}
                className="w-full text-left text-xs p-2 bg-blue-50/60 hover:bg-blue-100 text-blue-900 rounded-lg font-medium border border-blue-200 transition"
              >
                🗣️ "Cash sale 450 rupees, credit sale 200 rupees, shop expense 150 rupees"
              </button>
              <button
                onClick={() => handleSimulateVoice("Cash sale 1200 rupees, credit sale 500 rupees, electricity bill paid 400 rupees")}
                className="w-full text-left text-xs p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg font-medium border border-slate-200 transition"
              >
                🗣️ "Cash sale 1200 rupees, credit sale 500 rupees, electricity bill paid 400 rupees"
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Transcribed Speech:
            </label>
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="Spoken words will appear here..."
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
            />
          </div>
        </div>

        {/* Column 2: Transaction Parser & Arithmetic */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-2">2. Accounting Breakdown</h2>
            <p className="text-xs text-slate-500 mb-4">
              AI parses categories. Deterministic math computes Net Cash Movement.
            </p>

            {parsedData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {parsedData.transactions.map((tx: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-700 capitalize">
                        {tx.type.replace('_', ' ')}
                      </span>
                      <span className={`font-black ${
                        tx.type === 'cash_sale' ? 'text-emerald-600' :
                        tx.type === 'credit_sale' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Math Verification Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Inflow:</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(parsedData.cash_total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Expenses:</span>
                    <span className="font-bold text-amber-600">-{formatCurrency(parsedData.expense_total)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                    <span>Net Cash Movement:</span>
                    <span className="text-[#0075E3]">{formatCurrency(parsedData.net_cash)}</span>
                  </div>
                </div>

                {/* Credit Notice */}
                <div className="text-[11px] p-2.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                  ℹ️ Credit Sales: <strong>{formatCurrency(parsedData.credit_total)}</strong> kept as separate customer receivable (not counted in cash balance).
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <ArrowDownUp className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No voice data parsed yet</p>
                <p className="text-[11px]">Record audio or select a demo example to verify math</p>
              </div>
            )}
          </div>

          {parsedData && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleCommitTransactions}
                disabled={loading || savedSuccess}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved to Merchant Ledger!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Confirm & Post to Daily Ledger</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Column 3: Ledger Summary & Balances */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">3. Sri Vinayaka Kirana Ledger</h2>
              <button onClick={loadSummary} className="p-1 text-slate-400 hover:text-slate-600">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {summary && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Total Cash Sales</span>
                    <p className="text-lg font-black text-emerald-900">{formatCurrency(summary.total_cash_sales)}</p>
                  </div>
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Credit Receivables</span>
                    <p className="text-lg font-black text-[#0075E3]">{formatCurrency(summary.total_credit_sales)}</p>
                  </div>
                  <IndianRupee className="w-6 h-6 text-[#0075E3]" />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Total Shop Expenses</span>
                    <p className="text-lg font-black text-amber-900">{formatCurrency(summary.total_expenses)}</p>
                  </div>
                  <IndianRupee className="w-6 h-6 text-amber-600" />
                </div>

                <div className="p-3.5 bg-gradient-to-r from-[#002970] to-[#0075E3] text-white rounded-xl shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-blue-200 uppercase">Net Cash Movement</span>
                    <p className="text-xl font-black">{formatCurrency(summary.net_cash_movement)}</p>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">In Register</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Compliant with lightweight kirana single-entry principles.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakLedger;
