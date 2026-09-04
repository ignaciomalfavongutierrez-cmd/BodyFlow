import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import type { Patient, PatientDietPlan } from '../../types/patient';
import type { DietPlanMenu, DishItem } from '../../types/dietMenu';
import { MEAL_TIMES_CATALOG } from '../../types/dietMenu';
import {
  TALIA_WATERMARK_BASE64,
  TALIA_LOGO_BASE64,
  TALIA_CLINICAL_CONTACT
} from './menuExportAssets';

export interface ShoppingCategoryItem {
  nombre: string;
  categoria: string;
  cantidadSugerida?: string;
}

interface DisplayDay {
  label: string;
  comidas: Record<string, DishItem[]>;
}

interface MealSectionDef {
  key: string;
  aliasKeys?: string[];
  label: string;
  dotColor: string;
  bg: string;
  textColor: string;
}

const CLINICAL_MEAL_SECTIONS: MealSectionDef[] = [
  {
    key: 'desayuno',
    aliasKeys: ['desayuno', 'breakfast'],
    label: 'DESAYUNO',
    dotColor: '#0284c7', // Sky blue / dark teal
    bg: '#f0f9ff',
    textColor: '#0369a1'
  },
  {
    key: 'almuerzo',
    aliasKeys: ['almuerzo', 'colacion_1', 'snack_1', 'snack_matutino', 'media_manana'],
    label: 'ALMUERZO',
    dotColor: '#16a34a', // Fresh green
    bg: '#f0fdf4',
    textColor: '#15803d'
  },
  {
    key: 'comida',
    aliasKeys: ['comida', 'lunch'],
    label: 'COMIDA',
    dotColor: '#ea580c', // Orange
    bg: '#fff7ed',
    textColor: '#c2410c'
  },
  {
    key: 'colacion',
    aliasKeys: ['colacion', 'colacion_2', 'snack_2', 'snack_vespertino', 'merienda'],
    label: 'COLACION',
    dotColor: '#d97706', // Amber
    bg: '#fffbeb',
    textColor: '#b45309'
  },
  {
    key: 'cena',
    aliasKeys: ['cena', 'dinner'],
    label: 'CENA',
    dotColor: '#ca8a04', // Golden
    bg: '#fefce8',
    textColor: '#a16207'
  }
];

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
    const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encoded}`;
  }

  /**
   * Normaliza los días del menú para desplegar en el formato horizontal (Landscape) de 7 columnas
   */
  private static getNormalizedDisplayDays(menu: DietPlanMenu): DisplayDay[] {
    if (menu && menu.dias && menu.dias.length === 7) {
      return menu.dias.map((d, i) => ({
        label: d.diaNombre?.trim() ? d.diaNombre.trim().toUpperCase() : `DÍA ${i + 1}`,
        comidas: d.comidas || {}
      }));
    }

    if (menu && menu.dias && menu.dias.length === 1) {
      // 1 día habitual -> Replicar a DÍA 1..DÍA 7 para completar la plantilla semanal completa
      const singleDay = menu.dias[0];
      return [1, 2, 3, 4, 5, 6, 7].map(num => ({
        label: `DÍA ${num}`,
        comidas: singleDay.comidas || {}
      }));
    }

    if (menu && menu.dias && menu.dias.length > 1) {
      return menu.dias.map((d, i) => ({
        label: d.diaNombre?.trim() ? d.diaNombre.trim().toUpperCase() : `DÍA ${i + 1}`,
        comidas: d.comidas || {}
      }));
    }

    return [1, 2, 3, 4, 5, 6, 7].map(num => ({
      label: `DÍA ${num}`,
      comidas: {}
    }));
  }

  /**
   * Obtiene los platillos de una categoría de comida comprobando claves y alias
   */
  private static getDishesForSection(comidas: Record<string, DishItem[]>, section: MealSectionDef): DishItem[] {
    if (comidas[section.key] && comidas[section.key].length > 0) {
      return comidas[section.key];
    }
    if (section.aliasKeys) {
      for (const k of section.aliasKeys) {
        if (comidas[k] && comidas[k].length > 0) {
          return comidas[k];
        }
      }
    }
    return [];
  }

  /**
   * Renderiza el contenido celular de los platillos e ingredientes con viñetas limpias
   */
  private static renderDishesCellHtml(dishes: DishItem[]): string {
    if (!dishes || dishes.length === 0) {
      return `<div style="text-align: center; color: #94a3b8; font-size: 9px; padding: 2px 0;">—</div>`;
    }

    return dishes.map(dish => {
      const hasIngs = dish.ingredientes && Array.isArray(dish.ingredientes) && dish.ingredientes.length > 0;
      let html = '<div style="margin-bottom: 3.5px;">';

      if (hasIngs) {
        // Si el nombre es un título de receta estructurado (ej. "Sándwich integral de")
        const isRecipe = dish.nombre && !dish.ingredientes.some(i => i.toLowerCase() === dish.nombre.toLowerCase());
        if (isRecipe) {
          const formattedTitle = dish.nombre.endsWith(':') ? dish.nombre : `${dish.nombre}:`;
          html += `<div style="font-weight: 700; color: #1e293b; font-size: 8.5px; margin-bottom: 1.5px;">${formattedTitle}</div>`;
        }
        html += '<ul style="margin: 0; padding-left: 11px; list-style-type: disc; font-size: 8px; color: #334155; line-height: 1.3;">';
        dish.ingredientes.forEach(ing => {
          html += `<li style="margin-bottom: 1px;">${ing}</li>`;
        });
        html += '</ul>';
      } else {
        const porcionStr = dish.porcion ? ` <span style="color: #64748b;">(${dish.porcion})</span>` : '';
        html += `<div style="font-size: 8px; color: #1e293b; line-height: 1.3;">• ${dish.nombre}${porcionStr}</div>`;
        if (dish.descripcion) {
          html += `<div style="font-size: 7.5px; color: #64748b; font-style: italic; margin-left: 6px;">${dish.descripcion}</div>`;
        }
      }

      html += '</div>';
      return html;
    }).join('');
  }

  /**
   * Genera el documento HTML completo del Menú Clínico en formato horizontal (Landscape)
   * con la marca de agua de la manzana, logotipo de Talia Tinoco, tabla semanal de 7 columnas
   * y recuadros clínicos de macronutrientes y contacto.
   */
  public static generateClinicalMenuHtml(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu,
    _options: { isForPdf?: boolean; isForWord?: boolean } = {}
  ): string {
    const displayDays = this.getNormalizedDisplayDays(menu);
    const numCols = displayDays.length;
    const colWidthPct = (100 / numCols).toFixed(2);

    // Detección de secciones activas o catálogo predeterminado
    const sectionsToRender = CLINICAL_MEAL_SECTIONS;

    // Construcción de filas de la tabla
    let tableBodyHtml = '';

    // Encabezado de columnas: DÍA 1..DÍA 7
    tableBodyHtml += `
      <thead>
        <tr>
          ${displayDays.map(d => `
            <th style="border: 1px solid #cbd5e1; border-bottom: 2px solid #a8b792; padding: 5px 2px; text-align: center; font-size: 10.5px; font-weight: 800; color: #1e293b; background-color: #f8fafc; text-transform: uppercase; width: ${colWidthPct}%;">
              ${d.label}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
    `;

    // Para cada tiempo de comida: barra de categoría + celdas por día
    sectionsToRender.forEach(sec => {
      // 1. Barra de sección de comida (spans all columns)
      tableBodyHtml += `
        <tr style="background-color: ${sec.bg};">
          <td colspan="${numCols}" style="padding: 2.5px 8px; border: 1px solid #cbd5e1; border-top: 1.5px solid #94a3b8; text-align: left;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: ${sec.dotColor};"></span>
              <span style="font-size: 9.5px; font-weight: 900; color: ${sec.textColor}; letter-spacing: 1px; text-transform: uppercase;">
                ${sec.label}
              </span>
            </div>
          </td>
        </tr>
      `;

      // 2. Fila con las celdas de cada día
      tableBodyHtml += `
        <tr>
          ${displayDays.map(day => {
            const dishes = this.getDishesForSection(day.comidas, sec);
            return `
              <td style="border: 1px solid #cbd5e1; padding: 5px 6px; vertical-align: top; background-color: transparent; font-size: 8.5px; line-height: 1.35; color: #1e293b;">
                ${this.renderDishesCellHtml(dishes)}
              </td>
            `;
          }).join('')}
        </tr>
      `;
    });

    tableBodyHtml += `</tbody>`;

    return `
      <div class="clinical-sheet-container" style="
        width: 1200px;
        min-height: 840px;
        box-sizing: border-box;
        padding: 18px 24px;
        background-color: #ffffff;
        position: relative;
        font-family: 'Calibri', 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #0f172a;
        overflow: hidden;
      ">
        <!-- MARCA DE AGUA CENTRAL (Manzana Talia Tinoco - Perfectamente centrada sobre la tabla con superposición transparente z-index 10) -->
        <div style="
          position: absolute;
          top: 130px;
          left: 365px;
          width: 470px;
          height: 520px;
          pointer-events: none;
          z-index: 10;
          text-align: center;
        ">
          <img src="${TALIA_WATERMARK_BASE64}" style="width: 100%; height: 100%; object-fit: contain; display: block;" alt="Marca de Agua" />
        </div>

        <!-- ENCABEZADO INSTITUCIONAL TALIA TINOCO FABIÁN (Tabla para perfecta alineación en Word y PDF) -->
        <table style="
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          border: none;
          position: relative;
          z-index: 2;
        ">
          <tr>
            <!-- Izquierda: Logotipo + Marca -->
            <td style="width: 30%; vertical-align: middle; border: none; text-align: left;">
              <table style="border-collapse: collapse; border: none;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px; border: none;">
                    <img src="${TALIA_LOGO_BASE64}" style="width: 50px; height: 50px; object-fit: contain; display: block;" alt="Talia Logo" />
                  </td>
                  <td style="vertical-align: middle; border: none;">
                    <div style="font-size: 13px; font-weight: 800; color: #556637; letter-spacing: 1.2px; line-height: 1.15; white-space: nowrap;">TALIA TINOCO FABIÁN</div>
                    <div style="font-size: 9px; font-weight: 700; color: #6e8248; letter-spacing: 4px; margin-top: 1px;">NUTRICIÓN</div>
                  </td>
                </tr>
              </table>
            </td>

            <!-- Centro: Banner Verde Salvia "MENU" -->
            <td style="width: 40%; vertical-align: middle; border: none; text-align: center;">
              <div style="
                display: inline-block;
                background-color: #a8b792;
                color: #1a2512;
                font-size: 18px;
                font-weight: 900;
                letter-spacing: 4px;
                padding: 6px 64px;
                border-radius: 8px;
                text-transform: uppercase;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              ">
                MENU
              </div>
            </td>

            <!-- Derecha: Recuadro Cédula Profesional -->
            <td style="width: 30%; vertical-align: middle; border: none; text-align: right;">
              <div style="
                display: inline-block;
                border: 1.5px solid #cbd5e1;
                border-radius: 6px;
                padding: 5px 14px;
                background-color: #ffffff;
                text-align: center;
              ">
                <div style="font-size: 12.5px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; white-space: nowrap;">
                  Cedula: ${TALIA_CLINICAL_CONTACT.cedula}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- SUB-BARRA METADATOS DEL PACIENTE (Caja clínica estilizada y perfectamente alineada) -->
        <div style="
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background-color: #f8fafc;
          margin-bottom: 8px;
          padding: 5px 12px;
          position: relative;
          z-index: 2;
        ">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 26%; text-align: left; vertical-align: middle; border: none; font-size: 10px; color: #334155;">
                <strong style="color: #475569;">Paciente:</strong> <span style="font-weight: 700; color: #0f172a;">${patient.nombre}</span>
              </td>
              <td style="width: 36%; text-align: left; vertical-align: middle; border: none; font-size: 10px; color: #334155;">
                <strong style="color: #475569;">Plan:</strong> <span style="font-weight: 700; color: #0f172a;">${plan.nombre}</span>
              </td>
              <td style="width: 23%; text-align: left; vertical-align: middle; border: none; font-size: 10px; color: #334155;">
                <strong style="color: #475569;">Objetivo:</strong> <span style="font-weight: 700; color: #0f172a;">${plan.objetivo || 'Personalizado'}</span>
              </td>
              <td style="width: 15%; text-align: right; vertical-align: middle; border: none; font-size: 10px; color: #334155;">
                <strong style="color: #475569;">Fecha:</strong> <span style="font-weight: 600; color: #0f172a;">${plan.fechaAsignacion}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- CUADRÍCULA DE COMIDAS (TABLA MULTIDÍA) -->
        <table style="
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          position: relative;
          z-index: 2;
          margin-bottom: 8px;
        ">
          ${tableBodyHtml}
        </table>

        <!-- SECCIÓN INFERIOR: RESUMEN DE METAS Y CONTACTO CLÍNICO (TaliaClinicalBanner) -->
        <table style="
          width: 100%;
          border-collapse: collapse;
          border: none;
          position: relative;
          z-index: 2;
          margin-top: 6px;
        ">
          <tr>
            <!-- Caja Izquierda: Calorías, Macronutrientes e Indicaciones -->
            <td style="
              width: 50%;
              vertical-align: top;
              padding-right: 6px;
              border: none;
            ">
              <div style="
                border: 2px solid #0f172a;
                border-radius: 8px;
                padding: 6px 12px;
                background-color: #ffffff;
                box-sizing: border-box;
                min-height: 74px;
              ">
                <div style="font-size: 10.5px; font-weight: 900; color: #0f172a; margin-bottom: 3px;">
                  ${plan.calorias} Kcal: ${plan.macros.protein}g proteína, ${plan.macros.carbs}g carbohidratos, ${plan.macros.fat}g grasa
                </div>
                <ul style="
                  margin: 0;
                  padding-left: 14px;
                  font-size: 8px;
                  color: #334155;
                  line-height: 1.35;
                  list-style-type: circle;
                ">
                  <li>Alta energía para entrenar, Proteína suficiente para hipertrofia, Grasas controladas, Carbohidratos altos para rendimiento.</li>
                  <li>Entrena fuerza 4–6 días/semana, Prioriza carbos alrededor del entrenamiento, Progresión en cargas (clave para recomposición).</li>
                  ${plan.notas ? `<li style="margin-top: 1.5px; color: #047857;"><strong>Indicaciones clínicas:</strong> ${plan.notas}</li>` : ''}
                </ul>
              </div>
            </td>

            <!-- Caja Derecha: Información de Contacto Profesional (TaliaClinicalBanner Completo) -->
            <td style="
              width: 50%;
              vertical-align: top;
              padding-left: 6px;
              border: none;
            ">
              <div style="
                background-color: #ffffff;
                border: 1px solid #d4dfc7;
                border-radius: 12px;
                padding: 5px 8px;
                box-sizing: border-box;
                min-height: 74px;
              ">
                <table style="width: 100%; border-collapse: collapse; border: none;">
                  <tr>
                    <!-- Tarjeta de Contacto Verde Salvia (#f4f7ee) -->
                    <td style="vertical-align: middle; border: none;">
                      <div style="
                        background-color: #f4f7ee;
                        border: 1px solid #d4dfc7;
                        border-radius: 8px;
                        padding: 5px 8px;
                      ">
                        <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; color: #43512b; line-height: 1.4; border: none;">
                          <tr>
                            <td style="padding: 1px 3px; border: none; width: 50%;">
                              <span>👤 <strong>Nutrióloga:</strong> ${TALIA_CLINICAL_CONTACT.nutriologa}</span>
                            </td>
                            <td style="padding: 1px 3px; border: none; width: 50%;">
                              <span>🪪 <strong>Cédula Profesional:</strong> ${TALIA_CLINICAL_CONTACT.cedula}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 3px; border: none;">
                              <span>📍 <strong>Dirección:</strong> ${TALIA_CLINICAL_CONTACT.direccion}</span>
                            </td>
                            <td style="padding: 1px 3px; border: none;">
                              <span>📞 <strong>Teléfono / Citas:</strong> ${TALIA_CLINICAL_CONTACT.telefono}</span>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding: 1px 3px; border: none;">
                              <span>✉️ <strong>Correo Electrónico:</strong> ${TALIA_CLINICAL_CONTACT.correo}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>

                    <!-- Logotipo Oficial Talia Tinoco -->
                    <td style="width: 65px; text-align: center; vertical-align: middle; padding-left: 6px; border: none;">
                      <img src="${TALIA_LOGO_BASE64}" style="width: 52px; height: 52px; object-fit: contain; display: inline-block;" alt="Talia Logo" />
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Exporta el menú a un documento Word (.doc compatible con MS Word) en orientación horizontal (Landscape)
   */
  public static exportMenuToWord(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu
  ): void {
    const htmlContent = this.generateClinicalMenuHtml(patient, plan, menu, { isForWord: true });

    const wordDocument = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${plan.nombre} - ${patient.nombre}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 11.0in 8.5in;
            mso-page-orientation: landscape;
            margin: 0.4in 0.4in 0.4in 0.4in;
            mso-header-margin: 0.2in;
            mso-footer-margin: 0.2in;
          }
          div.Section1 { page: Section1; }
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordDocument], {
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
   * Genera y descarga el PDF oficial membretado en orientación horizontal (Landscape)
   * con alta fidelidad gráfica (2x Retina DPI) y marca de agua institucional.
   */
  public static async exportMenuToPdf(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu
  ): Promise<void> {
    // 1. Contenedor temporal fuera de pantalla en coordenadas (0, 0) detrás de la aplicación
    const container = document.createElement('div');
    container.id = 'clinical-menu-pdf-export-container';
    container.style.position = 'fixed';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.width = '1200px';
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';

    container.innerHTML = this.generateClinicalMenuHtml(patient, plan, menu, { isForPdf: true });
    document.body.appendChild(container);

    const sheetEl = (container.firstElementChild as HTMLElement) || container;

    try {
      // 2. Esperar carga y decodificación completa de recursos de imagen dentro del contenedor
      const images = Array.from(container.querySelectorAll('img'));
      await Promise.all(
        images.map(async img => {
          if ('decode' in img) {
            try {
              await img.decode();
              return true;
            } catch {
              // fallback a onload
            }
          }
          if (img.complete && img.naturalWidth > 0) return true;
          return new Promise(resolve => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          });
        })
      );

      // Retardo para asegurar pintura de fuentes tipográficas y maquetación
      await new Promise(resolve => setTimeout(resolve, 120));

      // 3. Renderizar DOM a imagen JPEG de alta definición (2x DPI)
      let imgData = '';
      try {
        const canvas = await html2canvas(sheetEl, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: 1200,
          windowWidth: 1200
        });
        imgData = canvas.toDataURL('image/jpeg', 0.96);
      } catch (canvasErr) {
        console.warn('[MENU:EXPORT] html2canvas error, using toJpeg fallback:', canvasErr);
      }

      if (!imgData || imgData.length < 5000) {
        imgData = await toJpeg(sheetEl, {
          quality: 0.96,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
          width: 1200
        });
      }

      if (!imgData || imgData.length < 5000) {
        throw new Error('No se pudo generar la imagen del menú.');
      }

      // 4. Crear documento PDF en formato Letter Landscape (279.4 x 215.9 mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);

      const safeName = patient.nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/ +/g, '_');
      pdf.save(`Menu_${safeName}_${plan.calorias}kcal.pdf`);
    } catch (err: any) {
      console.error('[MENU:EXPORT] Error generando PDF horizontal:', err);
      alert('Ocurrió un error al generar el PDF del menú: ' + (err.message || err));
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }
}

