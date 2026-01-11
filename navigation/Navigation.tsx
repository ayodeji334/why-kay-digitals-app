import * as React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import IntroModalScreen from "../screens/IntroModalScreen";
import LoginScreen from "../screens/LoginScreen";
import CustomHeader from "../components/CustomHeader";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import VerificationCodeScreen from "../screens/VerificationCode";
import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";
import RegisterScreen from "../screens/RegisterScreen";
import CreateSecurityPinScreen from "../screens/CreateSecurityPinScreen";
import ConfirmSecurityPinScreen from "../screens/ConfirmSecurityPinScreen";
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
import BiometricsScreen from "../screens/EnableBiometricScreen";
import { useIsAuthenticated, useUser } from "../stores/authSlice";
import DepositScreen from "../screens/DepositScreen";
import BankTransferScreen from "../screens/BankTransfer";
import BVNVerificationScreen from "../screens/BVNVerificationScreen";
import IdentityVerificationScreen from "../screens/IdentityVerificationScreen";
import TwoFactorAuthenticationScreen from "../screens/TwoFactorAuthenticationScreen";
import ConfirmTwoFactorAuthenticationScreen from "../screens/ConfirmTwoFactorAuthentication";
import AccountLimitsScreen from "../screens/AccountLimitScreen";
import BuyDataScreen from "../screens/BuyDataScreen";
import TransactionDetailScreen from "../screens/TransactonDetail";
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

