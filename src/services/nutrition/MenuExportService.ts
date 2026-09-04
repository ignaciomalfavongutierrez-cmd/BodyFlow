import jsPDF from 'jspdf';
import type { Patient, PatientDietPlan } from '../../types/patient';
import type { DietPlanMenu } from '../../types/dietMenu';
import { MEAL_TIMES_CATALOG } from '../../types/dietMenu';

export interface ShoppingCategoryItem {
  nombre: string;
  categoria: string;
  cantidadSugerida?: string;
}

export class MenuExportService {
  /**
   * Extrae y consolida los ingredientes del menú en una lista de compras categorizada
   */
  public static extractShoppingListFromMenu(menu: DietPlanMenu): Record<string, string[]> {
    const allIngredients: string[] = [];

    menu.dias.forEach((dia) => {
      Object.values(dia.comidas).forEach((dishes) => {
        dishes.forEach((dish) => {
          (dish.ingredientes || []).forEach((ing) => {
            const clean = ing.trim();
            if (clean && !allIngredients.includes(clean)) {
              allIngredients.push(clean);
            }
          });
        });
      });
    });

    const categories: Record<string, string[]> = {
      'Verduras & Vegetales': [],
      'Frutas': [],
      'Carnes, Pescados & Proteínas': [],
      'Lácteos & Huevos': [],
      'Cereales, Panes & Granos': [],
      'Grasas Saludables & Semillas': [],
      'Despensa & Condimentos': []
    };

    allIngredients.forEach((ing) => {
      const lower = ing.toLowerCase();
      if (lower.includes('huevo') || lower.includes('clara') || lower.includes('queso') || lower.includes('yogur') || lower.includes('leche')) {
        categories['Lácteos & Huevos'].push(ing);
      } else if (lower.includes('pollo') || lower.includes('res') || lower.includes('salmón') || lower.includes('salmon') || lower.includes('atún') || lower.includes('atun') || lower.includes('pescado') || lower.includes('tilapia') || lower.includes('proteína') || lower.includes('pavo')) {
        categories['Carnes, Pescados & Proteínas'].push(ing);
      } else if (lower.includes('fresa') || lower.includes('manzana') || lower.includes('plátano') || lower.includes('arándano') || lower.includes('frutos') || lower.includes('limón') || lower.includes('limon')) {
        categories['Frutas'].push(ing);
      } else if (lower.includes('espinaca') || lower.includes('champiñ') || lower.includes('nopal') || lower.includes('lechuga') || lower.includes('pepino') || lower.includes('jitomate') || lower.includes('tomate') || lower.includes('cebolla') || lower.includes('calabacita') || lower.includes('espárrago') || lower.includes('brócoli') || lower.includes('zanahoria') || lower.includes('apio') || lower.includes('pimiento')) {
        categories['Verduras & Vegetales'].push(ing);
      } else if (lower.includes('arroz') || lower.includes('avena') || lower.includes('quinoa') || lower.includes('tortilla') || lower.includes('tostada') || lower.includes('pan') || lower.includes('papa') || lower.includes('frijol')) {
        categories['Cereales, Panes & Granos'].push(ing);
      } else if (lower.includes('aguacate') || lower.includes('chía') || lower.includes('chia') || lower.includes('almendra') || lower.includes('nuez') || lower.includes('cacahuate') || lower.includes('aceite') || lower.includes('ajonjolí')) {
        categories['Grasas Saludables & Semillas'].push(ing);
      } else {
        categories['Despensa & Condimentos'].push(ing);
      }
    });

    // Filtrar categorías vacías
    const result: Record<string, string[]> = {};
    Object.entries(categories).forEach(([cat, list]) => {
      if (list.length > 0) {
        result[cat] = list;
      }
    });

    return result;
  }

