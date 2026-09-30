import * as React from "react";
import { useEffect, useState } from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomHeader from "../components/CustomHeader";
import { withTierGate } from "../components/TierGate";
import ErrorBoundary from "../components/ErrorBoundary";
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import IntroModalScreen from "../screens/IntroModalScreen";
import LoginScreen from "../screens/LoginScreen";
import ReturningUserLoginScreen from "../screens/ReturningUserLoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import VerificationCodeScreen from "../screens/VerificationCode";
import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";
import CreateSecurityPinScreen from "../screens/CreateSecurityPinScreen";
import ConfirmSecurityPinScreen from "../screens/ConfirmSecurityPinScreen";
import BiometricPromptScreen from "../screens/BiometricPromptScreen";
import BiometricsScreen from "../screens/EnableBiometricScreen";
import AppTabs from "./AppTabs";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import KYCVerificationScreen from "../screens/KYCVerificationScreen";
import AccountSecurityScreen from "../screens/AccountSecurityScreen";
import ChangePasswordScreen from "../screens/ChangePassword";
import ChangeEmailScreen from "../screens/ChangeEmailScreen";
import ChangePhoneNumberScreen from "../screens/ChangePhoneNumberScreen";
import ChangeTransactionPinScreen from "../screens/ChangeTransactionPin";
import DeleteAccountScreen from "../screens/DeleteAccountScreen";
import LegalScreen from "../screens/LegalScreen";
import WebViewScreen from "../screens/WebViewScreen";
import HelpSupportScreen from "../screens/ContactUsScreen";
import ReferAndEarnScreen from "../screens/ReferAndEarnScreen";
import ReferralHistoryScreen from "../screens/ReferralHistoryScreen";
import BankTransferScreen from "../screens/BankTransfer";
import BVNVerificationScreen from "../screens/BVNVerificationScreen";
import IdentityVerificationScreen from "../screens/IdentityVerificationScreen";
import TwoFactorAuthenticationScreen from "../screens/TwoFactorAuthenticationScreen";
import ConfirmTwoFactorAuthenticationScreen from "../screens/ConfirmTwoFactorAuthentication";
import AccountLimitsScreen from "../screens/AccountLimitScreen";
import RateMarketScreen from "../screens/RateMarketScreen";
import BuyDataScreen from "../screens/BuyDataScreen";
import TransactionDetailScreen from "../screens/TransactionDetail";
import ConfirmTransactionScreen from "../screens/ConfirmTransactionScreen";
import BuyAirtimeScreen from "../screens/BuyAirtimeScreen";
import PayCableTVSubscriptionScreen from "../screens/PayCableTVSubscriptionScreen";
import PayElectricityBillsScreen from "../screens/PayElectricityBills";
import WithdrawScreen from "../screens/WithdrawalScreen";
import CryptoWalletScreen from "../screens/CryptoScreen";
import CryptoWalletDepositScreen from "../screens/CryptoWalletDepositScreen";
import CryptoBuyScreen from "../screens/BuyCryptoScreen";
import CryptoSellScreen from "../screens/SellCrytpoScreen";
import CryptoSwapScreen from "../screens/SwapCryptoScreen";
import TransferScreen from "../screens/TransferScreen";
import SelfieVerificationScreen from "../screens/SelfieVerificationScreen";
import SelfieConfirmationScreen from "../screens/SelfieConfirmation";
import SendScreen from "../screens/SendCrypto";
import ConfirmCryptoWithdrawalScreen from "../screens/ConfirmCryptoWithdrawScreen";
import NotificationsScreen from "../screens/Notifications";
import PendingSwapScreen from "../screens/PendingSwapTransactionScreen";
import ConversionQuote from "../screens/ConversionQuote";
import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
import SuggestionScreen from "../screens/Suggestions";
import FundBettingAccountScreen from "../screens/FundBettingAccount";
import GiftCardVouchersScreen from "../screens/GiftCardVoucherScreen";
import BrandsScreen from "../screens/BrandScreen";
import BrandDetailScreen from "../screens/BrandDetailScreen";
import PendingGiftCardScreen from "../screens/PendingGiftCardTransactionScreen";

