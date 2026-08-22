import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export interface ServiceCharge {
  service_key: string;
  label: string;
  description: string | null;
  type: "percentage" | "flat";
  value: string;
  currency: string;
  category: string;
}

export function useServiceCharges() {
  const { apiGet } = useAxios();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["service-charges"],
    queryFn: async () => {
      const res = await apiGet("/service-charges");

      console.log(
        "Service charges response:",
        res?.data?.data?.service_charges,
      );

      return (res?.data?.data?.service_charges ?? []) as ServiceCharge[];
    },
    // Fee schedule doesn't change often — avoid refetching on every screen focus.
  });

  const getCharge = (serviceKey: string): ServiceCharge | undefined =>
    data?.find(c => c.service_key === serviceKey);

  return {
    serviceCharges: data ?? [],
    isLoading,
    refetch,
    getCharge,
  };
}

export function calculateServiceCharge(
  charge: ServiceCharge | undefined,
  amount: number,
  fallbackFlatUsd: number = 1,
): number {
  if (!charge) return fallbackFlatUsd;

  const value = parseFloat(charge.value);
  if (isNaN(value)) return fallbackFlatUsd;

  const fee = charge.type === "percentage" ? amount * (value / 100) : value;

  return fee > 0 ? fee : fallbackFlatUsd;
}
