/**
 * Parse User-Agent string to extract Browser, OS, and Device type.
 * @param {string} uaString
 * @returns {Object} - { browser, os, device }
 */
export function parseUA(uaString) {
	if (!uaString) {
		return { browser: "Unknown", os: "Unknown", device: "Desktop" };
	}

	const ua = uaString.toLowerCase();

	// 1. Determine Device Type
	let device = "Desktop";
	if (/tablet|ipad|playbook|silk/i.test(ua)) {
		device = "Tablet";
	} else if (
		/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)
	) {
		device = "Mobile";
	}

	// 2. Determine OS
	let os = "Other";
	if (ua.includes("windows")) {
		os = "Windows";
	} else if (ua.includes("android")) {
		os = "Android";
	} else if (
		ua.includes("iphone") ||
		ua.includes("ipad") ||
		ua.includes("ipod")
	) {
		os = "iOS";
	} else if (ua.includes("macintosh") || ua.includes("mac os x")) {
		os = "macOS";
	} else if (ua.includes("linux")) {
		os = "Linux";
	}

	// 3. Determine Browser
	let browser = "Other";
	if (ua.includes("edg/")) {
		browser = "Edge";
	} else if (ua.includes("opr/") || ua.includes("opera")) {
		browser = "Opera";
	} else if (ua.includes("firefox") || ua.includes("fxios")) {
		browser = "Firefox";
	} else if (ua.includes("chrome") || ua.includes("crios")) {
		browser = "Chrome";
	} else if (ua.includes("safari") && !ua.includes("chrome")) {
		browser = "Safari";
	}

	return { browser, os, device };
}

/**
 * Format Referer to be clean and readable.
 * @param {string} referer
 * @returns {string}
 */
export function formatReferer(referer) {
	if (!referer) return "Direct";
	try {
		const url = new URL(referer);
		return url.hostname || referer;
	} catch (e) {
		return referer;
	}
}