export default function NavigationRoot() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const RootStack = createNativeStackNavigator({
    initialRouteName: isAuthenticated
      ? "Dashboard"
      : !!user
      ? "SignIn"
      : "Intro",
    screens: {
      Welcome: {
        screen: WelcomeScreen,
        options: {
          headerShown: false,
          headerBackTitle: "Go back",
        },
      },
      Intro: {
        screen: IntroModalScreen,
        options: {
          headerShown: false,
        },
      },
      SignIn: {
        screen: LoginScreen,
        options: {
          header: () => <CustomHeader showBack={!user} title="Login" />,
        },
      },
      SignUp: {
        screen: RegisterScreen,
        options: {
          header: () => <CustomHeader title="Login Screen" />,
        },
      },
      VerifyCode: {
        screen: VerificationCodeScreen,
        options: {
          headerBackTitle: ".",
          header: () => <CustomHeader showTitle={true} title="Verification" />,
        },
      },
      ForgetPassword: {
        screen: ForgetPasswordScreen,
        options: {
          headerBackTitle: ".",
          header: () => <CustomHeader title="Forget Password" />,
        },
      },
      SetNewPassword: {
        screen: SetNewPasswordScreen,
        options: {
          headerBackTitle: ".",
          header: () => <CustomHeader showTitle={true} title="New Password" />,
        },
      },
      CreatePin: {
        screen: CreateSecurityPinScreen,
        options: {
          headerBackTitle: ".",
          header: () => <CustomHeader title="New Password" />,
        },
      },
      ConfirmPin: {
        screen: ConfirmSecurityPinScreen,
        options: {
          headerBackTitle: ".",
          header: () => (
            <CustomHeader showTitle={true} title="Confirm Security Pin" />
          ),
        },
        screenOptions: {
          presentation: "modal",
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
    groups: {
      AuthenticatedUser: {
        if: () => isAuthenticated,
        screens: {
          Dashboard: {
            screen: AppTabs,
            options: {
              headerShown: false,
            },
          },
          ConfirmTransaction: {
            screen: ConfirmTransactionScreen,
            options: {
              headerBackTitle: ".",
              header: () => (
                <CustomHeader showTitle={true} title="Confirm Transaction" />
              ),
            },
          },
          Withdrawal: {
            screen: WithdrawScreen,
            options: {
              headerBackTitle: ".",
              header: () => <CustomHeader showTitle={true} title="Withdraw" />,
            },
          },
          Profile: {
            screen: ProfileScreen,
            options: {
              headerShown: true,
              header: () => <CustomHeader showTitle={true} title="Profile" />,
            },
          },
          TransactionDetail: {
            screen: TransactionDetailScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader
                  showTitle={true}
                  showBack={false}
                  title="Transaction Detail"
                />
              ),
            },
          },
          PayElectricityBills: {
            screen: PayElectricityBillsScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Pay Electricity Bills" />
              ),
            },
          },
          PayCableTVSubscription: {
            screen: PayCableTVSubscriptionScreen,
            options: {
              header: () => (
                <CustomHeader showTitle={true} title="Pay Cable TV Bills" />
              ),
            },
          },
          BuyData: {
            screen: BuyDataScreen,
            options: {
              headerShown: true,
              header: () => <CustomHeader showTitle={true} title="Buy Data" />,
            },
          },
          BuyAirtime: {
            screen: BuyAirtimeScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Buy Airtime" />
              ),
            },
          },
          EditProfile: {
            screen: EditProfileScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Edit Profile" />
              ),
            },
          },
          Verification: {
            screen: KYCVerificationScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="KYC Verification" />
              ),
            },
          },
          AccountSecurity: {
            screen: AccountSecurityScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Account Security" />
              ),
            },
          },
          AccountLimit: {
            screen: AccountLimitsScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Account Limits" />
              ),
            },
          },
          ChangePassword: {
            screen: ChangePasswordScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Change Password" />
              ),
            },
          },
          ChangeTransactionPin: {
            screen: ChangeTransactionPinScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Change Transaction Pin" />
              ),
            },
          },
          DeleteAccount: {
            screen: DeleteAccountScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Delete Account" />
              ),
            },
          },
          Legal: {
            screen: LegalScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Legal & Privacy" />
              ),
            },
          },
          Deposit: {
            screen: DepositScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Deposit Fiat" />
              ),
            },
          },
          BVNVerification: {
            screen: BVNVerificationScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="BVN Verification" />
              ),
            },
          },
          IdentityVerification: {
            screen: IdentityVerificationScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Proof of Identity" />
              ),
            },
          },
          TwoFactorAuthentication: {
            screen: TwoFactorAuthenticationScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader
                  showTitle={true}
                  title="Two-Factor Authentication"
                />
              ),
            },
          },
          ConfirmTwoFactorAuthentication: {
            screen: ConfirmTwoFactorAuthenticationScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader
                  showTitle={true}
                  title="Two-Factor Authentication"
                />
              ),
            },
          },
          BankTransfer: {
            screen: BankTransferScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Deposit Fiat" />
              ),
            },
          },
          ContactUs: {
            screen: HelpSupportScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Help & Support" />
              ),
            },
          },
          ReferralHistory: {
            screen: ReferralHistoryScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Referral History" />
              ),
            },
          },
          ReferAndEarn: {
            screen: ReferAndEarnScreen,
            options: {
              headerShown: true,
              header: () => <CustomHeader showTitle={true} title="Referral" />,
            },
          },
          BiometricSettings: {
            screen: BiometricsScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Biometric Settings" />
              ),
            },
          },
          Authenticator: {
            screen: ChangePasswordScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Authentictor Setup" />
              ),
            },
          },
          SelectAsset: {
            screen: CryptoWalletScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Select Wallet" />
              ),
            },
          },
          CryptoWalletDeposit: {
            screen: CryptoWalletDepositScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Receive Crypto" />
              ),
            },
          },
          BuyCrypto: {
            screen: CryptoBuyScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Buy Crypto" />
              ),
            },
          },
          SellCrypto: {
            screen: CryptoSellScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Sell Crypto" />
              ),
            },
          },
          SwapCrypto: {
            screen: CryptoSwapScreen,
            options: {
              headerShown: true,
              header: () => (
                <CustomHeader showTitle={true} title="Swap Crypto" />
              ),
            },
          },
        },
      },
    },
  });

  const Navigation = createStaticNavigation(RootStack);

  return <Navigation />;
}
