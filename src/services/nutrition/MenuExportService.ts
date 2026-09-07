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

export interface MealSectionDef {
  key: string;
  aliasKeys?: string[];
  label: string;
  dotColor: string;
  bg: string;
  textColor: string;
  icon: string;
  defaultTime?: string;
}

export const CLINICAL_MEAL_STYLE_PRESETS: Record<string, { dotColor: string; bg: string; textColor: string; icon: string; label: string; defaultTime?: string; aliasKeys?: string[] }> = {
  desayuno: {
    label: 'DESAYUNO',
    icon: '🍳',
    defaultTime: '08:30 AM',
    dotColor: '#0284c7',
    bg: '#f0f9ff',
    textColor: '#0369a1',
    aliasKeys: ['desayuno', 'breakfast']
  },
  almuerzo: {
    label: 'COLACIÓN MATUTINA',
    icon: '🍏',
    defaultTime: '11:30 AM',
    dotColor: '#16a34a',
    bg: '#f0fdf4',
    textColor: '#15803d',
    aliasKeys: ['almuerzo', 'colacion_1', 'snack_1', 'snack_matutino', 'media_manana']
  },
  colacion_1: {
    label: 'COLACIÓN MATUTINA',
    icon: '🍏',
    defaultTime: '11:30 AM',
    dotColor: '#16a34a',
    bg: '#f0fdf4',
    textColor: '#15803d',
    aliasKeys: ['colacion_1', 'almuerzo', 'snack_1', 'snack_matutino', 'media_manana']
  },
  comida: {
    label: 'COMIDA',
    icon: '🍲',
    defaultTime: '02:30 PM',
    dotColor: '#ea580c',
    bg: '#fff7ed',
    textColor: '#c2410c',
    aliasKeys: ['comida', 'lunch']
  },
  colacion_2: {
    label: 'COLACIÓN VESPERTINA',
    icon: '🥜',
    defaultTime: '05:30 PM',
    dotColor: '#d97706',
    bg: '#fffbeb',
    textColor: '#b45309',
    aliasKeys: ['colacion_2', 'colacion', 'snack_2', 'snack_vespertino', 'merienda']
  },
  colacion: {
    label: 'COLACIÓN VESPERTINA',
    icon: '🥜',
    defaultTime: '05:30 PM',
    dotColor: '#d97706',
    bg: '#fffbeb',
    textColor: '#b45309',
    aliasKeys: ['colacion', 'colacion_2', 'snack_2', 'snack_vespertino', 'merienda']
  },
  cena: {
    label: 'CENA',
    icon: '🥗',
    defaultTime: '08:30 PM',
    dotColor: '#ca8a04',
    bg: '#fefce8',
    textColor: '#a16207',
    aliasKeys: ['cena', 'dinner']
  },
  snack: {
    label: 'SNACK',
    icon: '🍵',
    defaultTime: '10:00 PM',
    dotColor: '#7c3aed',
    bg: '#f5f3ff',
    textColor: '#6d28d9',
    aliasKeys: ['snack', 'colacion_nocturna', 'snack_opcional']
  },
  pre_entreno: {
    label: 'PRE-ENTRENO',
    icon: '⚡',
    defaultTime: '06:30 AM',
    dotColor: '#dc2626',
    bg: '#fef2f2',
    textColor: '#b91c1c',
    aliasKeys: ['pre_entreno', 'pre_workout']
  },
  post_entreno: {
    label: 'POST-ENTRENO',
    icon: '🥤',
    defaultTime: '10:00 AM',
    dotColor: '#0891b2',
    bg: '#ecfeff',
    textColor: '#0e7490',
    aliasKeys: ['post_entreno', 'post_workout']
  }
};

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
  /**
   * Resuelve dinámicamente los tiempos de comida a renderizar según la configuración del menú,
   * las comidas sugeridas del plan o los platillos existentes en los días.
   */
  public static getActiveMealSections(plan: PatientDietPlan, menu: DietPlanMenu): MealSectionDef[] {
    const sections: MealSectionDef[] = [];
    const addedKeys = new Set<string>();

    // 1. Si el menú tiene tiempos configurados explícitamente (ej. diseñador de menús)
    if (menu && menu.tiemposComidaConfig && menu.tiemposComidaConfig.length > 0) {
      menu.tiemposComidaConfig.forEach(cfg => {
        const preset = CLINICAL_MEAL_STYLE_PRESETS[cfg.key] || {
          label: (cfg.label || cfg.key).toUpperCase(),
          icon: cfg.icon || '🍽️',
          defaultTime: cfg.defaultTime,
          dotColor: '#0d9488',
          bg: '#f0fdfa',
          textColor: '#0f766e',
          aliasKeys: [cfg.key]
        };
        sections.push({
          key: cfg.key,
          aliasKeys: preset.aliasKeys || [cfg.key],
          label: (cfg.label || preset.label || cfg.key).toUpperCase(),
          dotColor: preset.dotColor,
          bg: preset.bg,
          textColor: preset.textColor,
          icon: cfg.icon || preset.icon || '🍽️',
          defaultTime: cfg.defaultTime || preset.defaultTime
        });
        addedKeys.add(cfg.key);
        if (preset.aliasKeys) {
          preset.aliasKeys.forEach(k => addedKeys.add(k));
        }
      });
      return sections;
    }

    // 2. Si hay lista de claves específicas en menu.tiemposComida
    if (menu && menu.tiemposComida && menu.tiemposComida.length > 0) {
      menu.tiemposComida.forEach(key => {
        const preset = CLINICAL_MEAL_STYLE_PRESETS[key];
        if (preset && !addedKeys.has(key)) {
          sections.push({
            key,
            aliasKeys: preset.aliasKeys || [key],
            label: preset.label,
            dotColor: preset.dotColor,
            bg: preset.bg,
            textColor: preset.textColor,
            icon: preset.icon,
            defaultTime: preset.defaultTime
          });
          addedKeys.add(key);
          if (preset.aliasKeys) {
            preset.aliasKeys.forEach(k => addedKeys.add(k));
          }
        }
      });
      if (sections.length > 0) return sections;
    }

    // 3. Si no hay configuración previa, utilizar plan.comidasSugeridas (ej. 3, 4, 5, 6)
    const targetMealsCount = plan.comidasSugeridas || 5;

    let targetKeys: string[] = [];
    if (targetMealsCount === 3) {
      targetKeys = ['desayuno', 'comida', 'cena'];
    } else if (targetMealsCount === 4) {
      targetKeys = ['desayuno', 'colacion_1', 'comida', 'cena'];
    } else if (targetMealsCount === 6) {
      targetKeys = ['desayuno', 'colacion_1', 'comida', 'colacion_2', 'cena', 'snack'];
    } else {
      // 5 comidas estándar
      targetKeys = ['desayuno', 'colacion_1', 'comida', 'colacion_2', 'cena'];
    }

    targetKeys.forEach(key => {
      const preset = CLINICAL_MEAL_STYLE_PRESETS[key];
      if (preset && !addedKeys.has(key)) {
        sections.push({
          key,
          aliasKeys: preset.aliasKeys || [key],
          label: preset.label,
          dotColor: preset.dotColor,
          bg: preset.bg,
          textColor: preset.textColor,
          icon: preset.icon,
          defaultTime: preset.defaultTime
        });
        addedKeys.add(key);
        if (preset.aliasKeys) {
          preset.aliasKeys.forEach(k => addedKeys.add(k));
        }
      }
    });

    // 4. Verificación de seguridad: si algún día tiene platillos registrados en otra categoría, incluirla
    if (menu && menu.dias) {
      menu.dias.forEach(dia => {
        if (dia.comidas) {
          Object.entries(dia.comidas).forEach(([catKey, dishes]) => {
            if (dishes && dishes.length > 0 && !addedKeys.has(catKey)) {
              const preset = CLINICAL_MEAL_STYLE_PRESETS[catKey] || {
                label: catKey.toUpperCase(),
                icon: '🍽️',
                dotColor: '#6366f1',
                bg: '#eef2ff',
                textColor: '#4338ca',
                aliasKeys: [catKey]
              };
              sections.push({
                key: catKey,
                aliasKeys: preset.aliasKeys || [catKey],
                label: preset.label || catKey.toUpperCase(),
                dotColor: preset.dotColor,
                bg: preset.bg,
                textColor: preset.textColor,
                icon: preset.icon || '🍽️',
                defaultTime: preset.defaultTime
              });
              addedKeys.add(catKey);
            }
          });
        }
      });
    }

    return sections;
  }

  /**
   * Genera recomendaciones clínicas automáticas coherentes con el objetivo del plan
   */
  private static getClinicalGuidelines(plan: PatientDietPlan): string[] {
    const obj = (plan.objetivo || '').toLowerCase();
    if (obj.includes('grasa') || obj.includes('déficit') || obj.includes('deficit') || obj.includes('peso')) {
      return [
        'Déficit energético moderado para oxidación de tejido graso preservando masa muscular magra.',
        'Priorizar fuentes abundantes de vegetales, fibra dietética saciante e hidratación constante (mín. 2.5L/día).'
      ];
    }
    if (obj.includes('hipertrofia') || obj.includes('músculo') || obj.includes('musculo') || obj.includes('masa')) {
      return [
        'Aporte proteico óptimo y superávit energético para favorecer la síntesis de masa muscular magra.',
        'Distribuir carbohidratos complejos antes y después del entrenamiento de fuerza; cuidar descanso reparador (7–8h).'
      ];
    }
    if (obj.includes('recomposic')) {
      return [
        'Distribución armónica de macronutrientes para apoyar la recomposición corporal activa y rendimiento físico.',
        'Entrenamiento de fuerza regular con progresión en cargas y apego constante a las porciones indicadas.'
      ];
    }
    if (obj.includes('digestiv') || obj.includes('gastrit') || obj.includes('refluj') || obj.includes('clínic') || obj.includes('clinic')) {
      return [
        'Selección de alimentos de fácil digestión, preparaciones a la plancha o vapor y bajo contenido de grasas irritantes.',
        'Masticar pausadamente cada alimento y respetar horarios regulares para desinflamación y confort digestivo.'
      ];
    }
    if (obj.includes('rendimiento') || obj.includes('deport') || obj.includes('atleta')) {
      return [
        'Disponibilidad óptima de glucógeno y electrolitos para sostener sesiones de alta exigencia física.',
        'Estrategia de timing nutricional peri-entrenamiento y recuperación muscular acelerada.'
      ];
    }
    return [
      'Distribución balanceada de macronutrientes para sostener niveles estables de energía, saciedad y bienestar.',
      'Mantener hidratación constante, seleccionar ingredientes naturales y evitar ultraprocesados añadidos.'
    ];
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
    options: { isForPdf?: boolean; isForWord?: boolean; isForPreview?: boolean } = {}
  ): string {
    const displayDays = this.getNormalizedDisplayDays(menu);
    const numCols = displayDays.length;
    const colWidthPct = (100 / numCols).toFixed(2);

    // Detección dinámica de secciones activas según el plan y menú
    const sectionsToRender = this.getActiveMealSections(plan, menu);
    const isFewMeals = sectionsToRender.length <= 3;
    const cellPadding = isFewMeals ? '7px 6px' : '4px 6px';

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

    // Para cada tiempo de comida activo: barra de categoría con icono y horario + celdas por día
    sectionsToRender.forEach(sec => {
      // 1. Barra de sección de comida con icono nítido y horario
      tableBodyHtml += `
        <tr style="background-color: ${sec.bg};">
          <td colspan="${numCols}" style="padding: 3px 10px; border: 1px solid #cbd5e1; border-top: 1.5px solid #94a3b8; text-align: left;">
            <table style="width: 100%; border-collapse: collapse; border: none;">
              <tr>
                <td style="text-align: left; vertical-align: middle; border: none; padding: 0;">
                  <span style="font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', sans-serif; font-size: 13px; line-height: 1; vertical-align: middle; margin-right: 5px; display: inline-block;">${sec.icon || '🍽️'}</span>
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${sec.dotColor}; vertical-align: middle; margin-right: 5px;"></span>
                  <span style="font-size: 9.5px; font-weight: 900; color: ${sec.textColor}; letter-spacing: 0.8px; text-transform: uppercase; vertical-align: middle;">
                    ${sec.label}
                  </span>
                </td>
                ${sec.defaultTime ? `
                  <td style="text-align: right; vertical-align: middle; border: none; padding: 0;">
                    <span style="font-size: 8.5px; font-weight: 800; color: ${sec.textColor}; opacity: 0.85; letter-spacing: 0.4px;">
                      ⏰ ${sec.defaultTime}
                    </span>
                  </td>
                ` : ''}
              </tr>
            </table>
          </td>
        </tr>
      `;

      // 2. Fila con las celdas de cada día
      tableBodyHtml += `
        <tr>
          ${displayDays.map(day => {
            const dishes = this.getDishesForSection(day.comidas, sec);
            return `
              <td style="border: 1px solid #cbd5e1; padding: ${cellPadding}; vertical-align: top; background-color: transparent; font-size: 8.5px; line-height: 1.35; color: #1e293b;">
                ${this.renderDishesCellHtml(dishes)}
              </td>
            `;
          }).join('')}
        </tr>
      `;
    });

    tableBodyHtml += `</tbody>`;

    const guidelines = this.getClinicalGuidelines(plan);

    const containerStyle = options.isForWord
      ? `width: 100%; box-sizing: border-box; padding: 6px 10px; background-color: #ffffff; font-family: 'Calibri', 'Arial', sans-serif; color: #0f172a;`
      : options.isForPdf
        ? `width: 1200px; min-width: 1200px; min-height: 840px; box-sizing: border-box; padding: 18px 24px; background-color: #ffffff; position: relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Outfit', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; overflow: hidden;`
        : `width: 100%; max-width: 1200px; min-height: 760px; box-sizing: border-box; padding: 18px 24px; background-color: #ffffff; position: relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Outfit', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; overflow: hidden; margin: 0 auto;`;

    const watermarkHtml = options.isForWord ? '' : `
      <!-- MARCA DE AGUA CENTRAL (Manzana Talia Tinoco - Perfectamente centrada sobre la tabla) -->
      <div style="
        position: absolute;
        top: 52%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 440px;
        max-width: 48%;
        pointer-events: none;
        z-index: 10;
        text-align: center;
      ">
        <img src="${TALIA_WATERMARK_BASE64}" style="width: 100%; height: auto; object-fit: contain; display: block;" alt="Marca de Agua" />
      </div>
    `;

    return `
      <div class="clinical-sheet-container" style="${containerStyle}">
        ${watermarkHtml}

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
            <td style="width: 32%; vertical-align: middle; border: none; text-align: left;">
              <table style="border-collapse: collapse; border: none;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px; border: none;">
                    <img src="${TALIA_LOGO_BASE64}" style="width: 48px; height: 48px; object-fit: contain; display: block;" alt="Talia Logo" />
                  </td>
                  <td style="vertical-align: middle; border: none;">
                    <div style="font-size: 13.5px; font-weight: 900; color: #43512b; letter-spacing: 0.8px; line-height: 1.15; white-space: nowrap;">TALIA TINOCO FABIÁN</div>
                    <div style="font-size: 8px; font-weight: 800; color: #687e43; letter-spacing: 2.8px; text-transform: uppercase; margin-top: 2px;">NUTRICIÓN CLÍNICA & DEPORTIVA</div>
                  </td>
                </tr>
              </table>
            </td>

            <!-- Centro: Banner Verde Salvia "MENÚ" (Geométricamente centrado en todo entorno) -->
            <td style="width: 36%; vertical-align: middle; border: none; text-align: center;">
              <table style="display: inline-table; margin: 0 auto; border-collapse: collapse; border: none; background-color: #a8b792; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                <tr>
                  <td style="height: 32px; vertical-align: middle; text-align: center; padding: 0 40px; border: none; font-size: 16px; font-weight: 900; color: #1a2512; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1;">
                    M&nbsp;&nbsp;E&nbsp;&nbsp;N&nbsp;&nbsp;Ú
                  </td>
                </tr>
              </table>
            </td>

            <!-- Derecha: Recuadro Cédula Profesional -->
            <td style="width: 32%; vertical-align: middle; border: none; text-align: right;">
              <div style="
                display: inline-block;
                border: 1.5px solid #cbd5e1;
                border-radius: 8px;
                padding: 4px 14px;
                background-color: #ffffff;
                text-align: center;
              ">
                <div style="font-size: 7.5px; font-weight: 800; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase;">
                  CÉDULA PROFESIONAL
                </div>
                <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 1px;">
                  ${TALIA_CLINICAL_CONTACT.cedula}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- SUB-BARRA METADATOS DEL PACIENTE (Caja clínica estilizada y perfectamente alineada) -->
        <div style="
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          background-color: #f8fafc;
          margin-bottom: 8px;
          padding: 6px 14px;
          position: relative;
          z-index: 2;
        ">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="width: 28%; text-align: left; vertical-align: middle; border: none;">
                <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">PACIENTE</div>
                <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 1px;">${patient.nombre}</div>
              </td>
              <td style="width: 32%; text-align: left; vertical-align: middle; border: none;">
                <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">PLAN ASIGNADO</div>
                <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 1px;">${plan.nombre}</div>
              </td>
              <td style="width: 24%; text-align: left; vertical-align: middle; border: none;">
                <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">OBJETIVO CLÍNICO</div>
                <div style="font-size: 11px; font-weight: 800; color: #15803d; margin-top: 1px;">🎯 ${plan.objetivo || 'Personalizado'}</div>
              </td>
              <td style="width: 16%; text-align: right; vertical-align: middle; border: none;">
                <div style="font-size: 7.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px;">FECHA</div>
                <div style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 1px;">📅 ${plan.fechaAsignacion}</div>
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
            <!-- Caja Izquierda: Calorías, Macronutrientes e Indicaciones Clínicas Dinámicas -->
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
                <div style="font-size: 11px; font-weight: 900; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.2px;">
                  ⚡ ${plan.calorias.toLocaleString()} kcal: ${plan.macros.protein}g proteína • ${plan.macros.carbs}g carbohidratos • ${plan.macros.fat}g grasas
                </div>
                <ul style="
                  margin: 0;
                  padding-left: 14px;
                  font-size: 8px;
                  color: #334155;
                  line-height: 1.35;
                  list-style-type: circle;
                ">
                  ${guidelines.map(g => `<li style="margin-bottom: 2px;">${g}</li>`).join('')}
                  <li style="color: #0369a1; font-weight: 700; margin-bottom: 2px;">
                    🍽️ Estructura: ${sectionsToRender.length} tiempos de comida al día (${sectionsToRender.map(s => `${s.icon} ${s.label}`).join(' • ')}).
                  </li>
                  ${plan.notas ? `<li style="margin-top: 2.5px; color: #047857; font-weight: 700;"><strong>💡 Indicaciones clínicas del profesional:</strong> ${plan.notas}</li>` : ''}
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
            margin: 0.3in 0.3in 0.3in 0.3in;
            mso-header-margin: 0.1in;
            mso-footer-margin: 0.1in;
          }
          div.Section1 { 
            page: Section1; 
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
        </style>
      </head>
      <body><div class="Section1">${htmlContent}</div></body>
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
   * con alta fidelidad gráfica (2x Retina DPI) idéntica a la vista previa.
   */
  public static async exportMenuToPdf(
    patient: Patient,
    plan: PatientDietPlan,
    menu: DietPlanMenu
  ): Promise<void> {
    // 1. Contenedor temporal fuera de pantalla montado en plano visible para la GPU
    const container = document.createElement('div');
    container.id = 'clinical-menu-pdf-export-container';
    container.style.position = 'fixed';
    container.style.top = '0px';
    container.style.left = '-99999px';
    container.style.width = '1200px';
    container.style.backgroundColor = '#ffffff';
    container.style.zIndex = '9999';
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
      await new Promise(resolve => setTimeout(resolve, 150));

      // 3. Renderizar DOM nativo a imagen JPEG de alta definición (2x DPI) usando motor nativo del navegador
      let imgData = '';
      try {
        imgData = await toJpeg(sheetEl, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
          width: 1200
        });
      } catch (toJpegErr) {
        console.warn('[MENU:EXPORT] toJpeg error, using html2canvas fallback:', toJpegErr);
        const canvas = await html2canvas(sheetEl, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          width: 1200,
          windowWidth: 1200
        });
        imgData = canvas.toDataURL('image/jpeg', 0.96);
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

