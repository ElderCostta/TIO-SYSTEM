// Utilitários oficiais de cabeçalho, paginação A4 e formatação para o Editor de Ofício
// Desenvolvido com base no modelo oficial do Conselho Tutelar (Lei Federal nº 8.069/90)

import { Oficio, OficioCounselor } from "../types";

/**
 * Logomarca oficial do Conselho Tutelar conforme modelo da Lei 8.069/90
 * com o topo em cúpula azul, figura adulta verde central, crianças vermelha e amarela, e berço azul.
 */
export const CONSELHO_TUTELAR_OFICIAL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="100%" height="100%">
  <g transform="translate(10, 5)">
    <!-- Cúpula / Guarda-chuva Azul Superior -->
    <path d="M 60 70 C 60 25, 240 25, 240 70 C 240 85, 215 92, 150 92 C 85 92, 60 85, 60 70 Z" fill="#0055b8" />
    
    <!-- Figura Verde Central (Protetor / Adulto) -->
    <circle cx="150" cy="112" r="16" fill="#00a859" />
    <line x1="150" y1="126" x2="150" y2="175" stroke="#00a859" stroke-width="12" stroke-linecap="round" />
    <polygon points="140,166 160,166 165,188 135,188" fill="#00a859" />
    <!-- Braços estendidos acolhendo as crianças -->
    <path d="M 150 142 C 130 128, 115 142, 115 154" fill="none" stroke="#00a859" stroke-width="9" stroke-linecap="round" />
    <path d="M 150 142 C 170 128, 185 142, 185 154" fill="none" stroke="#00a859" stroke-width="9" stroke-linecap="round" />

    <!-- Criança Vermelha (Esquerda) -->
    <circle cx="98" cy="142" r="13" fill="#e52320" />
    <line x1="98" y1="154" x2="102" y2="182" stroke="#e52320" stroke-width="8" stroke-linecap="round" />
    <polygon points="94,175 108,175 111,192 91,192" fill="#e52320" />
    <path d="M 98 162 L 72 178" stroke="#e52320" stroke-width="7" stroke-linecap="round" />
    <path d="M 98 162 L 115 154" stroke="#e52320" stroke-width="7" stroke-linecap="round" />

    <!-- Criança Amarela (Direita) -->
    <circle cx="202" cy="138" r="13" fill="#fbb034" />
    <line x1="202" y1="150" x2="202" y2="182" stroke="#fbb034" stroke-width="8" stroke-linecap="round" />
    <polygon points="194,175 208,175 215,192 192,192" fill="#fbb034" />
    <path d="M 202 158 L 226 160" stroke="#fbb034" stroke-width="7" stroke-linecap="round" />
    <path d="M 202 158 L 185 154" stroke="#fbb034" stroke-width="7" stroke-linecap="round" />

    <!-- Base / Berço Azul Inferior -->
    <path d="M 64 192 C 58 212, 85 232, 150 235 C 215 232, 242 212, 236 192 C 220 200, 180 205, 150 205 C 120 205, 80 200, 64 192 Z" fill="#0055b8" />
  </g>

  <!-- Tipografia Oficial CONSELHO TUTELAR -->
  <text x="160" y="260" 
        font-family="'Inter', -apple-system, Arial, sans-serif" 
        font-size="22" 
        font-weight="900" 
        letter-spacing="2" 
        fill="#0055b8" 
        text-anchor="middle">
    CONSELHO
  </text>
  <text x="160" y="285" 
        font-family="'Inter', -apple-system, Arial, sans-serif" 
        font-size="22" 
        font-weight="900" 
        letter-spacing="2" 
        fill="#0055b8" 
        text-anchor="middle">
    TUTELAR
  </text>
</svg>`;

export const CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  CONSELHO_TUTELAR_OFICIAL_LOGO_SVG.replace('viewBox="0 0 320 220"', 'viewBox="0 0 320 295"')
)}`;

/**
 * Retorna o cabeçalho institucional oficial do Conselho Tutelar em HTML
 * exatamente como no anexo:
 * Logo no topo + CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90 – LEI FEDERAL 8.069/90
 * + Linha horizontal separadora
 */