import { useIsAuthenticated } from "../stores/authSlice";
import { useShouldPromptBiometric } from "../hooks/useShouldPromptBiometric";
import LandingScreen from "../screens/LandingScreen";
import { useBiometricPromptStore } from "../stores/biometricPromptSlice";
import { refreshBiometricState } from "../stores/biometricSlice";
import { ThemeScreen } from "../screens/ThemeScreen";
import PhoneNumberVerificationScreen from "../screens/PhoneNumberVerificationScreen";
import BVNOwnershipConfirmationScreen from "../screens/BVNOwnershipConfirmationScreen";
import DeviceSelfieVerificationScreen from "../screens/DeviceSelfieVerificationScreen";
import DeviceSelfieResultScreen from "../screens/DeviceSelfieResultScreen";
import DeviceOtpVerificationScreen from "../screens/DeviceOtpVerificationScreen";
import { LiveChatProvider } from "../context/LiveChatProvider";

const useIsSignedOut = () => !useIsAuthenticated();

const useIsAtBiometricGate = () => {
  const isAuthenticated = useIsAuthenticated();
  const { shouldPrompt } = useShouldPromptBiometric();
  return isAuthenticated && shouldPrompt;
};

const useIsInApp = () => {
  const isAuthenticated = useIsAuthenticated();
  const { shouldPrompt } = useShouldPromptBiometric();
  return isAuthenticated && !shouldPrompt;
};

