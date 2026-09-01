import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import ChatWootWidget from "@chatwoot/react-native-widget";
import { CHATWOOT_INSTALLATION_URL, CHATWOOT_WEBTOKEN } from "../config";
import { useAuthStore } from "../stores/authSlice";
import EmailPromptModal from "../components/EmailPromptModal";

type LiveChatContextValue = {
  openLiveChat: () => void;
};

const LiveChatContext = createContext<LiveChatContextValue | undefined>(
  undefined,
);

export const LiveChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const user = useAuthStore(s => s.user);

  console.log("LiveChatProvider user:", user); // Debugging line

  const [widgetVisible, setWidgetVisible] = useState(false);
  const [emailPromptVisible, setEmailPromptVisible] = useState(false);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  // Authenticated users skip straight to the widget — we already have
  // their email. Guests (e.g. mid-registration) get a lightweight prompt
  // first so responses can still be tracked/routed back to them.
  const openLiveChat = useCallback(() => {
    if (user?.email) {
      setWidgetVisible(true);
    } else {
      setEmailPromptVisible(true);
    }
  }, [user?.email]);

  const handleGuestEmailSubmit = useCallback((email: string) => {
    setGuestEmail(email);
    setEmailPromptVisible(false);
    setWidgetVisible(true);
  }, []);

  const chatUser = useMemo(
    () => ({
      identifier: user?.email ?? guestEmail ?? "",
      name: user?.username ?? "Guest",
      avatar_url: user?.selfie_url ?? "",
      email: user?.email ?? guestEmail ?? "",
      identifier_hash: "",
    }),
    [user, guestEmail],
  );

  const chatCustomAttributes = useMemo(
    () => ({
      accountId: 1,
      pricingPlan: "paid",
      status: "active",
      isGuest: !user?.email,
    }),
    [user?.email],
  );

  return (
    <LiveChatContext.Provider value={{ openLiveChat }}>
      {children}

      <EmailPromptModal
        visible={emailPromptVisible}
        onClose={() => setEmailPromptVisible(false)}
        onSubmit={handleGuestEmailSubmit}
      />

      {widgetVisible && (
        <ChatWootWidget
          websiteToken={CHATWOOT_WEBTOKEN}
          locale="en"
          baseUrl={CHATWOOT_INSTALLATION_URL}
          colorScheme="auto"
          closeModal={() => setWidgetVisible(false)}
          isModalVisible={widgetVisible}
          user={chatUser}
          customAttributes={chatCustomAttributes}
        />
      )}
    </LiveChatContext.Provider>
  );
};

export const useLiveChat = (): LiveChatContextValue => {
  const ctx = useContext(LiveChatContext);

  if (!ctx) {
    throw new Error("useLiveChat must be used within a LiveChatProvider");
  }

  return ctx;
};
