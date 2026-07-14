export const ALL_CITIES_LABEL = "All Cities";

const ALL_CITIES_ALIASES = new Set([
  "all cities",
  "all city",
  "all pakistan",
  "pakistan",
  "paksitan",
]);

const isAllCitiesValue = (raw) => {
  const key = String(raw || "").trim().toLowerCase();
  return !key || ALL_CITIES_ALIASES.has(key);
};

export const parseInstallmentCities = (item = {}) => {
  if (Array.isArray(item.cities) && item.cities.length > 0) {
    const cities = item.cities.map((c) => String(c).trim()).filter(Boolean);
    return {
      isAllCities: false,
      cities,
      display: cities.join(", "),
    };
  }

  const raw = String(item.city || "").trim();
  if (!raw || isAllCitiesValue(raw)) {
    return { isAllCities: true, cities: [], display: ALL_CITIES_LABEL };
  }

  if (raw.includes(",")) {
    const cities = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return { isAllCities: false, cities, display: cities.join(", ") };
  }

  return { isAllCities: false, cities: [raw], display: raw };
};

export const formatInstallmentCityDisplay = (item) => parseInstallmentCities(item).display;

export const installmentMatchesCityFilter = (item, filterCity) => {
  const city = String(filterCity || "").trim();
  if (!city) return true;
  const parsed = parseInstallmentCities(item);
  if (parsed.isAllCities) return true;
  const needle = city.toLowerCase();
  return parsed.cities.some((c) => c.toLowerCase() === needle);
};
