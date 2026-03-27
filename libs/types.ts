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
