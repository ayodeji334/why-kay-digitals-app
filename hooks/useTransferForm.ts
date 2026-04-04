import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

interface Wallet {
  asset_id?: string;
  uuid?: string;
  name?: string;
  symbol?: string;
  logo?: string;
  balance?: string | number;
  price?: string | number;
  value?: string | number;
  [key: string]: any;
}

interface SelectedCryptoWallet {
  asset_id?: string;
  balance?: number;
  price?: number;
  [key: string]: any;
}

interface UseCryptoTransferProps {
  wallets: Wallet[];
  assetId: string;
  amount: number;
  activeTab: string;
  fiatBalance: number;
  form: UseFormReturn<any>;
}

interface UseCryptoTransferReturn {
  userWallets: any[];
  selectedCryptoWallet: SelectedCryptoWallet | undefined;
  hasInsufficientBalance: boolean;
  getTransferPayload: (values: any) => any;
  validateCryptoTransfer: (
    amount: number,
    selectedWallet: SelectedCryptoWallet | undefined,
  ) => boolean;
  calculateCryptoAmountInUSD: (amount: number, price: number) => number;
  calculateCryptoAmountInCoin: (amountUSD: number, price: number) => number;
}

export function useCryptoTransfer({
  wallets,
  assetId,
  amount,
  activeTab,
  fiatBalance,
}: UseCryptoTransferProps): UseCryptoTransferReturn {
  // Transform wallets for select input
  const userWallets = useMemo(() => {
    if (!wallets || wallets.length === 0) return [];
    return wallets
      .map((asset: any) => ({
        ...asset,
        label: `${asset?.name} (${asset?.symbol})`,
        value: asset.asset_id ?? asset.uuid ?? "",
        symbol: asset.symbol ?? "",
        logo_url: asset.logo ?? "",
        price: asset?.value,
      }))
      .sort((a: any, b: any) => {
        const aPrice = Number(a.price);
        const bPrice = Number(b.price);
        const aValue = Number(a.balance);
        const bValue = Number(b.balance);

        // wallets with no balance sorted by market price desc
        if (aPrice !== bPrice) return bPrice - aPrice;
        // wallets with balance float to top, sorted by USD value desc
        if (bValue !== aValue) return bValue - aValue;
        return 0;
      });
  }, [wallets]);

  // Get selected crypto wallet details
  const selectedCryptoWallet = useMemo(
    () => userWallets.find(w => w.asset_id === assetId),
    [userWallets, assetId],
  );

  // Check for insufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (!amount) return false;

    if (activeTab === "fiat") {
      return amount > fiatBalance;
    }

    if (!selectedCryptoWallet) return true;

    // For crypto: amount is in USD, compare with wallet's USD value
    const walletUSDValue =
      Number(selectedCryptoWallet.balance) * Number(selectedCryptoWallet.price);
    return amount > walletUSDValue;
  }, [amount, activeTab, fiatBalance, selectedCryptoWallet]);

  // Get transfer payload for crypto
  const getTransferPayload = (values: any) => ({
    username: values.username,
    amount: Number(values.amount),
    asset_id: values.asset_id,
    type: "CRYPTO_TRANSFER",
    url: "/wallets/user/transfer-crypto",
  });

  // Validate crypto transfer
  const validateCryptoTransfer = (
    amountUSD: number,
    selectedWallet: SelectedCryptoWallet | undefined,
  ): boolean => {
    if (!selectedWallet) {
      return false;
    }

    const walletBalanceInUSD =
      Number(selectedWallet.balance) * Number(selectedWallet.price);

    if (amountUSD <= 0) {
      return false;
    }

    if (amountUSD > walletBalanceInUSD) {
      return false;
      //   return {
      //     isValid: false,
      //     error: `Insufficient balance. Available: $${walletBalanceInUSD.toFixed(
      //       2,
      //     )}`,
      //   };
    }

    return true;
  };

  // Convert USD amount to crypto amount
  const calculateCryptoAmountInCoin = (
    amountUSD: number,
    price: number,
  ): number => {
    if (!price || price <= 0) return 0;
    return amountUSD / price;
  };

  // Convert crypto amount to USD
  const calculateCryptoAmountInUSD = (
    cryptoAmount: number,
    price: number,
  ): number => {
    if (!price || price <= 0) return 0;
    return cryptoAmount * price;
  };

  return {
    userWallets,
    selectedCryptoWallet,
    hasInsufficientBalance,
    getTransferPayload,
    validateCryptoTransfer,
    calculateCryptoAmountInUSD,
    calculateCryptoAmountInCoin,
  };
}
