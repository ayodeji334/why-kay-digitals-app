// import * as React from "react";
// import { createStaticNavigation } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import WelcomeScreen from "../screens/WelcomeScreen";
// import IntroModalScreen from "../screens/IntroModalScreen";
// import LoginScreen from "../screens/LoginScreen";
// import CustomHeader from "../components/CustomHeader";
// import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
// import VerificationCodeScreen from "../screens/VerificationCode";
// import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";
// import RegisterScreen from "../screens/RegisterScreen";
// import CreateSecurityPinScreen from "../screens/CreateSecurityPinScreen";
// import ConfirmSecurityPinScreen from "../screens/ConfirmSecurityPinScreen";
// import AppTabs from "./AppTabs";
// import ProfileScreen from "../screens/ProfileScreen";
// import EditProfileScreen from "../screens/EditProfileScreen";
// import KYCVerificationScreen from "../screens/KYCVerificationScreen";
// import AccountSecurityScreen from "../screens/AccountSecurityScreen";
// import ChangePasswordScreen from "../screens/ChangePassword";
// import ChangeTransactionPinScreen from "../screens/ChangeTransactionPin";
// import DeleteAccountScreen from "../screens/DeleteAccountScreen";
// import LegalScreen from "../screens/LegalScreen";
// import WebViewScreen from "../screens/WebViewScreen";
// import HelpSupportScreen from "../screens/ContactUsScreen";
// import ReferAndEarnScreen from "../screens/ReferAndEarnScreen";
// import ReferralHistoryScreen from "../screens/ReferralHistoryScreen";
// import BiometricsScreen from "../screens/EnableBiometricScreen";
// import { useAuthStore, useIsAuthenticated } from "../stores/authSlice";
// import BankTransferScreen from "../screens/BankTransfer";
// import BVNVerificationScreen from "../screens/BVNVerificationScreen";
// import IdentityVerificationScreen from "../screens/IdentityVerificationScreen";
// import TwoFactorAuthenticationScreen from "../screens/TwoFactorAuthenticationScreen";
// import ConfirmTwoFactorAuthenticationScreen from "../screens/ConfirmTwoFactorAuthentication";
// import AccountLimitsScreen from "../screens/AccountLimitScreen";
// import BuyDataScreen from "../screens/BuyDataScreen";
// import TransactionDetailScreen from "../screens/TransactionDetail";
// import ConfirmTransactionScreen from "../screens/ConfirmTransactionScreen";
// import BuyAirtimeScreen from "../screens/BuyAirtimeScreen";
// import PayCableTVSubscriptionScreen from "../screens/PayCableTVSubscriptionScreen";
// import PayElectricityBillsScreen from "../screens/PayElectricityBills";
// import WithdrawScreen from "../screens/WithdrawalScreen";
// import CryptoWalletScreen from "../screens/CryptoScreen";
// import CryptoWalletDepositScreen from "../screens/CryptoWalletDepositScreen";
// import CryptoBuyScreen from "../screens/BuyCryptoScreen";
// import CryptoSellScreen from "../screens/SellCrytpoScreen";
// import CryptoSwapScreen from "../screens/SwapCryptoScreen";
// import ReturningUserLoginScreen from "../screens/ReturningUserLoginScreen";
// import TransferScreen from "../screens/TransferScreen";
// import SelfieVerificationScreen from "../screens/SelfieVerificationScreen";
// import SelfieConfirmationScreen from "../screens/SelfieConfirmation";
// import SendScreen from "../screens/SendCrypto";
// import ConfirmCryptoWithdrawalScreen from "../screens/ConfirmCryptoWithdrawScreen";
// import NotificationsScreen from "../screens/Notifications";
// import PendingSwapScreen from "../screens/PendingSwapTransactionScreen";
// import ConversionQuote from "../screens/ConversionQuote";
// import NotificationSettingsScreen from "../screens/NotificationSettingsScreen";
// import SuggestionScreen from "../screens/Suggestions";
// import FundBettingAccountScreen from "../screens/FundBettingAccount";
// import GiftCardScreen from "../screens/BuyGiftCardScreen";
// import BuyGiftCardScreen from "../screens/BuyGiftCardScreen";
// import GiftCardVouchersScreen from "../screens/GiftCardVoucherScreen";
// import BrandsScreen from "../screens/BrandScreen";
// import BrandDetailScreen from "../screens/BrandDetailScreen";
// import PendingGiftCardScreen from "../screens/PendingGiftCardTransactionScreen";