const RootStack = createNativeStackNavigator({
  // Every screen renders inside its own error boundary: a crash in one screen
  // shows the error screen in its place (header and back still work) instead
  // of taking down the whole app.
  screenLayout: ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>,
  groups: {
    SignedOut: {
      if: useIsSignedOut,
      screens: {
        Landing: {
          screen: LandingScreen,
          options: { headerShown: false },
        },
        Intro: {
          screen: IntroModalScreen,
          options: { headerShown: false },
        },
        Welcome: {
          screen: WelcomeScreen,
          options: { headerShown: false, headerBackTitle: "Go back" },
        },
        SignIn: {
          screen: LoginScreen,
          options: {
            header: () => <CustomHeader showBack={false} title="Login" />,
          },
        },
        ReturningLogin: {
          screen: ReturningUserLoginScreen,
          options: {
            header: () => <CustomHeader showBack={false} title="Login" />,
          },
        },
        SignUp: {
          screen: RegisterScreen,
          options: { header: () => <CustomHeader title="Sign Up" /> },
        },
        VerifyCode: {
          screen: VerificationCodeScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle title="Verification" />,
          },
        },
        ForgetPassword: {
          screen: ForgetPasswordScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle title="Forgot Password" />,
          },
        },
        SetNewPassword: {
          screen: SetNewPasswordScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle title="New Password" />,
          },
        },
        CreatePin: {
          screen: CreateSecurityPinScreen,
          options: {
            headerBackTitle: ".",
            header: () => (
              <CustomHeader showTitle title="Create Security Pin" />
            ),
          },
        },
        ConfirmPin: {
          screen: ConfirmSecurityPinScreen,
          options: {
            headerBackTitle: ".",
            header: () => (
              <CustomHeader showTitle title="Confirm Security Pin" />
            ),
          },
        },
        WebView: {
          screen: WebViewScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle={false} title="" showChat />,
          },
        },
        // Reached only after a correct password on an unrecognized device
        // — LoginForm/ReturningUserLoginForm route straight to whichever
        // of these three is the right default, and each screen blocks
        // back-navigation into login itself (see its useBlockGoBack call),
        // so no header/back gesture here.
        DeviceSelfieVerification: {
          screen: DeviceSelfieVerificationScreen,
          options: {
            headerShown: false,
            gestureEnabled: false,
          },
        },
        DeviceSelfieResult: {
          screen: DeviceSelfieResultScreen,
          options: {
            headerShown: false,
            gestureEnabled: false,
          },
        },
        DeviceOtpVerification: {
          screen: DeviceOtpVerificationScreen,
          options: {
            headerShown: false,
            gestureEnabled: false,
          },
        },
      },
    },

    // ---------------------------------------------------------------
    // 2. Biometric gate
    //
    // Sole screen in the group, so there is no back stack, no swipe
    // gesture and no hardware-back escape. Skipping or enrolling flips
    // the store, which deactivates this group and activates App.
    // ---------------------------------------------------------------
    BiometricGate: {
      if: useIsAtBiometricGate,
      screens: {
        BiometricPrompt: {
          screen: BiometricPromptScreen,
          options: {
            headerShown: false,
            gestureEnabled: false,
          },
        },
      },
    },

    // ---------------------------------------------------------------
    // 3. Authenticated app
    // ---------------------------------------------------------------
    App: {
      if: useIsInApp,
      screens: {
        Dashboard: {
          screen: AppTabs,
          options: { headerShown: false },
        },
        BiometricSettings: {
          screen: BiometricsScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Biometric Settings" />,
          },
        },
        ConfirmTransaction: {
          screen: ConfirmTransactionScreen,
          options: {
            headerBackTitle: ".",
            header: () => (
              <CustomHeader showTitle title="Confirm Transaction" />
            ),
          },
        },
        ConfirmCryptoWithdrawTransaction: {
          screen: ConfirmCryptoWithdrawalScreen,
          options: {
            headerBackTitle: ".",
            header: () => (
              <CustomHeader showTitle title="Confirm Crypto Withdrawal" />
            ),
          },
        },
        Withdrawal: {
          screen: WithdrawScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle title="Withdraw" />,
          },
        },
        Profile: {
          screen: ProfileScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="My Profile" />,
          },
        },
        TransactionDetail: {
          screen: TransactionDetailScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader
                showTitle
                showBack={false}
                title="Transaction Detail"
              />
            ),
          },
        },
        ConversionQuote: {
          screen: withTierGate("swap_crypto", ConversionQuote),
          options: {
            gestureEnabled: true,
            headerShown: true,
            header: () => (
              <CustomHeader
                showTitle
                showBack
                title="Conversion Quote Detail"
              />
            ),
          },
        },
        Theme: {
          screen: ThemeScreen,
          options: {
            gestureEnabled: true,
            headerShown: true,
            header: () => <CustomHeader showTitle showBack title="Theme" />,
          },
        },
        PayElectricityBills: {
          screen: withTierGate("bill_payments", PayElectricityBillsScreen),
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Pay Electricity Bills" />
            ),
          },
        },
        PayCableTVSubscription: {
          screen: withTierGate("bill_payments", PayCableTVSubscriptionScreen),
          options: {
            header: () => <CustomHeader showTitle title="Pay Cable TV Bills" />,
          },
        },
        GiftCardVouchers: {
          screen: GiftCardVouchersScreen,
          options: {
            header: () => <CustomHeader showTitle title="Gift Card Vouchers" />,
          },
        },
        BuyData: {
          screen: withTierGate("bill_payments", BuyDataScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Data" />,
          },
        },
        BuyGiftCard: {
          screen: withTierGate("gift_cards", BrandsScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Gift Card" />,
          },
        },
        PhoneNumberVerification: {
          screen: PhoneNumberVerificationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Verify Phone Number" />
            ),
          },
        },
        BVNOwnershipConfirmation: {
          screen: BVNOwnershipConfirmationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Confirm BVN Ownership" />
            ),
          },
        },
        BrandDetail: {
          screen: withTierGate("gift_cards", BrandDetailScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Brand Detail" />,
          },
        },
        PendingGiftCard: {
          screen: PendingGiftCardScreen,
          options: { headerShown: false },
        },
        BuyAirtime: {
          screen: withTierGate("bill_payments", BuyAirtimeScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Airtime" />,
          },
        },
        EditProfile: {
          screen: EditProfileScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Edit Profile" />,
          },
        },
        Verification: {
          screen: KYCVerificationScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="KYC Verification" />,
          },
        },
        AccountSecurity: {
          screen: AccountSecurityScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Account Security" />,
          },
        },
        Suggestion: {
          screen: SuggestionScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Suggestion Box" />,
          },
        },
        NotificationSettings: {
          screen: NotificationSettingsScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Notification Settings" />
            ),
          },
        },
        FundBettingAccount: {
          screen: withTierGate("bill_payments", FundBettingAccountScreen),
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Fund Betting Account" />
            ),
          },
        },
        AccountLimit: {
          screen: AccountLimitsScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Account Limits" />,
          },
        },
        RateMarket: {
          screen: RateMarketScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Market Rates" />,
          },
        },
        ChangePassword: {
          screen: ChangePasswordScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Change Password" />,
          },
        },
        ChangeEmail: {
          screen: ChangeEmailScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Update Email" />,
          },
        },
        ChangePhoneNumber: {
          screen: ChangePhoneNumberScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Update Phone Number" />
            ),
          },
        },
        ChangeTransactionPin: {
          screen: ChangeTransactionPinScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Change Transaction Pin" />
            ),
          },
        },
        DeleteAccount: {
          screen: DeleteAccountScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Delete Account" />,
          },
        },
        Legal: {
          screen: LegalScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Legal & Privacy" />,
          },
        },
        Deposit: {
          screen: withTierGate("deposit_fiat", BankTransferScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Deposit" />,
          },
        },
        BVNVerification: {
          screen: BVNVerificationScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="BVN Verification" />,
          },
        },
        IdentityVerification: {
          screen: IdentityVerificationScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Proof of Identity" />,
          },
        },
        TwoFactorAuthentication: {
          screen: TwoFactorAuthenticationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Two-Factor Authentication" />
            ),
          },
        },
        ConfirmTwoFactorAuthentication: {
          screen: ConfirmTwoFactorAuthenticationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Two-Factor Authentication" />
            ),
          },
        },
        ContactUs: {
          screen: HelpSupportScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Help & Support" />,
          },
        },
        ReferralHistory: {
          screen: ReferralHistoryScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Referral History" />,
          },
        },
        ReferAndEarn: {
          screen: ReferAndEarnScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Referral" />,
          },
        },
        Authenticator: {
          screen: ChangePasswordScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Authenticator Setup" />
            ),
          },
        },
        SelectAsset: {
          screen: CryptoWalletScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Select Asset" />,
          },
        },
        PendingSwap: {
          screen: PendingSwapScreen,
          options: { headerShown: false },
        },
        CryptoWalletDeposit: {
          screen: CryptoWalletDepositScreen,
          options: ({ route }: any) => ({
            headerShown: true,
            header: () => (
              <CustomHeader
                showTitle
                title={route.params?.title ?? "Wallet Detail"}
              />
            ),
          }),
        },
        BuyCrypto: {
          screen: withTierGate("buy_crypto", CryptoBuyScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Crypto" />,
          },
        },
        SellCrypto: {
          screen: withTierGate("sell_crypto", CryptoSellScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Sell Crypto" />,
          },
        },
        SwapCrypto: {
          screen: withTierGate("swap_crypto", CryptoSwapScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Swap Crypto" />,
          },
        },
        Transfer: {
          screen: withTierGate("transfer", TransferScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Transfer" />,
          },
        },
        SelfieVerification: {
          screen: SelfieVerificationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Selfie Verification" />
            ),
          },
        },
        SelfieConfirmation: {
          screen: SelfieConfirmationScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Selfie Confirmation" />
            ),
          },
        },
        WithdrawalCrypto: {
          screen: withTierGate("withdraw_crypto", SendScreen),
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Withdraw Crypto" />,
          },
        },
        Notifications: {
          screen: NotificationsScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle title="Notifications" />,
          },
        },
        WebView: {
          screen: WebViewScreen,
          options: {
            headerBackTitle: ".",
            header: () => <CustomHeader showTitle={false} />,
          },
        },
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function NavigationRoot() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await Promise.all([
        refreshBiometricState(),
        useBiometricPromptStore.getState().hydrate(),
      ]);
      if (!cancelled) setBooted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!booted) return <SplashScreen />;

  return (
    <LiveChatProvider>
      <Navigation />
    </LiveChatProvider>
  );
}