export function getOficioHeaderHtml(): string {
  return `
    <div class="oficio-header" style="text-align: center; margin-bottom: 22px; width: 100%;">
      <div class="oficio-header-logo" style="display: flex; justify-content: center; align-items: center; margin-bottom: 6px;">
        <img src="${CONSELHO_TUTELAR_OFICIAL_LOGO_DATA_URL}" 
             alt="Conselho Tutelar" 
             style="height: 60px; max-width: 140px; object-fit: contain; display: block; margin: 0 auto;" />
      </div>
      <div class="oficio-header-title" style="font-family: 'Times New Roman', Times, 'Liberation Serif', serif; font-size: 13.5pt; font-weight: bold; color: #000000; text-transform: uppercase; line-height: 1.25; margin: 0; padding: 0;">
        CONSELHO TUTELAR DOS DIREITOS
      </div>
      <div class="oficio-header-subtitle" style="font-family: 'Times New Roman', Times, 'Liberation Serif', serif; font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase; line-height: 1.25; margin-top: 2px;">
        DA CRIANÇA E DO ADOLESCENTE LEI FEDERAL Nº 8.069/90 – LEI FEDERAL 8.069/90
      </div>
      <div class="oficio-header-line" style="border-bottom: 1.5px solid #000000; margin-top: 10px; margin-bottom: 18px; width: 100%;"></div>
    </div>
  `;
}

/**
 * Converte data ISO (YYYY-MM-DD) para extenso formal em Português
 * Ex: "2026-10-19" -> "19 de outubro de 2026"
 */
export function formatDataPorExtenso(dataIso: string): string {
  if (!dataIso) return "";
  const parts = dataIso.split("-");
  if (parts.length < 3) return dataIso;
  const dia = parseInt(parts[2], 10);
  const mesIndex = parseInt(parts[1], 10) - 1;
  const ano = parts[0];
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return `${dia} de ${meses[mesIndex] || parts[1]} de ${ano}`;
}

/**
 * Retorna os estilos CSS para impressão e PDF no formato A4 oficial,
 * garantindo cabeçalho repetido em todas as páginas, margens A4 e quebra limpa.
 */
export function getOficioPrintCss(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 20mm 20mm 20mm 20mm;
    }

    @media print {
      html, body {
        width: 210mm;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Times New Roman', Times, 'Liberation Serif', serif !important;
        font-size: 12pt !important;
        line-height: 1.45 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .no-print {
        display: none !important;
      }

      .a4-page {
        width: 100% !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 0 0 15mm 0 !important;
        box-shadow: none !important;
        border: none !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        position: relative !important;
        background: #ffffff !important;
        box-sizing: border-box !important;
      }

      .a4-page:last-child {
        page-break-after: auto !important;
      }

      .oficio-header {
        position: static !important;
        display: block !important;
        page-break-inside: avoid !important;
      }

      .page-break {
        page-break-before: always !important;
      }

      .signature-block {
        page-break-inside: avoid !important;
      }
    }

    /* Estilos de Documento em Tela e Impressão */
    .oficio-doc-root {
      font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
      color: #000000;
      line-height: 1.45;
      font-size: 12pt;
    }

    .oficio-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
      font-size: 11.5pt;
      font-weight: normal;
    }

    .oficio-destinatario-block {
      margin-bottom: 24px;
      font-size: 11.5pt;
      line-height: 1.4;
    }

    .oficio-assunto-block {
      margin-bottom: 22px;
      font-size: 11.5pt;
      font-weight: normal;
    }

    .oficio-saudacao {
      text-align: center;
      margin: 24px 0 20px 0;
      font-size: 12pt;
      font-weight: normal;
    }

    .oficio-paragrafo {
      text-align: justify;
      text-justify: inter-word;
      text-indent: 2.5cm; /* Recuo padrão formal brasileiro */
      margin-bottom: 14px;
      line-height: 1.45;
      font-size: 12pt;
    }

    .oficio-encerramento {
      text-align: justify;
      text-justify: inter-word;
      text-indent: 2.5cm;
      margin-top: 18px;
      margin-bottom: 20px;
      line-height: 1.45;
      font-size: 12pt;
    }

    .oficio-fecho {
      text-align: center;
      margin: 26px 0 40px 0;
      font-size: 12pt;
    }

    .oficio-assinaturas-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px 40px;
      margin-top: 20px;
      margin-bottom: 40px;
      width: 100%;
    }

    .oficio-assinatura-item {
      text-align: center;
    }

    .oficio-assinatura-linha {
      border-bottom: 1px solid #000000;
      width: 85%;
      margin: 0 auto 6px auto;
    }

    .oficio-assinatura-cargo {
      font-size: 11pt;
      color: #000000;
      margin-top: 4px;
    }

    .oficio-assinatura-nome {
      font-size: 11pt;
      font-weight: bold;
      color: #000000;
    }

    .oficio-data-final {
      text-align: center;
      margin-top: 30px;
      font-size: 11.5pt;
    }
  `;
}
