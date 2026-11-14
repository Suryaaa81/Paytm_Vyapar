export interface Merchant {
  id: number;
  name: string;
  location: string;
  neighborhood: string;
  category: string;
  phone?: string;
  description?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  neighborhood: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  brand?: string;
  variety?: string;
  unit: string;
  pack_size?: string;
}

export interface BulkOffer {
  id: number;
  merchant_id: number;
  product_id: number;
  product_name?: string;
  product_category?: string;
  merchant_name?: string;
  merchant_neighborhood?: string;
  bulk_price: number;
  retail_price: number;
  minimum_quantity: number;
  available_stock: number;
  booked_quantity: number;
  group_progress_pct?: number;
  validity_start?: string;
  validity_end?: string;
  fulfilment_method: string;
  description?: string;
  status: string;
  pack_size?: string;
  unit?: string;
  created_at?: string;
  savings?: number;
}

export interface Booking {
  id: number;
  booking_reference: string;
  customer_id: number;
  merchant_id: number;
  offer_id: number;
  quantity: number;
  unit_price_at_booking: number;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  customer_name?: string;
  offer_name?: string;
  product_name?: string;
  merchant_name?: string;
}

export interface Transaction {
  id: number;
  merchant_id: number;
  transaction_type: string;
  amount: number;
  description?: string;
  entry_date: string;
  source: string;
}

export interface LoyaltyCustomer {
  customer_id: number;
  customer_name: string;
  neighborhood?: string;
  last_visit_date?: string;
  days_since_last_visit?: number;
  avg_visit_interval?: number;
  total_visits: number;
  total_purchases: number;
  loyalty_status: string;
  is_at_risk: boolean;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  merchant: Merchant;
  stats: {
    active_offers_count: number;
    total_bookings_count: number;
    pending_bookings_count: number;
    total_quantity_booked: number;
    estimated_sales_value: number;
    customers_reached: number;
  };
  recent_bookings: Booking[];
  active_offers: BulkOffer[];
  low_stock_alerts: BulkOffer[];
  notifications: Notification[];
}

export interface ParsedTransaction {
  transaction_type: string;
  amount: number;
  description?: string;
}

export interface LedgerSummary {
  total_cash_sales: number;
  total_credit_receivable: number;
  total_expenses: number;
  net_cash_movement: number;
  recent_transactions: Transaction[];
}
