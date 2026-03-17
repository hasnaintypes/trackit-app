export const prettyDeviceFromUA = (ua?: string | null): string => {
  if (!ua) return "Unknown device";

  const u = ua.toLowerCase();

  // Mobile checks first
  if (u.includes("iphone")) {
    return "iPhone";
  }
  if (u.includes("ipad")) {
    return "iPad";
  }
  if (u.includes("android")) {
    // Try to surface Android + device if present
    const match = /Android\s+([0-9\.]+)/i.exec(ua);
    return match?.[1] ? `Android ${match[1]}` : "Android device";
  }

  // Desktop OS
  let os = "";
  if (u.includes("windows nt 10.0") || u.includes("windows nt 10"))
    os = "Windows 10";
  else if (u.includes("windows nt 6.3") || u.includes("windows nt 6.2"))
    os = "Windows 8";
  else if (u.includes("windows nt 6.1")) os = "Windows 7";
  else if (u.includes("mac os x") || u.includes("macintosh")) os = "macOS";
  else if (u.includes("linux")) os = "Linux";

  // Browser
  let browser = "Browser";
  if (u.includes("chrome") && !u.includes("edg/")) browser = "Chrome";
  else if (u.includes("safari") && !u.includes("chrome")) browser = "Safari";
  else if (u.includes("firefox")) browser = "Firefox";
  else if (u.includes("edg/") || u.includes("edge/")) browser = "Edge";
  else if (u.includes("opr") || u.includes("opera")) browser = "Opera";

  const parts = [browser, os].filter(Boolean);
  return parts.length ? parts.join(" on ") : ua;
};
