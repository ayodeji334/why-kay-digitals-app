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
  rates: Rate[];
  is_buy_enabled: boolean;
  is_sell_enabled: boolean;
}

export interface Country {
  cca2: string;
  flag?: string;
  name?: string | { common?: string; official?: string };
}

export interface CountryPickerProps {
  /** Currently selected country */
  value?: Country;
  /** Called when user selects a country */
  onChange: (country: Country) => void;
  /** List of countries to populate the picker */
  countries: Country[];
  /** Derive a display name from a Country object */
  getCountryName?: (country: Country) => string;
  /** Pre-selected country on mount */
  defaultCountry?: Country;
  /** Label rendered above the selector */
  label?: string;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Validation error message */
  error?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Modal title */
  modalTitle?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Show the short country code (cca2) inside the selector box */
  showCode?: boolean;
}