// export default function NavigationRoot() {
//   const isAuthenticated = useIsAuthenticated();
//   const username = useAuthStore(state => state.user?.username);
//   const uuid = useAuthStore(state => state.user?.uuid);

//   const RootStack = createNativeStackNavigator({
//     initialRouteName: isAuthenticated
//       ? "Dashboard"
//       : username
//       ? "ReturningLogin"
//       : !!uuid
//       ? "SignIn"
//       : "Intro",
//     screens: {
//       Welcome: {
//         screen: WelcomeScreen,
//         options: {
//           headerShown: false,
//           headerBackTitle: "Go back",
//         },
//       },
//       Intro: {
//         screen: IntroModalScreen,
//         options: {
//           headerShown: false,
//         },
//       },
//       SignIn: {
//         screen: LoginScreen,
//         options: {
//           header: () => <CustomHeader showBack={!username} title="Login" />,
//         },
//       },
//       ReturningLogin: {
//         screen: ReturningUserLoginScreen,
//         options: {
//           header: () => <CustomHeader showBack={!username} title="Login" />,
//         },
//       },
//       SignUp: {
//         screen: RegisterScreen,
//         options: {
//           header: () => <CustomHeader title="Login Screen" />,
//         },
//       },
//       VerifyCode: {
//         screen: VerificationCodeScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => <CustomHeader showTitle={true} title="Verification" />,
//         },
//       },
//       ForgetPassword: {
//         screen: ForgetPasswordScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => <CustomHeader title="Forget Password" />,
//         },
//       },
//       SetNewPassword: {
//         screen: SetNewPasswordScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => <CustomHeader showTitle={true} title="New Password" />,
//         },
//       },
//       CreatePin: {
//         screen: CreateSecurityPinScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => <CustomHeader title="New Password" />,
//         },
//       },
//       ConfirmPin: {
//         screen: ConfirmSecurityPinScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => (
//             <CustomHeader showTitle={true} title="Confirm Security Pin" />
//           ),
//         },
//       },
//       WebView: {
//         screen: WebViewScreen,
//         options: {
//           headerBackTitle: ".",
//           header: () => <CustomHeader showTitle={false} />,
//         },
//       },
//     },
//     groups: {
//       AuthenticatedUser: {
//         if: () => isAuthenticated,
//         screens: {
//           Dashboard: {
//             screen: AppTabs,
//             options: {
//               headerShown: false,
//             },
//           },
//           ConfirmTransaction: {
//             screen: ConfirmTransactionScreen,
//             options: {
//               headerBackTitle: ".",
//               header: () => (
//                 <CustomHeader showTitle={true} title="Confirm Transaction" />
//               ),
//             },
//           },
//           ConfirmCryptoWithdrawTransaction: {
//             screen: ConfirmCryptoWithdrawalScreen,
//             options: {
//               headerBackTitle: ".",
//               header: () => (
//                 <CustomHeader
//                   showTitle={true}
//                   title="Confirm Crypto Withdrawal"
//                 />
//               ),
//             },
//           },
//           Withdrawal: {
//             screen: WithdrawScreen,
//             options: {
//               headerBackTitle: ".",
//               header: () => <CustomHeader showTitle={true} title="Withdraw" />,
//             },
//           },
//           Profile: {
//             screen: ProfileScreen,
//             options: {
//               headerShown: true,
//               header: () => <CustomHeader showTitle={true} title="Profile" />,
//             },
//           },
//           TransactionDetail: {
//             screen: TransactionDetailScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader
//                   showTitle={true}
//                   showBack={false}
//                   title="Transaction Detail"
//                 />
//               ),
//             },
//           },
//           ConversionQuote: {
//             screen: ConversionQuote,
//             options: {
//               gestureEnabled: true,
//               headerShown: true,
//               header: () => (
//                 <CustomHeader
//                   showTitle={true}
//                   showBack={true}
//                   title="Conversion Quote Detail"
//                 />
//               ),
//             },
//           },
//           PayElectricityBills: {
//             screen: PayElectricityBillsScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Pay Electricity Bills" />
//               ),
//             },
//           },
//           PayCableTVSubscription: {
//             screen: PayCableTVSubscriptionScreen,
//             options: {
//               header: () => (
//                 <CustomHeader showTitle={true} title="Pay Cable TV Bills" />
//               ),
//             },
//           },
//           GiftCardVouchers: {
//             screen: GiftCardVouchersScreen,
//             options: {
//               header: () => (
//                 <CustomHeader showTitle={true} title="Gift Card Vouchers" />
//               ),
//             },
//           },
//           BuyData: {
//             screen: BuyDataScreen,
//             options: {
//               headerShown: true,
//               header: () => <CustomHeader showTitle={true} title="Buy Data" />,
//             },
//           },
//           BuyGiftCard: {
//             screen: BrandsScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Buy GiftCard" />
//               ),
//             },
//           },
//           BrandDetail: {
//             screen: BrandDetailScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Brand  Detail" />
//               ),
//             },
//           },
//           BuyAirtime: {
//             screen: BuyAirtimeScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Buy Airtime" />
//               ),
//             },
//           },
//           EditProfile: {
//             screen: EditProfileScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Edit Profile" />
//               ),
//             },
//           },
//           Verification: {
//             screen: KYCVerificationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="KYC Verification" />
//               ),
//             },
//           },
//           AccountSecurity: {
//             screen: AccountSecurityScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Account Security" />
//               ),
//             },
//           },
//           Suggestion: {
//             screen: SuggestionScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Suggestion Box" />
//               ),
//             },
//           },
//           NotificationSettings: {
//             screen: NotificationSettingsScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Notification Settings" />
//               ),
//             },
//           },
//           FundBettingAccount: {
//             screen: FundBettingAccountScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Fund Betting Account" />
//               ),
//             },
//           },
//           AccountLimit: {
//             screen: AccountLimitsScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Account Limits" />
//               ),
//             },
//           },
//           ChangePassword: {
//             screen: ChangePasswordScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Change Password" />
//               ),
//             },
//           },
//           ChangeTransactionPin: {
//             screen: ChangeTransactionPinScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Change Transaction Pin" />
//               ),
//             },
//           },
//           DeleteAccount: {
//             screen: DeleteAccountScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Delete Account" />
//               ),
//             },
//           },
//           Legal: {
//             screen: LegalScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Legal & Privacy" />
//               ),
//             },
//           },
//           Deposit: {
//             screen: BankTransferScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Deposit Fiat" />
//               ),
//             },
//           },
//           BVNVerification: {
//             screen: BVNVerificationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="BVN Verification" />
//               ),
//             },
//           },
//           IdentityVerification: {
//             screen: IdentityVerificationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Proof of Identity" />
//               ),
//             },
//           },
//           TwoFactorAuthentication: {
//             screen: TwoFactorAuthenticationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader
//                   showTitle={true}
//                   title="Two-Factor Authentication"
//                 />
//               ),
//             },
//           },
//           ConfirmTwoFactorAuthentication: {
//             screen: ConfirmTwoFactorAuthenticationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader
//                   showTitle={true}
//                   title="Two-Factor Authentication"
//                 />
//               ),
//             },
//           },
//           // BankTransfer: {
//           //   screen: BankTransferScreen,
//           //   options: {
//           //     headerShown: true,
//           //     header: () => (
//           //       <CustomHeader showTitle={true} title="Deposit Fiat" />
//           //     ),
//           //   },
//           // },
//           ContactUs: {
//             screen: HelpSupportScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Help & Support" />
//               ),
//             },
//           },
//           ReferralHistory: {
//             screen: ReferralHistoryScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Referral History" />
//               ),
//             },
//           },
//           ReferAndEarn: {
//             screen: ReferAndEarnScreen,
//             options: {
//               headerShown: true,
//               header: () => <CustomHeader showTitle={true} title="Referral" />,
//             },
//           },
//           BiometricSettings: {
//             screen: BiometricsScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Biometric Settings" />
//               ),
//             },
//           },
//           Authenticator: {
//             screen: ChangePasswordScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Authentictor Setup" />
//               ),
//             },
//           },
//           SelectAsset: {
//             screen: CryptoWalletScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Select Asset" />
//               ),
//             },
//           },
//           PendingSwap: {
//             screen: PendingSwapScreen,
//             options: {
//               headerShown: false,
//               header: () => <CustomHeader showTitle={true} title="" />,
//             },
//           },
//           PendingGiftCard: {
//             screen: PendingGiftCardScreen,
//             options: {
//               headerShown: false,
//               header: () => <CustomHeader showTitle={true} title="" />,
//             },
//           },
//           CryptoWalletDeposit: {
//             screen: CryptoWalletDepositScreen,
//             options: ({ route }: any) => ({
//               headerShown: true,
//               header: () => (
//                 <CustomHeader
//                   showTitle
//                   title={route.params?.title ?? "Wallet Detail"}
//                 />
//               ),
//             }),
//           },
//           BuyCrypto: {
//             screen: CryptoBuyScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Buy Crypto" />
//               ),
//             },
//           },
//           SellCrypto: {
//             screen: CryptoSellScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Sell Crypto" />
//               ),
//             },
//           },
//           SwapCrypto: {
//             screen: CryptoSwapScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Swap Crypto" />
//               ),
//             },
//           },
//           Transfer: {
//             screen: TransferScreen,
//             options: {
//               headerShown: true,
//               header: () => <CustomHeader showTitle={true} title="Transfer" />,
//             },
//           },
//           SelfieVerification: {
//             screen: SelfieVerificationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Selfie Verification" />
//               ),
//             },
//           },
//           SelfieConfirmation: {
//             screen: SelfieConfirmationScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Selfie Confirmation" />
//               ),
//             },
//           },
//           WithdrawalCrypto: {
//             screen: SendScreen,
//             options: {
//               headerShown: true,
//               header: () => (
//                 <CustomHeader showTitle={true} title="Withdraw Crypto" />
//               ),
//             },
//           },
//           Notifications: {
//             screen: NotificationsScreen,
//             options: {
//               headerBackTitle: ".",
//               header: () => (
//                 <CustomHeader showTitle={true} title="Notifications" />
//               ),
//             },
//           },
//         },
//       },
//     },
//   });

