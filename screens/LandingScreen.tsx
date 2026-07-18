import React, { useEffect } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";
import SplashScreen from "./SplashScreen";

export default function LandingScreen() {
  const navigation = useNavigation<any>();
  const username = useAuthStore(state => state.user?.username);
  const uuid = useAuthStore(state => state.user?.uuid);

  // useEffect(() => {
  //   // Same branching as the old initialRouteName expression.
  //   const target = username ? "ReturningLogin" : uuid ? "SignIn" : "Intro";

  //   // replace, not navigate — Landing must not stay in the back stack,
  //   // or the user can swipe back into a blank routing screen.
  //   navigation.navigate(target);
  // }, [navigation, username, uuid]);

  useEffect(() => {
    const target = username ? "ReturningLogin" : uuid ? "SignIn" : "Intro";

    const timeout = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: target }] }),
      );
    }, 0);

    return () => clearTimeout(timeout);
  }, [navigation, username, uuid]);

  // Visible for one frame at most.
  return <SplashScreen />;
}
