import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { a as hasGateSessionMarker } from "./server-D82mtEI6.mjs";
import { t as getStudioSession } from "./access-Rf-I0HTf.mjs";
import { n as useCurrentUser, r as useCurrentUserState, t as HouseMark } from "./mark-CCW_OBHE.mjs";
import { r as formatUpdated, t as CATEGORIES } from "./format-BjLH3Eu1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as inviteStudio, c as saveSettings, i as getStorefront, o as saveJewellery, r as deleteJewellery, s as saveMetalRates } from "./router-fCwvVpgH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Bx_U_--x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function AdminGate() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-svh place-items-center text-ivory-dim",
		children: "Loading studio…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStudio, {});
}
function AdminStudio() {
	const [forbidden, setForbidden] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)([]);
	const [rates, setRates] = (0, import_react.useState)({
		goldPerTola: 0,
		silverPerKg: 0,
		asOf: null
	});
	const [settings, setSettings] = (0, import_react.useState)({
		founderName: "Gobinda",
		founderImage: "/images/founder.jpg",
		heroImages: []
	});
	const [invites, setInvites] = (0, import_react.useState)([]);
	const [role, setRole] = (0, import_react.useState)("member");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const [session, store] = await Promise.all([getStudioSession(), getStorefront()]);
				if (cancelled) return;
				setRole(session.role);
				setInvites(session.invites.map((i) => i.email));
				setItems(store.items);
				setRates(store.rates);
				setSettings(store.settings);
				setReady(true);
			} catch (err) {
				if (cancelled) return;
				setForbidden(err instanceof Error ? err.message : "Access denied.");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	if (forbidden) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-svh place-items-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface max-w-md p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Private studio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-ivory-dim",
					children: forbidden
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "btn btn-outline mt-6",
					children: "Back to store"
				})
			]
		})
	});
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-svh place-items-center text-ivory-dim",
		children: "Opening studio…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-svh bg-ink pb-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-hair",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wrap flex flex-wrap items-center justify-between gap-4 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseMark, { className: "size-9 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg tracking-brand",
						children: "Studio"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "wrap mt-10 grid gap-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatesForm, {
					rates,
					onSaved: setRates
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsForm, {
					settings,
					onSaved: setSettings
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JewelleryForm, {
					items,
					onSaved: setItems
				}),
				role === "owner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteForm, {
					invites,
					onSaved: setInvites
				}) : null
			]
		})]
	});
}
function RatesForm({ rates, onSaved }) {
	const [gold, setGold] = (0, import_react.useState)(rates.goldPerTola ? String(rates.goldPerTola) : "");
	const [silver, setSilver] = (0, import_react.useState)(rates.silverPerKg ? String(rates.silverPerKg) : "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			onSaved(await saveMetalRates({ data: {
				goldPerTola: Number(gold) || 0,
				silverPerKg: Number(silver) || 0
			} }));
			toast.success("Rates saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6 md:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Today's rates"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ivory-dim",
				children: "Gold is per tola (11.6638 g). Silver is per kilogram."
			}),
			rates.asOf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-gold-light",
				children: ["Last saved ", formatUpdated(rates.asOf)]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 grid gap-4 md:grid-cols-2",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
						children: ["Gold 24K · per tola (₹)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							inputMode: "numeric",
							value: gold,
							onChange: (e) => setGold(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
						children: ["Silver · per kg (₹)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							inputMode: "numeric",
							value: silver,
							onChange: (e) => setSilver(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-gold md:col-span-2",
						type: "submit",
						disabled: busy,
						children: busy ? "Saving…" : "Save rates"
					})
				]
			})
		]
	});
}
function SettingsForm({ settings, onSaved }) {
	const [name, setName] = (0, import_react.useState)(settings.founderName);
	const [founder, setFounder] = (0, import_react.useState)(settings.founderImage);
	const [heroes, setHeroes] = (0, import_react.useState)(settings.heroImages.join("\n"));
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const heroImages = heroes.split("\n").map((s) => s.trim()).filter(Boolean);
			onSaved(await saveSettings({ data: {
				founderName: name,
				founderImage: founder,
				heroImages
			} }));
			toast.success("House details saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6 md:p-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "House & banner"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6 grid gap-4",
			onSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
					children: ["Founder name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: name,
						onChange: (e) => setName(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
					children: ["Profile image URL", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: founder,
						onChange: (e) => setFounder(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
					children: ["Banner image URLs (one per line)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "field",
						value: heroes,
						onChange: (e) => setHeroes(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePicker, {
					label: "Upload profile photo",
					onFiles: async (urls) => {
						if (urls[0]) setFounder(urls[0]);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePicker, {
					label: "Add banner photos",
					multiple: true,
					onFiles: (urls) => setHeroes((h) => [...h.split("\n").filter(Boolean), ...urls].join("\n"))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-gold",
					type: "submit",
					disabled: busy,
					children: busy ? "Saving…" : "Save house"
				})
			]
		})]
	});
}
function JewelleryForm({ items, onSaved }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [metal, setMetal] = (0, import_react.useState)("gold");
	const [cat, setCat] = (0, import_react.useState)(CATEGORIES[0]);
	const [description, setDescription] = (0, import_react.useState)("");
	const [images, setImages] = (0, import_react.useState)([]);
	const [featured, setFeatured] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	function load(item) {
		setEditing(item);
		setName(item?.name ?? "");
		setMetal(item?.metal ?? "gold");
		setCat(item?.cat ?? CATEGORIES[0]);
		setDescription(item?.description ?? "");
		setImages(item?.images ?? []);
		setFeatured(item?.featured ?? false);
	}
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			onSaved(await saveJewellery({ data: {
				id: editing?.id,
				name,
				metal,
				cat,
				description,
				images,
				featured
			} }));
			load(null);
			toast.success("Piece saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6 md:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Jewellery"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 grid gap-4",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							required: true,
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
							children: ["Metal", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "field",
								value: metal,
								onChange: (e) => setMetal(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "gold",
									children: "Gold"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "silver",
									children: "Silver"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
							children: ["Category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "field",
								value: cat,
								onChange: (e) => setCat(e.target.value),
								children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1.5 text-xs tracking-wide text-ivory-dim",
						children: ["Description", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field",
							value: description,
							onChange: (e) => setDescription(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm text-ivory-dim",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: featured,
							onChange: (e) => setFeatured(e.target.checked)
						}), " Featured"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePicker, {
						label: "Upload jewellery photos",
						multiple: true,
						onFiles: (urls) => setImages((prev) => [...prev, ...urls])
					}),
					images.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: images.map((src) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "relative size-16 overflow-hidden rounded-md border border-hair",
							onClick: () => setImages((p) => p.filter((x) => x !== src)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src,
								alt: "",
								className: "h-full w-full object-cover"
							})
						}, src))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "btn btn-gold",
						type: "submit",
						disabled: busy,
						children: busy ? "Saving…" : editing ? "Update piece" : "Add piece"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-8 divide-y divide-hair",
				children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm",
						children: [
							it.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-ivory-dim",
								children: [
									"· ",
									it.metal,
									" · ",
									it.cat
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline !min-h-9 !px-3",
							onClick: () => load(it),
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn btn-outline !min-h-9 !px-3 text-danger",
							onClick: async () => {
								if (!confirm("Remove this piece?")) return;
								onSaved(await deleteJewellery({ data: { id: it.id } }));
							},
							children: "Delete"
						})]
					})]
				}, it.id))
			})
		]
	});
}
function InviteForm({ invites, onSaved }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await inviteStudio({ data: { email } });
			onSaved([...invites, email.toLowerCase()]);
			setEmail("");
			toast.success("Invite saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not invite");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6 md:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Invite studio users"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-wrap gap-3",
				onSubmit,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field max-w-sm",
					type: "email",
					required: true,
					placeholder: "email@example.com",
					value: email,
					onChange: (e) => setEmail(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn btn-gold",
					type: "submit",
					disabled: busy,
					children: "Invite"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 text-sm text-ivory-dim",
				children: invites.map((em) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: em }, em))
			})
		]
	});
}
function ImagePicker({ label, multiple, onFiles }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "btn btn-outline cursor-pointer",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "file",
			accept: "image/*",
			multiple,
			className: "hidden",
			onChange: async (e) => {
				const files = [...e.target.files ?? []];
				e.target.value = "";
				onFiles((await Promise.all(files.map(compressFile))).filter(Boolean));
			}
		})]
	});
}
function compressFile(file) {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/jpeg", .82));
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve("");
		};
		img.src = url;
	});
}
//#endregion
export { AdminGate as component };
