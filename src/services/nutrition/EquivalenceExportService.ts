import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';

export class EquivalenceExportService {
  /**
   * Exporta la hoja de equivalencias clínicas oficial a PDF en orientación vertical (Letter Portrait)
   * con renderizado a 2x Retina DPI para máxima nitidez de texto y tablas.
   * Funciona 100% en el navegador del cliente sin requerir conexión a internet.
   */
  public static async exportSheetToPdf(
    elementOrId: HTMLElement | string,
    patientName: string = ''
  ): Promise<void> {
    const el = typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

    if (!el) {
      throw new Error('No se encontró el elemento de la hoja de equivalencias para exportar.');
    }

    // Esperar decodificación de imágenes dentro del contenedor
    const images = Array.from(el.querySelectorAll('img'));
    await Promise.all(
      images.map(async img => {
        if ('decode' in img) {
          try {
            await img.decode();
            return true;
          } catch {
            // fallback
          }
        }
        if (img.complete && img.naturalWidth > 0) return true;
        return new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        });
      })
    );

    // Retardo breve para asegurar renderizado de estilos
    await new Promise(resolve => setTimeout(resolve, 100));

    let imgData = '';
    try {
      imgData = await toJpeg(el, {
        quality: 0.96,
        pixelRatio: 2,
        backgroundColor: '#fafbf7',
        filter: (node: Node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        }
      });
    } catch (toJpegErr) {
      console.warn('[EQUIVALENCE:EXPORT] toJpeg error, using html2canvas fallback:', toJpegErr);
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#fafbf7',
        useCORS: true,
        logging: false
      });
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    }

    if (!imgData || imgData.length < 5000) {
      throw new Error('No se pudo generar la imagen para el PDF de equivalencias.');
    }

    // Documento PDF tamaño Carta vertical (215.9 x 279.4 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;

    const img = new Image();
    img.src = imgData;
    await new Promise<void>(resolve => {
      if (img.complete) resolve();
      else img.onload = () => resolve();
    });

    const imgHeight = (img.height * contentWidth) / img.width;
    const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);

    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, finalHeight);

    const safeName = patientName
      ? `_${patientName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/ +/g, '_')}`
      : '_General';

    pdf.save(`Guia_Equivalencias_SMAE${safeName}.pdf`);
  }
}
