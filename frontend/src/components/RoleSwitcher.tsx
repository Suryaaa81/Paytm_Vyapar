import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Store, ShoppingBag } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'merchant' | 'customer';
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole }) => {
  const navigate = useNavigate();

  const handleSwitch = () => {
    if (currentRole === 'merchant') {
      navigate('/customer/deals');
    } else {
      navigate('/merchant/dashboard');
    }
  };

  const isMerchant = currentRole === 'merchant';

  return (
    <button
      onClick={handleSwitch}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition border shadow-xs ${
        isMerchant
          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          : 'bg-[#0075E3] hover:bg-blue-700 text-white border-blue-600'
      }`}
      title={isMerchant ? 'Switch to Customer Marketplace' : 'Switch to Merchant Dashboard'}
    >
      <div className="flex items-center space-x-2">
        {isMerchant ? (
          <ShoppingBag className="w-3.5 h-3.5 text-sky-300" />
        ) : (
          <Store className="w-3.5 h-3.5 text-sky-200" />
        )}
        <span>{isMerchant ? 'Go to Customer View' : 'Go to Merchant View'}</span>
      </div>
      <ArrowLeftRight className="w-3 h-3 opacity-80" />
    </button>
  );
};

export default RoleSwitcher;
