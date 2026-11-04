import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as inr, n as TOLA_GRAMS, r as formatUpdated, t as CATEGORIES } from "./format-BjLH3Eu1.mjs";
import { a as ChevronRight, i as MapPin, o as ChevronLeft, r as Menu, t as X } from "../_libs/lucide-react.mjs";
import { n as Route$3 } from "./router-fCwvVpgH.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BljHmtkE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Reveal({ children, className }) {
	const ref = (0, import_react.useRef)(null);
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) setOn(true);
		}, { threshold: .12 });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: cn("reveal", on && "in", className),
		children
	});
}
function FeaturedStrip({ items, onOpen }) {
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "featured",
		className: "py-16 md:py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
				className: "mb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-section leading-tight",
					children: "Featured handcrafted designs"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gallery-masonry",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onOpen(item),
					className: "jewel-card group",
					children: [item.images[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.images[0],
						alt: item.name,
						className: "block w-full",
						loading: "lazy"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid min-h-48 place-items-center bg-panel-2 font-display tracking-label text-gold-light",
						children: "GOBINDA"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute inset-0 flex flex-col justify-end bg-linear-to-t from-ink via-ink/40 to-transparent p-3.5 md:p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[0.65rem] tracking-label text-gold lowercase",
							children: [
								item.metal === "gold" ? "Gold" : "Silver",
								" · ",
								item.cat
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-base text-ivory md:text-lg",
							children: item.name
						})]
					})]
				}, item.id))
			})]
		})
	});
}
function Gallery({ items, onOpen }) {
	const [metal, setMetal] = (0, import_react.useState)("all");
	const [cat, setCat] = (0, import_react.useState)("All");
	const visible = (0, import_react.useMemo)(() => items.filter((it) => {
		if (metal !== "all" && it.metal !== metal) return false;
		if (cat !== "All" && it.cat !== cat) return false;
		return true;
	}), [
		items,
		metal,
		cat
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "gallery",
		className: "py-16 md:py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "mb-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-section leading-tight",
						children: "Jewellery Gallery"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 flex flex-wrap gap-2",
					children: [
						{
							key: "all",
							label: "All metals"
						},
						{
							key: "gold",
							label: "Gold"
						},
						{
							key: "silver",
							label: "Silver"
						}
					].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMetal(opt.key),
						className: cn("chip", metal === opt.key && "is-on"),
						children: opt.label
					}, opt.key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-10 flex flex-wrap gap-2",
					children: ["All", ...CATEGORIES].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCat(name),
						className: cn("chip", cat === name && "is-on"),
						children: name
					}, name))
				}),
				visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gallery-masonry",
					children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onOpen(item),
						className: "jewel-card group",
						children: [item.images[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.images[0],
							alt: item.name,
							className: "block w-full",
							loading: "lazy"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid min-h-64 place-items-center bg-panel-2 font-display tracking-label text-gold-light",
							children: "GOBINDA"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute inset-0 flex flex-col justify-end bg-linear-to-t from-ink via-ink/40 to-transparent p-3.5 md:p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[0.65rem] tracking-label text-gold lowercase",
								children: [
									item.metal === "gold" ? "Gold" : "Silver",
									" · ",
									item.cat
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-base text-ivory md:text-lg",
								children: item.name
							})]
						})]
					}, item.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface px-8 py-16 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label",
						children: "collection"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display mt-3 text-2xl",
						children: "No pieces in this edit"
					})]
				})
			]
		})
	});
}
var STORE_LOCATION = "Praful Chawk, Rehua Simalbari (Baisi Purnea)";
var STORE_REGION = "Bihar, India";
var WHATSAPP_URL = "https://wa.me/916205991901";
var MAPS_URL = "https://maps.app.goo.gl/HBriEzZRGyJQK5jd6";
function HeroCarousel({ images }) {
	const slides = images.length ? images : ["/images/hero-1.jpg"];
	const [index, setIndex] = (0, import_react.useState)(0);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const touchX = (0, import_react.useRef)(null);
	const go = (0, import_react.useCallback)((dir) => {
		setIndex((i) => (i + dir + slides.length) % slides.length);
	}, [slides.length]);
	(0, import_react.useEffect)(() => {
		if (paused || slides.length < 2) return;
		if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = window.setInterval(() => go(1), 6400);
		return () => window.clearInterval(id);
	}, [
		go,
		paused,
		slides.length
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "home",
		className: "relative overflow-hidden bg-ink",
		onMouseEnter: () => setPaused(true),
		onMouseLeave: () => setPaused(false),
		onTouchStart: (e) => {
			touchX.current = e.touches[0]?.clientX ?? null;
			setPaused(true);
		},
		onTouchEnd: (e) => {
			const start = touchX.current;
			touchX.current = null;
			setPaused(false);
			if (start == null || slides.length < 2) return;
			const dx = (e.changedTouches[0]?.clientX ?? start) - start;
			if (dx > 48) go(-1);
			else if (dx < -48) go(1);
		},
		"aria-roledescription": "carousel",
		"aria-label": "Store gallery",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hero-frame relative",
			children: [
				slides.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("hero-slide absolute inset-0", i === index && "is-active"),
					"aria-hidden": i !== index,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "",
						className: "h-full w-full object-cover",
						loading: i === 0 ? "eager" : "lazy",
						fetchPriority: i === 0 ? "high" : "low"
					})
				}, src + i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-ink via-ink/45 to-ink/25" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-x-0 bottom-0 z-10 pb-10 pt-32 md:pb-14",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-copy wrap w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label",
							children: "Gobinda Jewellers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-3 max-w-xl text-[1.65rem] leading-tight text-ivory sm:text-4xl md:text-5xl",
							children: STORE_LOCATION
						})]
					})
				}),
				slides.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Previous image",
						onClick: () => go(-1),
						className: "absolute top-1/2 left-3 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/55 text-ivory backdrop-blur-sm md:grid",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next image",
						onClick: () => go(1),
						className: "absolute top-1/2 right-3 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/55 text-ivory backdrop-blur-sm md:grid",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2",
						children: slides.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Show image ${i + 1}`,
							"aria-current": i === index,
							onClick: () => setIndex(i),
							className: cn("h-1.5 rounded-full transition-all duration-500 ease-out", i === index ? "w-8 bg-gold" : "w-2.5 bg-ivory/30")
						}, i))
					})
				] }) : null
			]
		})
	});
}
function Lightbox({ item, index, onIndex, onClose }) {
	const images = item.images.length ? item.images : [];
	const src = images[index] ?? "";
	(0, import_react.useEffect)(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft" && images.length > 1) onIndex((index - 1 + images.length) % images.length);
			if (e.key === "ArrowRight" && images.length > 1) onIndex((index + 1) % images.length);
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [
		images.length,
		index,
		onClose,
		onIndex
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lightbox-scrim fixed inset-0 z-overlay flex items-center justify-center bg-ink/95 p-5",
		onClick: onClose,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": item.name,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Close",
				onClick: onClose,
				className: "absolute top-5 right-5 grid size-11 place-items-center text-ivory",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-7" })
			}),
			images.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Previous photo",
				className: "absolute top-1/2 left-3 z-10 grid h-16 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory",
				onClick: (e) => {
					e.stopPropagation();
					onIndex((index - 1 + images.length) % images.length);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-7" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Next photo",
				className: "absolute top-1/2 right-3 z-10 grid h-16 w-11 -translate-y-1/2 place-items-center rounded-full border border-hair bg-ink/70 text-ivory",
				onClick: (e) => {
					e.stopPropagation();
					onIndex((index + 1) % images.length);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-7" })
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-2xl text-center",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "surface overflow-hidden",
						children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src,
							alt: item.name,
							className: "mx-auto max-h-[70vh] w-full object-contain"
						}) : null
					}),
					images.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-[0.68rem] tracking-label text-gold",
						children: [
							index + 1,
							" / ",
							images.length
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display mt-4 text-2xl",
						children: item.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs tracking-wide text-ivory-dim",
						children: [
							item.metal === "gold" ? "Gold" : "Silver",
							" · ",
							item.cat
						]
					}),
					item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ivory-dim",
						children: item.description
					}) : null
				]
			})
		]
	});
}
function WhatsAppGlyph({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		className,
		fill: "currentColor",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.55 2 2.08 6.46 2.08 11.96c0 1.75.46 3.45 1.33 4.95L2 22l5.23-1.37a9.9 9.9 0 0 0 4.81 1.23h.01c5.49 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.96-7zM12.05 20.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.18 8.18 0 0 1-1.26-4.34c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.85 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.68 8.2-8.19 8.2zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.24 3.74 1.49.64 1.86.7 2.53.59.41-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.14-1.17-.06-.11-.23-.17-.48-.29z" })
	});
}
function WhatsAppButton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: WHATSAPP_URL,
		target: "_blank",
		rel: "noopener noreferrer",
		className: cn("btn btn-gold", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppGlyph, { className: "size-4" }), "WhatsApp me"]
	});
}
function WhatsAppFab() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: WHATSAPP_URL,
		target: "_blank",
		rel: "noopener noreferrer",
		"aria-label": "WhatsApp me",
		className: "fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgb(0_0_0_/_45%)] transition-transform duration-300 ease-out hover:scale-105 md:right-6 md:bottom-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppGlyph, { className: "size-7" })
	});
}
function ProfileSection({ settings }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "atelier",
		className: "border-y border-hair bg-panel py-8 md:py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "wrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
				className: "flex flex-wrap items-center gap-5 md:gap-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: settings.founderImage,
						alt: settings.founderName,
						className: "size-20 shrink-0 rounded-full object-cover ring-1 ring-gold/50 ring-offset-2 ring-offset-ink md:size-24"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label",
								children: "the house"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display mt-1 text-2xl leading-tight text-ivory md:text-3xl",
								children: "The House of Gobinda"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm tracking-wide text-ivory-dim md:text-base",
								children: "3 generations of goldsmiths, uncompromising standard"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, { className: "hidden md:inline-flex" })
				]
			})
		})
	});
}
function RatesBoard({ rates }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "rates",
		className: "border-y border-hair bg-panel py-16 md:py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
				className: "mb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label",
						children: STORE_REGION
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-section mt-3 leading-tight",
						children: "Today's gold & silver"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-prose text-sm leading-relaxed text-ivory-dim",
						children: "Metal rate card — gold 24K per tola, silver per kilogram. Updated from the Gobinda studio."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface overflow-hidden bg-linear-to-br from-panel-2 to-ink",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-hair px-5 py-5 md:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg",
							children: "Gobinda Rate Card"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-ivory-dim",
							children: [
								STORE_REGION,
								" · updated ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "font-medium text-gold-light",
									children: formatUpdated(rates.asOf)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-hair px-5 py-8 md:border-r md:border-b-0 md:px-8 md:py-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm text-ivory-dim",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-2.5 rounded-full bg-gold" }), "Gold 24K"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-4 text-4xl text-gold-light tabular-nums md:text-5xl",
									children: rates.goldPerTola > 0 ? inr(rates.goldPerTola) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs tracking-wide text-ivory-dim",
									children: "per tola"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[0.68rem] text-ivory-dim/70",
									children: [
										"1 tola = ",
										TOLA_GRAMS,
										" g"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-8 md:px-8 md:py-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm text-ivory-dim",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-2.5 rounded-full bg-ivory-dim" }), "Silver"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-4 text-4xl text-gold-light tabular-nums md:text-5xl",
									children: rates.silverPerKg > 0 ? inr(rates.silverPerKg) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs tracking-wide text-ivory-dim",
									children: "per kg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[0.68rem] text-ivory-dim/70",
									children: "1 kg = 1000 g"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-4 text-xs text-ivory-dim md:px-8",
						children: "Rates in Indian Rupees. WhatsApp the house to confirm before you visit."
					})
				]
			}) })]
		})
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "pt-20 pb-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-12 border-b border-hair pb-14 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-brand text-ivory",
						children: "GOBINDA JEWELLERS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-prose text-sm leading-relaxed text-ivory-dim",
						children: "Timeless Beauty. Eternal Trust. Handcrafted gold, silver and bridal jewellery, made the way it has always been made — with care."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "mb-4 text-xs tracking-label text-gold lowercase",
							children: "explore"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#home",
							className: "block text-sm leading-8 text-ivory-dim transition-colors duration-300 hover:text-gold-light",
							children: "Home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#gallery",
							className: "block text-sm leading-8 text-ivory-dim transition-colors duration-300 hover:text-gold-light",
							children: "Jewellery Gallery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#rates",
							className: "block text-sm leading-8 text-ivory-dim transition-colors duration-300 hover:text-gold-light",
							children: "Today's Rates"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "mb-4 text-xs tracking-label text-gold lowercase",
							children: "visit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-8 text-ivory-dim",
							children: STORE_LOCATION
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: MAPS_URL,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "mt-3 inline-flex items-center gap-2 text-sm text-gold transition-colors duration-300 hover:text-gold-light",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								className: "size-4 shrink-0",
								"aria-hidden": "true"
							}), "Open in Google Maps"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {})
						})
					] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 pt-7 text-xs text-ivory-dim",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Gobinda Jewellers. All rights reserved."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin",
					className: "transition-colors duration-300 hover:text-gold",
					children: "Private Studio"
				})]
			})]
		})
	});
}
var NAV = [
	{
		href: "/#home",
		label: "Home"
	},
	{
		href: "/#atelier",
		label: "The House"
	},
	{
		href: "/#gallery",
		label: "Gallery"
	},
	{
		href: "/#rates",
		label: "Today's Rate"
	}
];
function readScrollY() {
	return Math.max(window.scrollY || 0, window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0, document.scrollingElement?.scrollTop || 0);
}
function SiteHeader({ rates, overlay = false }) {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let ticking = false;
		const update = () => {
			ticking = false;
			setScrolled(readScrollY() > 8);
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, {
			passive: true,
			capture: true
		});
		return () => window.removeEventListener("scroll", onScroll, true);
	}, []);
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	const solid = !overlay || scrolled;
	const hideRates = scrolled || open;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("fixed inset-x-0 top-0 z-50 overflow-hidden border-b transition-[padding,background-color,border-color] duration-500 ease-out", "pt-[calc(env(safe-area-inset-top,0px)+var(--hdr-y))]", solid ? "[--hdr-y:0.75rem] border-hair bg-ink/80 pb-3 backdrop-blur-xl" : "[--hdr-y:1.25rem] border-transparent bg-transparent pb-5"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap flex items-center justify-between gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "min-w-0 shrink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display block truncate text-lg tracking-brand text-ivory md:text-xl",
						children: "GOBINDA JEWELLERS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1.5 block truncate text-[0.62rem] tracking-label text-gold lowercase",
						children: "timeless beauty · eternal trust"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-7 lg:flex",
					children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: item.href,
						className: "relative pb-1 text-sm whitespace-nowrap text-ivory-dim transition-colors duration-300 hover:text-ivory after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-[width] after:duration-300 hover:after:w-full",
						children: item.label
					}, item.href))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, { className: "hidden shrink-0 lg:inline-flex" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-11 shrink-0 place-items-center text-ivory lg:hidden",
					"aria-label": open ? "Close menu" : "Open menu",
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-6" })
				})
			]
		}), rates ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid transition-[grid-template-rows,opacity] duration-500 ease-out", hideRates ? "pointer-events-none grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "/#rates",
					id: "header-rates",
					"aria-hidden": hideRates,
					tabIndex: hideRates ? -1 : void 0,
					className: "wrap mt-3 flex flex-col gap-1.5 border-t border-hair pt-2.5 pb-0.5 text-[0.68rem] text-ivory-dim sm:flex-row sm:items-center sm:justify-between sm:gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 tracking-label text-gold lowercase",
						children: [STORE_REGION, " · metal rate"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-3 whitespace-nowrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Gold ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "font-medium text-gold-light",
									children: rates.goldPerTola > 0 ? inr(rates.goldPerTola) : "—"
								}),
								"/tola"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "opacity-30",
								children: "|"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Silver ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "font-medium text-gold-light",
									children: rates.silverPerKg > 0 ? inr(rates.silverPerKg) : "—"
								}),
								"/kg"
							] })
						]
					})]
				})
			})
		}) : null]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("fixed inset-0 z-[60] flex flex-col justify-center gap-7 bg-ink px-8 transition-[transform,opacity] duration-500 ease-out lg:hidden", open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"),
		"aria-hidden": !open,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute top-5 right-5 grid size-11 place-items-center text-ivory",
				"aria-label": "Close menu",
				onClick: () => setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
			}),
			NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: item.href,
				onClick: () => setOpen(false),
				className: "font-display text-3xl text-ivory",
				children: item.label
			}, item.href)),
			rates ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-ivory-dim",
				children: [
					STORE_REGION,
					" · metal rate · Gold ",
					rates.goldPerTola > 0 ? inr(rates.goldPerTola) : "—",
					"/tola · Silver ",
					rates.silverPerKg > 0 ? inr(rates.silverPerKg) : "—",
					"/kg"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {})
		]
	})] });
}
function Home() {
	const { items, rates, settings } = Route$3.useLoaderData();
	const [open, setOpen] = (0, import_react.useState)(null);
	const featured = items.filter((i) => i.featured);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {
			rates,
			overlay: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroCarousel, { images: settings.heroImages }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSection, { settings }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedStrip, {
			items: featured,
			onOpen: (item) => setOpen({
				item,
				index: 0
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gallery, {
			items,
			onOpen: (item) => setOpen({
				item,
				index: 0
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatesBoard, { rates }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppFab, {}),
		open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
			item: open.item,
			index: open.index,
			onIndex: (index) => setOpen({
				item: open.item,
				index
			}),
			onClose: () => setOpen(null)
		}) : null
	] });
}
//#endregion
export { Home as component };
