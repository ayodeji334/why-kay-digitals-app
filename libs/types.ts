export type TradeIntent = {
  assetId?: string;
  symbol?: string;
  action?: "buy" | "sell" | "deposit" | "withdraw";
  source?: "home" | "rates" | "wallet";
  amount?: string;
  rate?: number;
};

export type TradeTab = "buy" | "sell";

export interface RateCategory {
  label: string;
  min_amount: string;
  max_amount: string;
  value: string;
}

export interface Rate {
  id: number;
  type: "buy" | "sell";
  default_value: string;
  categories: RateCategory[];
}

export interface CryptoOption {
  id: string;
  value: string;
  label: string;
  logo_url: string;
  symbol: string;
  market_value: number;
  // rates: Rate[];
  is_buy_enabled: boolean;
  is_sell_enabled: boolean;
  buy_rate: number;
  sell_rate: number;
}

export interface Country {
  cca2: string;
  flag?: string;
  name?: string | { common?: string; official?: string };
}

export interface CountryPickerProps {
  value?: Country;
  onChange: (country: Country) => void;
  countries: Country[];
  getCountryName?: (country: Country) => string;
  defaultCountry?: Country;
  label?: string;
  placeholder?: string;
  error?: string;
  modalTitle?: string;
  searchPlaceholder?: string;
  showCode?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
}
