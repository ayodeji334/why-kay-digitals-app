import {
  getAllCountries,
  Country,
  FlagType,
  TranslationLanguageCodeMap,
} from "react-native-country-picker-modal";

let cache: Country[] | null = null;
let inflight: Promise<Country[]> | null = null;

/**
 * Loads the country list once per app session. Concurrent callers share
 * one in-flight promise, so mounting three phone fields at once still
 * makes a single call.
 */
export const loadCountries = (): Promise<Country[]> => {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = getAllCountries(FlagType.FLAT)
    .then(list => {
      cache = list;
      return list;
    })
    .catch(err => {
      inflight = null; // let a later mount retry
      throw err;
    });

  return inflight;
};

export const getCachedCountries = (): Country[] | null => cache;

export const getCountryName = (country: Country): string => {
  if (typeof country.name === "string") return country.name;
  const nameMap = country.name as TranslationLanguageCodeMap;
  return (
    (nameMap.common as string) || Object.values(nameMap)[0] || country.cca2
  );
};
