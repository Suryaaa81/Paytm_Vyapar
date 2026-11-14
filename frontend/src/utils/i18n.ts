export type Language = 'en' | 'te' | 'hi';

export interface Translations {
  // Navigation & General
  merchant_center: string;
  customer_hub: string;
  switch_to_customer: string;
  switch_to_merchant: string;
  home: string;
  bulk_offers: string;
  orders: string;
  customers: string;
  more: string;
  dashboard: string;
  products_stock: string;
  customer_loyalty: string;
  invoice_intel: string;
  speak_ledger: string;
  ai_assistant: string;
  reports: string;
  settings: string;

  // Merchant Home & Questions
  todays_business: string;
  new_bookings: string;
  pending_confirmations: string;
  completed_orders: string;
  todays_fulfilled_sales: string;
  available_offers: string;
  quick_actions: string;
  add_bulk_offer: string;
  view_new_orders: string;
  update_stock: string;
  customer_offers: string;
  record_sale_by_voice: string;
  view_ai_suggestions: string;
  ai_suggestions_title: string;

  // Order & Status
  status_pending: string;
  status_confirmed: string;
  status_ready: string;
  status_fulfilled: string;
  status_cancelled: string;
  confirm_order: string;
  mark_ready: string;
  mark_completed: string;
  reject_order: string;

  // Customer Shopping
  search_placeholder: string;
  popular_deals: string;
  best_deals_near_you: string;
  save_amount: string;
  bulk_price_label: string;
  retail_price_label: string;
  group_goal: string;
  view_deal_btn: string;
  book_now_btn: string;
  my_savings: string;
  compare_prices: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    merchant_center: "Merchant Command Center",
    customer_hub: "Neighborhood Customer Hub",
    switch_to_customer: "Go to Customer View",
    switch_to_merchant: "Go to Merchant View",
    home: "Home",
    bulk_offers: "Bulk Offers",
    orders: "Orders",
    customers: "Customers",
    more: "More",
    dashboard: "Dashboard",
    products_stock: "Products & Stock",
    customer_loyalty: "Customer Loyalty AI",
    invoice_intel: "Invoice Intelligence",
    speak_ledger: "Speak Ledger",
    ai_assistant: "Vyapar AI Assistant",
    reports: "Reports & Analytics",
    settings: "Store Settings",

    todays_business: "Today's Business",
    new_bookings: "Today's Bookings",
    pending_confirmations: "Pending Confirmation",
    completed_orders: "Completed Orders",
    todays_fulfilled_sales: "Fulfilled Sales",
    available_offers: "Active Offers",
    quick_actions: "Quick Actions",
    add_bulk_offer: "+ Add Bulk Offer",
    view_new_orders: "View New Orders",
    update_stock: "Update Stock",
    customer_offers: "Customer Retention",
    record_sale_by_voice: "Record Sale by Voice",
    view_ai_suggestions: "AI Advisor",
    ai_suggestions_title: "Today's AI Growth Suggestions",

    status_pending: "Pending Confirmation",
    status_confirmed: "Confirmed",
    status_ready: "Ready for Pickup",
    status_fulfilled: "Completed & Fulfilled",
    status_cancelled: "Cancelled",
    confirm_order: "Confirm Order",
    mark_ready: "Mark Ready for Pickup",
    mark_completed: "Mark Fulfilled",
    reject_order: "Reject",

