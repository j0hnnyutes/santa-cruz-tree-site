// Static SVG map — zero external dependencies, no iframes, no CDN
// Coordinates projected from real lat/lng:
//   lng range: -122.18 → -121.70  (west → east)
//   lat range:  36.56  →  37.16   (south → north, inverted for SVG y-axis)
//   viewBox: 600 × 520, 60px padding each side

const W = 600, H = 520, PAD = 60;
const LNG_MIN = -122.18, LNG_RANGE = 0.48;
const LAT_MIN =  36.56,  LAT_RANGE = 0.60;

function project(lat: number, lng: number) {
  const x = PAD + ((lng - LNG_MIN) / LNG_RANGE) * (W - PAD * 2);
  const y = (H - PAD) - ((lat - LAT_MIN) / LAT_RANGE) * (H - PAD * 2);
  return { x: Math.round(x), y: Math.round(y) };
}

const CITIES = [
  { name: "Santa Cruz",    lat: 36.9741, lng: -122.0308, ax: "end"   as const, dx: -14, dy: -10 },
  { name: "Live Oak",      lat: 36.9685, lng: -121.9905, ax: "middle"as const, dx:   0, dy:  22 },
  { name: "Capitola",      lat: 36.9716, lng: -121.9516, ax: "start" as const, dx:  14, dy:  16 },
  { name: "Soquel",        lat: 36.9802, lng: -121.9566, ax: "start" as const, dx:  14, dy:  -8 },
  { name: "Aptos",         lat: 36.9771, lng: -121.8996, ax: "start" as const, dx:  14, dy:   4 },
  { name: "Watsonville",   lat: 36.9102, lng: -121.7569, ax: "start" as const, dx:  14, dy:   4 },
  { name: "Scotts Valley", lat: 37.0513, lng: -122.0147, ax: "start" as const, dx:  14, dy:   4 },
  { name: "Felton",        lat: 37.0522, lng: -122.0708, ax: "end"   as const, dx: -14, dy:   4 },
  { name: "Ben Lomond",    lat: 37.0891, lng: -122.0858, ax: "end"   as const, dx: -14, dy:   4 },
  { name: "Boulder Creek", lat: 37.1252, lng: -122.1219, ax: "end"   as const, dx: -14, dy:   4 },
  { name: "Monterey",      lat: 36.6002, lng: -121.8947, ax: "start" as const, dx:  14, dy:   4 },
].map(c => ({ ...c, ...project(c.lat, c.lng) }));

export default function ServiceAreaSVGMap() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-label="Santa Cruz County service area map"
    >
      <defs>
        <filter id="pin-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1b5e35" floodOpacity="0.4" />
        </filter>
        {/* Subtle texture for land */}
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="#a8c4b0" opacity="0.35" />
        </pattern>
      </defs>

      {/* Ocean background */}
      <rect width={W} height={H} fill="#cce4ee" />

      {/* Land polygon — approximated Santa Cruz County coastline */}
      <path
        d={[
          "M 0,0 L 600,0 L 600,520",
          // Right & bottom coast line going through Watsonville then up to Monterey
          "L 600,310 L 520,295 L 484,228",
          // Up through Aptos, Capitola, Santa Cruz along coast
          "L 342,182 L 290,186 L 281,175 L 250,188 L 210,184",
          // NW coast heading off-screen
          "L 150,172 L 80,165 L 0,168 Z",
        ].join(" ")}
        fill="#eef5ee"
      />

      {/* Dot texture over land */}
      <rect width={W} height={H} fill="url(#dots)" />

      {/* Terrain hint — mountain ridgelines (upper-left = Santa Cruz Mountains) */}
      {[
        "M 60,80 L 85,55 L 110,80",
        "M 90,100 L 115,75 L 140,100",
        "M 70,115 L 95,92 L 120,115",
        "M 120,90 L 145,65 L 170,90",
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#8fba9a" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      ))}

      {/* Pacific Ocean label */}
      <text x="68" y="410" fill="#4a7a96" fontSize="13" fontStyle="italic"
        fontWeight="600" fontFamily="Georgia,serif" opacity="0.6">
        Pacific Ocean
      </text>

      {/* Faint dashed line connecting Monterey to main cluster */}
      <line
        x1={CITIES.find(c => c.name === "Monterey")!.x}
        y1={CITIES.find(c => c.name === "Monterey")!.y}
        x2={CITIES.find(c => c.name === "Aptos")!.x}
        y2={CITIES.find(c => c.name === "Aptos")!.y}
        stroke="#1b5e35" strokeWidth="1" strokeDasharray="5 4" opacity="0.18"
      />

      {/* City pins */}
      {CITIES.map(c => (
        <g key={c.name} filter="url(#pin-glow)">
          <circle cx={c.x} cy={c.y} r="8" fill="#1b5e35" />
          <circle cx={c.x} cy={c.y} r="3.5" fill="#86efad" />
        </g>
      ))}

      {/* City labels — stroke behind text for legibility over any background */}
      {CITIES.map(c => (
        <text
          key={`lbl-${c.name}`}
          x={c.x + c.dx}
          y={c.y + c.dy}
          textAnchor={c.ax}
          fontSize="11.5"
          fontWeight="700"
          fontFamily="system-ui,-apple-system,sans-serif"
          fill="#1a1a2e"
          stroke="rgba(238,245,238,0.9)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {c.name}
        </text>
      ))}

      {/* Footer label */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="10.5"
        fontFamily="system-ui,-apple-system,sans-serif"
        fill="#1b5e35" opacity="0.5" fontWeight="600">
        Santa Cruz County · 11 Service Cities
      </text>
    </svg>
  );
}
