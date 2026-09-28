// Conselho Tutelar Official Seal & Watermark Utilities
// Generated from official logomark attached by user

export const CONSELHO_TUTELAR_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <g transform="translate(0, -10)">
    <ellipse cx="250" cy="115" rx="85" ry="32" fill="#dbeafe" opacity="0.85" />
    <path d="M 195 125 C 190 90, 310 90, 305 125 Z" fill="#bfdbfe" opacity="0.6" />

    <!-- Top Blue Umbrella / Dome -->
    <path d="M 155 135 C 155 75, 345 75, 345 135 C 345 160, 320 168, 250 168 C 180 168, 155 160, 155 135 Z" fill="#0055b8" />
    
    <!-- Central Green Figure (Adult/Protector) -->
    <circle cx="250" cy="195" r="22" fill="#00a859" />
    <line x1="250" y1="217" x2="250" y2="305" stroke="#00a859" stroke-width="15" stroke-linecap="round" />
    <polygon points="238,290 262,290 268,320 232,320" fill="#00a859" />
    <path d="M 250 240 C 220 220, 195 240, 195 260" fill="none" stroke="#00a859" stroke-width="13" stroke-linecap="round" />
    <path d="M 250 240 C 280 220, 305 240, 305 260" fill="none" stroke="#00a859" stroke-width="13" stroke-linecap="round" />

    <!-- Left Child Figure (Red) -->
    <circle cx="172" cy="242" r="18" fill="#e52320" />
    <line x1="172" y1="260" x2="178" y2="310" stroke="#e52320" stroke-width="11" stroke-linecap="round" />
    <polygon points="168,300 188,300 192,325 164,325" fill="#e52320" />
    <path d="M 172 272 L 132 295" stroke="#e52320" stroke-width="10" stroke-linecap="round" />
    <path d="M 172 272 L 196 260" stroke="#e52320" stroke-width="10" stroke-linecap="round" />

    <!-- Right Child Figure (Yellow/Gold) -->
    <circle cx="328" cy="235" r="18" fill="#fbb034" />
    <line x1="328" y1="253" x2="328" y2="305" stroke="#fbb034" stroke-width="11" stroke-linecap="round" />
    <polygon points="318,295 338,295 348,325 316,325" fill="#fbb034" />
    <path d="M 328 265 L 362 268" stroke="#fbb034" stroke-width="10" stroke-linecap="round" />
    <path d="M 328 265 L 304 260" stroke="#fbb034" stroke-width="10" stroke-linecap="round" />

    <!-- Bottom Blue Cradle / Boat Shape -->
    <path d="M 160 325 C 150 355, 185 390, 250 395 C 315 390, 350 355, 340 325 C 320 338, 280 345, 250 345 C 220 345, 180 338, 160 325 Z" fill="#0055b8" />
  </g>

  <!-- Typography: CONSELHO TUTELAR -->
  <text x="250" y="440" 
        font-family="system-ui, -apple-system, sans-serif, Arial" 
        font-size="34" 
        font-weight="900" 
        letter-spacing="2.5" 
        fill="#0055b8" 
        text-anchor="middle">
    CONSELHO
  </text>
  <text x="250" y="480" 
        font-family="system-ui, -apple-system, sans-serif, Arial" 
        font-size="34" 
        font-weight="900" 
        letter-spacing="2.5" 
        fill="#0055b8" 
        text-anchor="middle">
    TUTELAR
  </text>
</svg>`;

export const CONSELHO_TUTELAR_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(CONSELHO_TUTELAR_LOGO_SVG)}`;

/**
 * Returns CSS and HTML snippet to inject into Print/PDF windows
 * to display the "Selo Transparente" (watermark) on every printed page.
 */
export function getPrintWatermarkHtml(): string {
  return `
    <div class="watermark-seal-container" aria-hidden="true">
      <div class="watermark-seal-content">
        <img src="${CONSELHO_TUTELAR_DATA_URL}" alt="Selo Oficial do Conselho Tutelar" class="watermark-seal-img" />
      </div>
    </div>
  `;
}

export function getPrintWatermarkCss(): string {
  return `
    /* Selo Transparente / Watermark do Conselho Tutelar para Impressão e PDF */
    .watermark-seal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .watermark-seal-content {
      width: 440px;
      height: 440px;
      opacity: 0.075;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: grayscale(15%);
    }

    .watermark-seal-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      opacity: 0.85;
    }

    @media print {
      .watermark-seal-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: -1 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        page-break-inside: avoid !important;
      }
      .watermark-seal-content {
        opacity: 0.08 !important;
        width: 430px !important;
        height: 430px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;
}