//   const Navigation = createStaticNavigation(RootStack);

//   return <Navigation />;
// }
import * as React from "react";
import { useEffect, useState } from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomHeader from "../components/CustomHeader";
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
          options: { header: () => <CustomHeader title="Sign Up" showChat /> },
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
            header: () => <CustomHeader showTitle={false} title="" />,
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
          screen: ConversionQuote,
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
          screen: PayElectricityBillsScreen,
          options: {
            headerShown: true,
            header: () => (
              <CustomHeader showTitle title="Pay Electricity Bills" />
            ),
          },
        },
        PayCableTVSubscription: {
          screen: PayCableTVSubscriptionScreen,
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
          screen: BuyDataScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Data" />,
          },
        },
        BuyGiftCard: {
          screen: BrandsScreen,
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
          screen: BrandDetailScreen,
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
          screen: BuyAirtimeScreen,
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
          screen: FundBettingAccountScreen,
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
        ChangePassword: {
          screen: ChangePasswordScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Change Password" />,
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
          screen: BankTransferScreen,
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
          screen: CryptoBuyScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Buy Crypto" />,
          },
        },
        SellCrypto: {
          screen: CryptoSellScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Sell Crypto" />,
          },
        },
        SwapCrypto: {
          screen: CryptoSwapScreen,
          options: {
            headerShown: true,
            header: () => <CustomHeader showTitle title="Swap Crypto" />,
          },
        },
        Transfer: {
          screen: TransferScreen,
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
          screen: SendScreen,
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
