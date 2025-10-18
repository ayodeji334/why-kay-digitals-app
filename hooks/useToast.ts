import { useEffect, useState, useCallback } from "react";
import Toast from "react-native-root-toast";

export enum ToastType {
  ERROR = "error",
  SUCCESS = "success",
}

interface ToastProps {
  type: ToastType;
  message: string;
  position?: number;
}

export function useCustomToast() {
  const [messages, setMessages] = useState<ToastProps[]>([]);

  const baseToastOptions = {
    duration: 3000,
    opacity: 1,
    textColor: "white",
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 100,
    containerStyle: {
      width: "92%",
      padding: 20,
      borderRadius: 15,
      zIndex: 20000,
      marginBottom: 10,
    },
    textStyle: {
      fontFamily: "Poppins-SemiBold",
      fontSize: 13,
      textAlign: "left",
    },
  } as const;

  const renderToast = (props: ToastProps, index = 0) => {
    Toast.show(props.message, {
      ...baseToastOptions,
      position: (props.position ?? 10) + index * 80,
      backgroundColor: props.type === ToastType.ERROR ? "#D41111" : "green",
    });
  };

  const showToast = useCallback((props: ToastProps | ToastProps[]) => {
    if (Array.isArray(props)) {
      setMessages(props);
    } else {
      renderToast(props);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    const showSequentially = (index: number) => {
      if (index < messages.length) {
        renderToast(messages[index], index);
        setTimeout(() => showSequentially(index + 1), 200);
      }
    };

    showSequentially(0);
  }, [messages]);

  return showToast;
}
