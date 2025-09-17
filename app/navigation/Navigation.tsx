import * as React from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import IntroModalScreen from "../screens/IntroModalScreen";
import LoginScreen from "../screens/LoginScreen";
import CustomHeader from "../components/CustomHeader";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import VerificationCodeScreen from "../screens/VerificationCode";
import SetNewPasswordScreen from "../screens/SetNewPasswordScreen";
import { useAuth } from "../context/AppContext";
import { getItem } from "../utlis/storage";
import RegisterScreen from "../screens/RegisterScreen";
import CreateSecurityPinScreen from "../screens/CreateSecurityPinScreen";
import ConfirmSecurityPinScreen from "../screens/ConfirmSecurityPinScreen";

export default function NavigationRoot() {
  const { isAuthenticated } = useAuth();
  const user = getItem("user");
  console.log(user);

  const RootStack = createNativeStackNavigator({
    initialRouteName: isAuthenticated ? "Dashboard" : user ? "SignIn" : "Intro",
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
          header: () => <CustomHeader showBack={!user} title="Login Screen" />,
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
          header: () => <CustomHeader title="Verification" />,
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
          header: () => <CustomHeader title="New Password" />,
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
          header: () => <CustomHeader title="New Password" />,
        },
      },
    },
    groups: {
      AuthenticatedUser: {
        if: () => isAuthenticated,
        screens: {
          Dashboard: {
            screen: HomeScreen,
            options: {
              headerShown: false,
            },
          },
        },
      },
    },
  });

  const Navigation = createStaticNavigation(RootStack);

  return <Navigation />;
}
