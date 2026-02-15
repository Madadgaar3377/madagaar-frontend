/**
 * Signup agreements – Terms and Privacy only. Register enabled when both are checked.
 */
export const SIGNUP_DECLARATIONS = [
  {
    section: "A",
    title: "",
    items: [
      "I agree to the Terms & Conditions",
      "I agree to the Privacy Policy & Data Protection Policy",
    ],
  },
];

export const TOTAL_DECLARATIONS = SIGNUP_DECLARATIONS.reduce((acc, s) => acc + s.items.length, 0);

export function getFlatDeclarations() {
  const flat = [];
  SIGNUP_DECLARATIONS.forEach((sec) => {
    sec.items.forEach((label) => flat.push({ section: sec.section, title: sec.title, label }));
  });
  return flat;
}
