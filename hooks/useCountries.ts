// hooks/useCountries.ts
import { useQuery } from "@tanstack/react-query";
import {
  getAllCountries,
  FlagType,
  Country,
} from "react-native-country-picker-modal";

export const useCountries = () =>
  useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: () => getAllCountries(FlagType.FLAT),
    staleTime: Infinity, // bundled data, never goes stale
    gcTime: Infinity, // keep it for the whole session
    retry: 2,
  });
