// Single source of truth for prices. The browser sends product ids only;
// the server looks up prices here, so prices cannot be changed from the client.
export const PRODUCTS = [
  { id: 1, name: "BV Short",         cat: "shorts", price: 299, was: 349, img: "/images/bv-short.jpg",         sizes: ["S","M","L","XL","XXL"], memberEligible: true },
  { id: 2, name: "OG Tee",           cat: "tshirt", price: 399, was: 449, img: "/images/og-tee.jpg",           sizes: ["S","M","L","XL","XXL"], memberEligible: true },
  { id: 3, name: "Street Guardians", cat: "tshirt", price: 349, was: 399, img: "/images/street-guardians.jpg", sizes: ["S","M","L","XL","XXL"], memberEligible: true },
  { id: 4, name: "Firma Logo",       cat: "tshirt", price: 349, was: 399, img: "/images/firma-logo.jpg",       sizes: ["S","M","L","XL","XXL"], memberEligible: true }
];
export const SHIPPING = { freeOver: 500, fee: 95 };   // rand
export const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const getUnitPriceCents = (product, isMember) =>
  Math.round(product.price * 100 * (isMember && product.memberEligible ? 0.9 : 1));