  /**
   * Genera el mensaje estructurado de WhatsApp listo para edición o envío
   */
  public static generateWhatsAppMessage(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu,
    options: {
      incluirDesgloseComidas?: boolean;
      incluirListaCompras?: boolean;
      incluirIndicaciones?: boolean;
    } = { incluirDesgloseComidas: true, incluirListaCompras: true, incluirIndicaciones: true }
  ): string {
    const firstName = patient.nombre.split(' ')[0];
    let msg = `Hola *${firstName}* 👋 Te comparto tu nuevo plan de alimentación personalizado de *BodyFlow*:\n\n`;

    msg += `📋 *${plan.nombre}*\n`;
    if (plan.objetivo) msg += `🎯 *Objetivo:* ${plan.objetivo}\n`;
    msg += `⚡ *Meta Diaria:* ${plan.calorias} kcal\n`;
    msg += `📊 *Macros:* ${plan.macros.protein}g Proteína • ${plan.macros.carbs}g Carbos • ${plan.macros.fat}g Grasas\n`;
    if (plan.comidasSugeridas) msg += `🍽️ *Estructura:* ${plan.comidasSugeridas} tiempos de comida\n`;
    msg += `----------------------------------------\n\n`;

    if (options.incluirDesgloseComidas && menu && menu.dias && menu.dias.length > 0) {
      msg += `🥗 *PLAN DE COMIDAS:*\n\n`;
      menu.dias.forEach((dia) => {
        if (menu.dias.length > 1) {
          msg += `🗓️ *${dia.diaNombre.toUpperCase()}*\n`;
        }

        const catalogToUse = menu.tiemposComidaConfig && menu.tiemposComidaConfig.length > 0
          ? menu.tiemposComidaConfig
          : MEAL_TIMES_CATALOG;

        catalogToUse.forEach((timeCat) => {
          const dishes = dia.comidas[timeCat.key] || [];
          if (dishes.length > 0) {
            msg += `${timeCat.icon} *${timeCat.label}*:\n`;
            dishes.forEach((d) => {
              msg += `• *${d.nombre}* (${d.porcion})\n`;
              if (d.ingredientes && d.ingredientes.length > 0) {
                msg += `   Ingredientes: ${d.ingredientes.join(', ')}\n`;
              }
              if (d.macros) {
                msg += `   _(${d.macros.calories} kcal | ${d.macros.protein}g P | ${d.macros.carbs}g C | ${d.macros.fat}g G)_\n`;
              }
            });
            msg += `\n`;
          }
        });
      });
      msg += `----------------------------------------\n\n`;
    }

    if (options.incluirListaCompras && menu) {
      const shopping = this.extractShoppingListFromMenu(menu);
      if (Object.keys(shopping).length > 0) {
        msg += `🛒 *LISTA BÁSICA DE COMPRAS:*\n\n`;
        Object.entries(shopping).forEach(([category, items]) => {
          msg += `*${category}:*\n`;
          items.forEach((item) => {
            msg += `✓ ${item}\n`;
          });
          msg += `\n`;
        });
        msg += `----------------------------------------\n\n`;
      }
    }

    if (options.incluirIndicaciones && plan.notas) {
      msg += `💡 *INDICACIONES CLÍNICAS:* \n${plan.notas}\n\n`;
    }

    msg += `Cualquier duda con alguna porción o preparación, avísame con toda confianza. ¡Mucho éxito con tu plan! ✨`;

    return msg;
  }

