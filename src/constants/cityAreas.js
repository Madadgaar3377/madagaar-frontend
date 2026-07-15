/** Common delivery areas per city  fallback to free-text when city is not listed */
const cityAreas = {
  Lahore: [
    'DHA', 'Gulberg', 'Model Town', 'Johar Town', 'Bahria Town', 'Cantt', 'Faisal Town',
    'Garden Town', 'Iqbal Town', 'Township', 'Wapda Town', 'Allama Iqbal Town', 'Other',
  ],
  Karachi: [
    'DHA', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Malir', 'Korangi', 'Saddar',
    'PECHS', 'Bahria Town', 'Scheme 33', 'Landhi', 'Other',
  ],
  Islamabad: [
    'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-9', 'G-10', 'G-11', 'I-8', 'Bahria Town',
    'DHA Phase 1', 'DHA Phase 2', 'Other',
  ],
  Rawalpindi: [
    'Satellite Town', 'Bahria Town', 'Peshawar Road', 'Saddar', 'Chaklala', 'Adyala Road', 'Other',
  ],
  Faisalabad: [
    'D Ground', 'Susan Road', 'Madina Town', 'Peoples Colony', 'Jinnah Colony', 'Other',
  ],
  Multan: ['Cantt', 'Gulgasht', 'Bosan Road', 'Shah Rukn-e-Alam', 'Other'],
  Peshawar: ['University Town', 'Hayatabad', 'Cantt', 'Saddar', 'Other'],
};

export function getAreasForCity(city) {
  if (!city) return [];
  const key = Object.keys(cityAreas).find(
    (k) => k.toLowerCase() === String(city).trim().toLowerCase()
  );
  return key ? cityAreas[key] : [];
}

export default cityAreas;
