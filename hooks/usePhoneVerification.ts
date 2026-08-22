import { useUser } from "../stores/authSlice";

export const usePhoneVerification = () => {
  const user = useUser();
  const isPhoneVerified = !!user?.phone_verified_at;
  return { isPhoneVerified };
};