  /**
   * Genera el enlace directo a WhatsApp con mensaje codificado
   */
  public static getWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    if (!cleanPhone) {
      return `https://wa.me/?text=${encoded}`;
    }
    // Si no tiene código de país (10 dígitos México), anteponer 52
    const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encoded}`;
  }

  /**
   * Exporta el menú a un documento Word (.doc compatible con MS Word) con formato estructurado
   */
  public static exportMenuToWord(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu
  ): void {
    const shopping = this.extractShoppingListFromMenu(menu);

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${plan.nombre} - ${patient.nombre}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.4; margin: 30px; }
          .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 18pt; font-weight: bold; color: #047857; margin: 0; }
          .subtitle { font-size: 11pt; color: #64748b; margin-top: 4px; }
          .patient-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
          .kpi-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .kpi-table td { text-align: center; padding: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; font-weight: bold; }
          .kpi-label { font-size: 9pt; color: #64748b; text-transform: uppercase; font-weight: normal; }
          .day-title { font-size: 14pt; font-weight: bold; color: #0f172a; margin-top: 25px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .meal-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; padding: 10px; margin-bottom: 12px; border-radius: 4px; }
          .meal-name { font-size: 12pt; font-weight: bold; color: #047857; }
          .meal-desc { font-size: 10pt; color: #334155; margin-top: 2px; }
          .meal-ing { font-size: 9.5pt; color: #475569; margin-top: 4px; font-style: italic; }
          .shopping-section { margin-top: 30px; page-break-before: always; }
          .shopping-grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .shopping-grid th { background-color: #ecfdf5; color: #065f46; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          .shopping-grid td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class='header'>
          <h1 class='title'>BODYFLOW • PLAN DE ALIMENTACIÓN CLÍNICO</h1>
          <p class='subtitle'>Lic. Talia Tinoco • Nutrición Clínica Integral</p>
        </div>

        <div class='patient-box'>
          <p style='margin: 0;'><strong>Paciente:</strong> ${patient.nombre} &nbsp;|&nbsp; <strong>Edad:</strong> ${patient.edad || '--'} años &nbsp;|&nbsp; <strong>Fecha:</strong> ${plan.fechaAsignacion}</p>
          <p style='margin: 4px 0 0 0;'><strong>Plan:</strong> ${plan.nombre} &nbsp;|&nbsp; <strong>Objetivo:</strong> ${plan.objetivo || 'Personalizado'}</p>
          
          <table class='kpi-table'>
            <tr>
              <td><span class='kpi-label'>Calorías Diarias</span><br/><span style='font-size: 13pt; color: #0f172a;'>${plan.calorias} kcal</span></td>
              <td><span class='kpi-label'>Proteína</span><br/><span style='font-size: 13pt; color: #2563eb;'>${plan.macros.protein} g</span></td>
              <td><span class='kpi-label'>Carbohidratos</span><br/><span style='font-size: 13pt; color: #d97706;'>${plan.macros.carbs} g</span></td>
              <td><span class='kpi-label'>Grasas</span><br/><span style='font-size: 13pt; color: #e11d48;'>${plan.macros.fat} g</span></td>
            </tr>
          </table>
        </div>

        <div>
    `;

    menu.dias.forEach((dia) => {
      html += `<div class='day-title'>${dia.diaNombre}</div>`;
      const catalogToUse = menu.tiemposComidaConfig && menu.tiemposComidaConfig.length > 0
        ? menu.tiemposComidaConfig
        : MEAL_TIMES_CATALOG;

      catalogToUse.forEach((tc) => {
        const dishes = dia.comidas[tc.key] || [];
        if (dishes.length > 0) {
          dishes.forEach((d) => {
            html += `
              <div class='meal-card'>
                <div class='meal-name'>${tc.icon} ${tc.label}: ${d.nombre}</div>
                <div class='meal-desc'><strong>Porción:</strong> ${d.porcion}</div>
                ${d.descripcion ? `<div class='meal-desc'>${d.descripcion}</div>` : ''}
                ${d.ingredientes && d.ingredientes.length > 0 ? `<div class='meal-ing'><strong>Ingredientes:</strong> ${d.ingredientes.join(', ')}</div>` : ''}
                <div style='font-size: 9pt; color: #64748b; margin-top: 4px;'>Aporte aproximado: ${d.macros.calories} kcal | ${d.macros.protein}g P | ${d.macros.carbs}g C | ${d.macros.fat}g G</div>
              </div>
            `;
          });
        }
      });
    });

    if (plan.notas) {
      html += `
        <div style='margin-top: 20px; background-color: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 6px;'>
          <strong>Indicaciones Clínicas:</strong><br/>
          ${plan.notas}
        </div>
      `;
    }

    if (Object.keys(shopping).length > 0) {
      html += `
        <div class='shopping-section'>
          <h2 style='font-size: 15pt; color: #047857;'>🛒 Lista de Compras Básica del Menú</h2>
          <table class='shopping-grid'>
      `;
      Object.entries(shopping).forEach(([cat, items]) => {
        html += `
          <tr>
            <th style='width: 30%;'>${cat}</th>
            <td>${items.join(' &nbsp;•&nbsp; ')}</td>
          </tr>
        `;
      });
      html += `
          </table>
        </div>
      `;
    }

    html += `
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = patient.nombre.replace(/[^a-zA-Z0-9]/g, '_');
    link.href = url;
    link.download = `Menu_${safeName}_${plan.calorias}kcal.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera y descarga el PDF oficial membretado con formato clínico profesional
   */
  public static exportMenuToPdf(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu
  ): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 16) {
        pdf.addPage('letter', 'portrait');
        y = margin;
      }
    };

    // --- 1. HEADER INSTITUCIONAL ---
    pdf.setFillColor(4, 120, 87); // #047857
    pdf.rect(margin, y, contentWidth, 3, 'F');
    y += 7;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(4, 120, 87);
    pdf.text('BODYFLOW • PLAN NUTRICIONAL CLÍNICO', margin, y);
    y += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Lic. Talia Tinoco • Nutrición Clínica Integral • Cédula Profesional y Especialidad', margin, y);
    y += 6;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, margin + contentWidth, y);
    y += 5;

    // --- 2. TARJETA DATOS DEL PACIENTE ---
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Paciente: ${patient.nombre}`, margin + 4, y + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    const edadStr = patient.edad ? `${patient.edad} años` : 'No registrada';
    const pesoStr = plan.parametrosCalculo?.pesoUtilizado ? `${plan.parametrosCalculo.pesoUtilizado} kg` : '';
    pdf.text(`Edad: ${edadStr} ${pesoStr ? '| Peso: ' + pesoStr : ''} | Fecha de asignación: ${plan.fechaAsignacion}`, margin + 4, y + 11);
    pdf.text(`Plan: ${plan.nombre} | Objetivo: ${plan.objetivo || 'Personalizado'}`, margin + 4, y + 15);
    y += 22;

    // --- 3. METAS CALÓRICAS Y MACROS (4 COLUMNAS) ---
    const colW = (contentWidth - 6) / 4;
    const macroBoxes = [
      { label: 'Calorías Diarias', val: `${plan.calorias} kcal`, color: [15, 23, 42] },
      { label: 'Proteína', val: `${plan.macros.protein}g`, color: [37, 99, 235] },
      { label: 'Carbohidratos', val: `${plan.macros.carbs}g`, color: [217, 119, 6] },
      { label: 'Grasas', val: `${plan.macros.fat}g`, color: [225, 29, 72] }
    ];

    macroBoxes.forEach((mb, idx) => {
      const bx = margin + idx * (colW + 2);
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(bx, y, colW, 14, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(mb.label.toUpperCase(), bx + colW / 2, y + 4.5, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(mb.color[0], mb.color[1], mb.color[2]);
      pdf.text(mb.val, bx + colW / 2, y + 11, { align: 'center' });
    });
    y += 18;

    // --- 4. COMIDAS Y MENÚ ---
    menu.dias.forEach((dia) => {
      checkPageBreak(25);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(4, 120, 87);
      pdf.text(`🗓️ ${dia.diaNombre.toUpperCase()}`, margin, y);
      y += 2;
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, margin + contentWidth, y);
      y += 4;

      const catalogToUse = menu.tiemposComidaConfig && menu.tiemposComidaConfig.length > 0
        ? menu.tiemposComidaConfig
        : MEAL_TIMES_CATALOG;

      catalogToUse.forEach((timeCat) => {
        const dishes = dia.comidas[timeCat.key] || [];
        if (dishes.length === 0) return;

        checkPageBreak(18);
        dishes.forEach((dish) => {
          checkPageBreak(22);
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(226, 232, 240);
          pdf.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');

          // Left border accent
          pdf.setFillColor(16, 185, 129);
          pdf.rect(margin, y, 2.5, 16, 'F');

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(4, 120, 87);
          pdf.text(`${timeCat.icon} ${timeCat.label}: ${dish.nombre} (${dish.porcion})`, margin + 5, y + 5);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          const ingText = dish.ingredientes && dish.ingredientes.length > 0 
            ? `Ingredientes: ${dish.ingredientes.join(', ')}` 
            : (dish.descripcion || 'Preparación balanceada según porciones indicadas');
          
          const splitIng = pdf.splitTextToSize(ingText, contentWidth - 12);
          pdf.text(splitIng[0] || '', margin + 5, y + 9.5);

          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Aporte: ${dish.macros.calories} kcal | ${dish.macros.protein}g P | ${dish.macros.carbs}g C | ${dish.macros.fat}g G`, margin + 5, y + 13.5);

          y += 18;
        });
      });

      y += 2;
    });

    // --- 5. INDICACIONES CLÍNICAS ---
    if (plan.notas) {
      checkPageBreak(25);
      pdf.setFillColor(254, 252, 232); // #fefce8
      pdf.setDrawColor(254, 240, 138); // #fef08a
      pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(161, 98, 7);
      pdf.text('💡 INDICACIONES CLÍNICAS & RECOMENDACIONES:', margin + 4, y + 5.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(113, 63, 18);
      const splitNotas = pdf.splitTextToSize(plan.notas, contentWidth - 8);
      pdf.text(splitNotas.slice(0, 2), margin + 4, y + 10.5);
      y += 22;
    }

    // --- 6. LISTA DE COMPRAS BÁSICA ---
    const shopping = this.extractShoppingListFromMenu(menu);
    if (Object.keys(shopping).length > 0) {
      checkPageBreak(30);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(4, 120, 87);
      pdf.text('🛒 LISTA DE COMPRAS SUGERIDA DEL MENÚ', margin, y);
      y += 2;
      pdf.setDrawColor(16, 185, 129);
      pdf.line(margin, y, margin + contentWidth, y);
      y += 5;

      Object.entries(shopping).forEach(([category, items]) => {
        checkPageBreak(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        pdf.text(`• ${category}:`, margin + 2, y);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        const itemsStr = items.join(', ');
        const splitItems = pdf.splitTextToSize(itemsStr, contentWidth - 10);
        pdf.text(splitItems, margin + 6, y + 4);
        y += 5 + (splitItems.length * 3.5);
      });
    }

    // Pie de página institucional
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Expediente Clínico BodyFlow • Documento confidencial para uso exclusivo del paciente y su seguimiento nutricional.', margin, pageHeight - 8);

    const safeName = patient.nombre.replace(/[^a-zA-Z0-9]/g, '_');
    pdf.save(`Menu_${safeName}_${plan.calorias}kcal.pdf`);
  }
}
