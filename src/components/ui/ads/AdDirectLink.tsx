"use client";
import { useEffect } from "react";

const DIRECT_LINK = "https://www.profitablecpmratenetwork.com/gd5iruty?key=6ed2d11b5284120bc0849bf320f9facf";
const SESSION_KEY = "adDirectFired";

/**
 * AdDirectLink — fires the Adsterra direct-link ad ONCE per session.
 *
 * Mount this component wherever a high-intent user action happens,
 * e.g. the Watch Now button, player page, or episode play.
 * It opens the link in a new tab silently on first mount only.
 */
export default function AdDirectLink() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Small delay so the user's primary action (video loading) completes first
    const t = setTimeout(() => {
      const a = document.createElement("a");
      a.href = DIRECT_LINK;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  return null; // renders nothing
}