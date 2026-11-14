import React from 'react';
import { BulkOffer } from '../types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../utils/formatters';
import { MapPin, Calendar, Package } from 'lucide-react';

interface OfferCardProps {
  offer: BulkOffer;
  onViewBook?: (offer: BulkOffer) => void;
  showMerchant?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onViewBook,
  showMerchant = true,
}) => {
  const savings = offer.retail_price - offer.bulk_price;
  const progress = offer.minimum_quantity > 0
    ? Math.min((offer.booked_quantity / offer.minimum_quantity) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">
              {offer.product_name || 'Product'}
            </h3>
            {offer.pack_size && (
              <span className="text-xs text-gray-400">{offer.pack_size}</span>
            )}
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {offer.product_category}
          </span>
        </div>

        {showMerchant && offer.merchant_name && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin size={12} />
            <span>
              {offer.merchant_name}
              {offer.merchant_neighborhood && `, ${offer.merchant_neighborhood}`}
            </span>
          </div>
        )}

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(offer.bulk_price)}
            </span>
            <span className="text-sm line-through text-gray-400">
              {formatCurrency(offer.retail_price)}
            </span>
            {savings > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                Save {formatCurrency(savings)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Min. {offer.minimum_quantity} {offer.unit || 'units'} •{' '}
            {offer.available_stock} in stock
          </p>
        </div>

        {/* Group progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Group Booking Progress</span>
            <span>
              {offer.booked_quantity}/{offer.minimum_quantity} booked
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#00BAF2] to-[#0075E3] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Package size={12} />
            <span>
              {offer.fulfilment_method === 'pickup'
                ? '🏪 Pickup'
                : offer.fulfilment_method === 'delivery'
                ? '🚚 Delivery'
                : '🏪🚚 Both'}
            </span>
          </div>
          {offer.validity_end && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Expires {formatDate(offer.validity_end)}</span>
            </div>
          )}
        </div>

        {onViewBook && (
          <button
            onClick={() => onViewBook(offer)}
            className="w-full bg-gradient-to-r from-[#00BAF2] to-[#0075E3] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
          >
            View & Book
          </button>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
