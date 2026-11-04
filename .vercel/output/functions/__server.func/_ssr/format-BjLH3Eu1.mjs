//#region node_modules/.nitro/vite/services/ssr/assets/format-BjLH3Eu1.js
var CATEGORIES = [
	"Necklaces",
	"Earrings",
	"Rings",
	"Bangles",
	"Bracelets",
	"Anklets",
	"Bridal Jewellery",
	"Handcrafted Designs"
];
var TOLA_GRAMS = 11.6638;
function inr(n) {
	if (!Number.isFinite(n) || n <= 0) return "—";
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0
	}).format(n);
}
function formatUpdated(iso) {
	if (!iso) return "not set";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "not set";
	return new Intl.DateTimeFormat("en-IN", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}).format(d);
}
//#endregion
export { inr as i, TOLA_GRAMS as n, formatUpdated as r, CATEGORIES as t };
