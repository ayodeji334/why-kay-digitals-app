import Toast from "react-native-root-toast";
import { ToastType, useCustomToast } from "../hooks/useToast";
import { getFontFamily, normalize } from "../constants/settings";

export const useToastHelpers = () => {
  const showToast = useCustomToast();

  const showSuccess = (message: string) => {
    showToast({ type: ToastType.SUCCESS, message });
  };

  const showError = (message: string) => {
    showToast({ type: ToastType.ERROR, message });
  };

  return { showSuccess, showError };
};

const baseToastOptions = {
  duration: 4000,
  position: Toast.positions.TOP,
  shadow: false,
  animation: true,
  hideOnPress: true,
  delay: 500,
  opacity: 1,
  textColor: "white",
  containerStyle: {
    flex: 1,
    width: "90%",
    minWidth: "90%",
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 40,
    justifyContent: "center",
  },
  supportStyle: {
    flex: 1,
    width: "100%",
    minWidth: "100%",
    alignSelf: "stretch",
  },
  textStyle: {
    fontSize: normalize(20),
    textAlign: "left",
    flexWrap: "wrap",
    fontFamily: getFontFamily("700"),
  },
} as const;

export const showToast = (message: string, type: ToastType) => {
  Toast.show(message, {
    ...baseToastOptions,
    backgroundColor: type === ToastType.ERROR ? "#D41111" : "green",
  });
};

export const showError = (message: string) =>
  showToast(message, ToastType.ERROR);

export const showSuccess = (message: string) =>
  showToast(message, ToastType.SUCCESS);
