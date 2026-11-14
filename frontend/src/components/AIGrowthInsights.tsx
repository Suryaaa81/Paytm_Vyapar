import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  X, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  IndianRupee,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface GrowthInsight {
  id: string;
  category: 'group_buying' | 'customer_retention' | 'inventory' | 'sales_growth' | 'ledger';
  priority: 'high' | 'medium' | 'low';
  title: string;
  observation: string;
  supporting_data: Record<string, any>;
  why_it_matters: string;
  recommended_action: string;
  expected_benefit: string;
  action_type: string;
  action_payload: Record<string, any>;
}

interface AIGrowthInsightsProps {
  insights: GrowthInsight[];
  onDismiss?: (id: string) => void;
  onApproveAction?: (insight: GrowthInsight) => void;
}

export const AIGrowthInsights: React.FC<AIGrowthInsightsProps> = ({ 
  insights, 
  onDismiss,
  onApproveAction 
}) => {
  const navigate = useNavigate();

  const handleAction = (insight: GrowthInsight) => {
    if (onApproveAction) {
      onApproveAction(insight);
      return;
    }

    // Default route actions based on recommendation type
    if (insight.action_type === 'draft_campaign') {
      navigate('/merchant/loyalty');
    } else if (insight.action_type === 'promote_offer' || insight.action_type === 'adjust_offer') {
      navigate('/merchant/offers');
    } else if (insight.action_type === 'open_ledger') {
      navigate('/merchant/ledger');
    } else if (insight.action_type === 'restock_distributor') {
      navigate('/merchant/invoices');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'group_buying':
        return <TrendingUp className="w-4 h-4 text-[#0075E3]" />;
      case 'customer_retention':
        return <Users className="w-4 h-4 text-[#F59E0B]" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'ledger':
        return <IndianRupee className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#0075E3]" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
          High Impact
        </span>
      );
    }
    if (priority === 'medium') {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Growth Opportunity
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
        Optimization
      </span>
    );
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <Sparkles className="w-8 h-8 text-[#0075E3] mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-bold text-[#172B4D]">AI Growth Engine Active</h3>
        <p className="text-xs text-[#64748B] mt-1">
          Store metrics are healthy. Recommendations will appear dynamically as new booking and inventory patterns emerge.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0075E3] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Vyapar-Brain AI Growth Insights
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 rounded-full">
              {insights.length} Actionable Recommendations
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Analyzes store booking velocity, inventory thresholds, and customer visit intervals.
            <strong> Merchant approval is required before any business action executes.</strong>
          </p>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-[#0075E3]" />
          <span>Real-time DB Evidence</span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 hover:border-blue-300 hover:bg-white transition flex flex-col justify-between space-y-3 shadow-xs"
          >
            <div className="space-y-2.5">
              {/* Category & Priority Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#172B4D]">
                  {getCategoryIcon(insight.category)}
                  <span className="capitalize">{insight.category.replace('_', ' ')}</span>
                </div>
                {getPriorityBadge(insight.priority)}
              </div>

              {/* Title & Observation */}
              <div>
                <h3 className="text-sm font-extrabold text-[#172B4D] leading-snug">
                  {insight.title}
                </h3>
                <div className="mt-1 p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-[#172B4D] font-medium">
                    <strong className="text-slate-500 text-[10px] uppercase block tracking-wider">What the system observed:</strong>
                    {insight.observation}
                  </p>
                </div>
              </div>

              {/* Why It Matters */}
              <div className="text-xs text-[#64748B] space-y-1">
                <p>
                  <strong className="text-[#172B4D] font-bold">Why it matters: </strong>
                  {insight.why_it_matters}
                </p>
                <p className="bg-emerald-50 text-[#16A34A] p-2 rounded-lg border border-emerald-100 font-semibold text-[11px]">
                  💡 <strong>Expected Benefit (Est):</strong> {insight.expected_benefit}
                </p>
              </div>

              {/* Recommended Action Box */}
              <div className="text-xs bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 text-[#002970]">
                <strong className="block text-[10px] uppercase font-bold text-[#0075E3] tracking-wider mb-0.5">
                  Recommended Action:
                </strong>
                <span>{insight.recommended_action}</span>
              </div>
            </div>

            {/* Approval / Dismiss Action Bar */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
              <button
                onClick={() => onDismiss && onDismiss(insight.id)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded-lg transition"
              >
                Dismiss
              </button>

              <button
                onClick={() => handleAction(insight)}
                className="px-3.5 py-1.5 bg-[#0075E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Review & Approve Action</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIGrowthInsights;
