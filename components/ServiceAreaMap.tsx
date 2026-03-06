"use client";

import { useEffect, useRef } from "react";

const CITIES = [
  { name: "Santa Cruz",    lat: 36.9741, lng: -122.0308, dir: "left",   off: [-2, -20] as [number,number] },
  { name: "Live Oak",      lat: 36.9685, lng: -121.9905, dir: "bottom", off: [0,    4] as [number,number] },
  { name: "Capitola",      lat: 36.9716, lng: -121.9516, dir: "right",  off: [2,  -20] as [number,number] },
  { name: "Soquel",        lat: 36.9802, lng: -121.9566, dir: "top",    off: [20, -42] as [number,number] },
  { name: "Aptos",         lat: 36.9771, lng: -121.8996, dir: "right",  off: [2,  -20] as [number,number] },
  { name: "Watsonville",   lat: 36.9102, lng: -121.7569, dir: "right",  off: [2,  -20] as [number,number] },
  { name: "Scotts Valley", lat: 37.0513, lng: -122.0147, dir: "right",  off: [2,  -20] as [number,number] },
  { name: "Felton",        lat: 37.0522, lng: -122.0708, dir: "left",   off: [-2, -20] as [number,number] },
  { name: "Ben Lomond",    lat: 37.0891, lng: -122.0858, dir: "left",   off: [-2, -20] as [number,number] },
  { name: "Boulder Creek", lat: 37.1252, lng: -122.1219, dir: "top",    off: [0,  -42] as [number,number] },
  { name: "Monterey",      lat: 36.6002, lng: -121.8947, dir: "right",  off: [2,  -20] as [number,number] },
];

const PIN_SVG = `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
  <circle cx="13" cy="13" r="12" fill="#1b5e35" stroke="white" stroke-width="2.5"/>
  <polygon points="13,38 5,22 21,22" fill="#1b5e35"/>
  <circle cx="13" cy="13" r="5" fill="white"/>
</svg>`;

function initMap(L: any, container: HTMLElement) {
  const map = L.map(container, {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([36.97, -121.93], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: "",
    html: PIN_SVG,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -40],
  });

  CITIES.forEach((c) => {
    L.marker([c.lat, c.lng], { icon: pinIcon })
      .addTo(map)
      .bindTooltip(c.name, {
        permanent: true,
        direction: c.dir,
        offset: c.off,
        className: "city-label",
      })
      .openTooltip();
  });
}

export default function ServiceAreaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    // Inject label CSS once
    if (!document.querySelector("style[data-city-label]")) {
      const style = document.createElement("style");
      style.setAttribute("data-city-label", "1");
      style.textContent = `
        .city-label {
          background: rgba(255,255,255,0.93) !important;
          border: 1px solid rgba(27,94,53,0.3) !important;
          border-radius: 4px !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #1a1a2e !important;
          white-space: nowrap !important;
          padding: 3px 7px !important;
        }
        .city-label::before { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    const container = containerRef.current;

    const runInit = () => {
      const L = (window as any).L;
      initMap(L, container);
    };

    if ((window as any).L) {
      // Leaflet already on page — init immediately
      runInit();
      return;
    }

    // Inject Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(css);
    }

    // Inject Leaflet JS then init
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = runInit;
    document.head.appendChild(script);
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
