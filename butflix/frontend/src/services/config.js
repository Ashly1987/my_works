function normalizeApiBase(input) {
	if (!input) {
		return "";
	}

	const trimmed = String(input).trim().replace(/\/+$/, "");
	if (!trimmed) {
		return "";
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	if (import.meta.env.DEV && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed)) {
		return `http://${trimmed}`;
	}

	return `https://${trimmed}`;
}

const rawApiBase = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:4000" : "");

export const API_BASE = normalizeApiBase(rawApiBase);
export const PROVIDER_MODE = import.meta.env.VITE_PROVIDER_MODE || "rest";