    search_placeholder: "Search rice, dal, oil, sugar, atta...",
    popular_deals: "Popular Neighborhood Bulk Staples",
    best_deals_near_you: "Best Deals Near You",
    save_amount: "You Save",
    bulk_price_label: "Bulk Price",
    retail_price_label: "Retail Price",
    group_goal: "Group Goal",
    view_deal_btn: "View Deal & Book",
    book_now_btn: "Book Now",
    my_savings: "My Savings",
    compare_prices: "Compare Prices"
  },

  te: {
    merchant_center: "వ్యాపారి కమాండ్ సెంటర్",
    customer_hub: "సమీప కస్టమర్ హబ్",
    switch_to_customer: "కస్టమర్ వీక్షణకు మారండి",
    switch_to_merchant: "వ్యాపారి వీక్షణకు మారండి",
    home: "హోమ్",
    bulk_offers: "బల్క్ ఆఫర్లు",
    orders: "ఆర్డర్లు",
    customers: "కస్టమర్లు",
    more: "మరిన్ని",
    dashboard: "డ్యాష్‌బోర్డ్",
    products_stock: "వస్తువులు & నిల్వ",
    customer_loyalty: "కస్టమర్ లాయల్టీ AI",
    invoice_intel: "ఇన్‌వాయిస్ స్కానర్",
    speak_ledger: "స్పీక్ లెడ్జర్ (వాయిస్)",
    ai_assistant: "వ్యాపార్ AI అసిస్టెంట్",
    reports: "నివేదికలు",
    settings: "దుకాణం సెట్టింగులు",

    todays_business: "ఈరోజు వ్యాపారం",
    new_bookings: "ఈరోజు బుకింగ్‌లు",
    pending_confirmations: "ధృవీకరణ పెండింగ్",
    completed_orders: "పూర్తయిన ఆర్డర్లు",
    todays_fulfilled_sales: "పూర్తయిన అమ్మకాలు",
    available_offers: "యాక్టివ్ ఆఫర్లు",
    quick_actions: "త్వరిత చర్యలు",
    add_bulk_offer: "+ బల్క్ ఆఫర్ జోడించండి",
    view_new_orders: "కొత్త ఆర్డర్లు చూడండి",
    update_stock: "స్టాక్ అప్‌డేట్",
    customer_offers: "కస్టమర్ ఆఫర్లు",
    record_sale_by_voice: "వాయిస్ ద్వారా అమ్మకం నమోదు",
    view_ai_suggestions: "AI సలహాదారు",
    ai_suggestions_title: "ఈరోజు AI వ్యాపార సలహాలు",

    status_pending: "ధృవీకరణ పెండింగ్",
    status_confirmed: "ధృవీకరించబడింది",
    status_ready: "పికప్‌కు సిద్ధంగా ఉంది",
    status_fulfilled: "పూర్తయింది",
    status_cancelled: "రద్దు చేయబడింది",
    confirm_order: "ఆర్డర్ ధృవీకరించండి",
    mark_ready: "పికప్ సిద్ధం చేయండి",
    mark_completed: "డెలివరీ పూర్తి చేయండి",
    reject_order: "తిరస్కరించు",

    search_placeholder: "బియ్యం, పప్పు, నూనె, పంచదార, పిండి వెతకండి...",
    popular_deals: "జనాదరణ పొందిన బల్క్ ఆఫర్లు",
    best_deals_near_you: "మీ దగ్గర ఉన్న అత్యుత్తమ డీల్స్",
    save_amount: "మీ ఆదా",
    bulk_price_label: "బల్క్ ధర",
    retail_price_label: "సాధారణ ధర",
    group_goal: "గ్రూప్ లక్ష్యం",
    view_deal_btn: "డీల్ చూడండి & బుక్ చేయండి",
    book_now_btn: "ఇప్పుడే బుక్ చేయండి",
    my_savings: "నా పొదుపు",
    compare_prices: "ధరలను పోల్చండి"
  },

  hi: {
    merchant_center: "व्यापारी कमांड सेंटर",
    customer_hub: "पड़ोस ग्राहक हब",
    switch_to_customer: "ग्राहक दृश्य पर जाएं",
    switch_to_merchant: "व्यापारी दृश्य पर जाएं",
    home: "होम",
    bulk_offers: "थोक ऑफर",
    orders: "ऑर्डर",
    customers: "ग्राहक",
    more: "अधिक",
    dashboard: "डैशबोर्ड",
    products_stock: "उत्पाद और स्टॉक",
    customer_loyalty: "ग्राहक वफादारी AI",
    invoice_intel: "बिल स्कैनर",
    speak_ledger: "स्पीक लेज़र (आवाज बहीखाता)",
    ai_assistant: "व्यापार AI सहायक",
    reports: "रिपोर्ट और विश्लेषण",
    settings: "दुकान सेटिंग्स",

    todays_business: "आज का व्यापार",
    new_bookings: "आज की बुकिंग",
    pending_confirmations: "पुष्टि लंबित",
    completed_orders: "पूर्ण ऑर्डर",
    todays_fulfilled_sales: "पूर्ण बिक्री",
    available_offers: "सक्रिय ऑफर",
    quick_actions: "त्वरित कार्य",
    add_bulk_offer: "+ थोक ऑफर जोड़ें",
    view_new_orders: "नए ऑर्डर देखें",
    update_stock: "स्टॉक अपडेट करें",
    customer_offers: "ग्राहक ऑफर",
    record_sale_by_voice: "आवाज से बिक्री दर्ज करें",
    view_ai_suggestions: "AI सलाहकार",
    ai_suggestions_title: "आज के AI व्यापार सुझाव",

    status_pending: "पुष्टि लंबित",
    status_confirmed: "पुष्टि की गई",
    status_ready: "पिकअप के लिए तैयार",
    status_fulfilled: "पूर्ण",
    status_cancelled: "रद्द",
    confirm_order: "ऑर्डर की पुष्टि करें",
    mark_ready: "पिकअप के लिए तैयार करें",
    mark_completed: "पूरा करें",
    reject_order: "अस्वीकार करें",

    search_placeholder: "चावल, दाल, तेल, चीनी, आटा खोजें...",
    popular_deals: "लोकप्रिय थोक सौदे",
    best_deals_near_you: "आपके पास सबसे बेहतरीन सौदे",
    save_amount: "आपकी बचत",
    bulk_price_label: "थोक मूल्य",
    retail_price_label: "खुदरा मूल्य",
    group_goal: "समूह लक्ष्य",
    view_deal_btn: "सौदा देखें और बुक करें",
    book_now_btn: "अभी बुक करें",
    my_savings: "मेरी बचत",
    compare_prices: "कीमतों की तुलना करें"
  }
};
