import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { assistantApi } from '../../services/api';

export const VyaparAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; data?: any }>>([
    {
      sender: 'assistant',
      text: 'Namaste! I am your Vyapar-Brain AI Assistant. I can help you inspect your store sales, low-stock items, at-risk customers, and pending customer reservations.',
    },
  ]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    'Show pending bookings',
    'Which customers are inactive?',
    'Show low stock offers',
    'Summarize today sales',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!textToSend) setQuery('');

    try {
      setLoading(true);
      const res = await assistantApi.query({
        merchant_id: 1,
        query: q,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data.answer,
          data: res.data.data,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I encountered an error querying your merchant data. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00BAF2] to-[#0075E3] flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Vyapar-Brain AI Assistant</h1>
            <p className="text-xs text-slate-500">
              Natural language answers grounded strictly in your actual store records.
            </p>
          </div>
        </div>

        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">
          Deterministic Insights
        </span>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[#00BAF2] to-[#0075E3] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Optional structured data preview */}
                {m.data && Array.isArray(m.data) && m.data.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1">
                    {m.data.slice(0, 4).map((d: any, i: number) => (
                      <div key={i} className="p-1.5 bg-white rounded-lg text-[11px] font-semibold text-slate-700 shadow-xs">
                        {d.booking_reference || d.customer_name || d.product?.name || JSON.stringify(d)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-3 text-xs flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#0075E3] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#0075E3] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#0075E3] animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] font-semibold">Querying Sri Vinayaka Kirana Store database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-[#0075E3] border border-slate-200 px-3 py-1 rounded-full transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about bookings, sales, inactive customers..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0075E3]"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="p-2.5 bg-[#0075E3] hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VyaparAssistant;
