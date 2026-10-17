/**
 * Universal High-Fidelity Print Utility for StayBite
 * Prints any element by ID in an isolated print context with exact CSS styles.
 */
export function printElement(elementId: string, docTitle: string = "StayBite Print") {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create an invisible iframe for isolated printing
  let iframe = document.getElementById("staybite-print-iframe") as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "staybite-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Collect all parent stylesheets
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  const printContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle}</title>
        ${styles}
        <style>
          @page {
            size: auto;
            margin: 8mm 10mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #09090b !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-wrapper {
            width: 100% !important;
            max-width: 180mm !important;
            margin: 0 auto !important;
            padding: 4mm 0 !important;
            background: #ffffff !important;
          }
          .no-print, button {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(printContent);
  iframeDoc.close();

  // Give images & CSS a moment to settle, then trigger print
  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (e) {
      console.error("Iframe print error, using fallback:", e);
      window.print();
    }
  }, 200);
}
