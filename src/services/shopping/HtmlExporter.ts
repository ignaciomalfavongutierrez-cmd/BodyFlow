import type { ShoppingListCalculationResult  } from '../../types/shoppingDiet';

export class HtmlExporter {
  public static generateStandaloneHtml(result: ShoppingListCalculationResult): string {
    const categoriesHtml = result.categories
      .map((group) => {
        const itemsHtml = group.items
          .map(
            (item) => `
          <tr class="item-row">
            <td class="checkbox-col"><input type="checkbox" /></td>
            <td class="item-name">
              <strong>${item.normalized_name}</strong>
              ${item.state !== 'raw' && item.state !== 'unspecified' ? `<span class="badge">${item.state}</span>` : ''}
              ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
            </td>
            <td class="item-qty"><strong>${item.purchase_quantity}</strong></td>
            <td class="item-detail">
              ${
                item.calculated_quantity !== null
                  ? `Base: ${item.calculated_quantity} ${item.unit} | Merma 10%: ${item.quantity_with_waste} ${item.unit}`
                  : 'Al gusto'
              }
            </td>
          </tr>`
          )
          .join('');

        return `
        <div class="category-block">
          <h2 class="category-title">${group.category.name}</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th>Producto</th>
                <th>Compra sugerida</th>
                <th>Detalle técnico</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>`;
      })
      .join('');

    const unspecifiedHtml =
      result.unspecified_items.length > 0
        ? `
      <div class="category-block">
        <h2 class="category-title" style="color: #d97706;">Cantidad No Especificada / Al Gusto</h2>
        <table class="items-table">
          <tbody>
            ${result.unspecified_items
              .map(
                (item) => `
              <tr class="item-row">
                <td class="checkbox-col"><input type="checkbox" /></td>
                <td class="item-name"><strong>${item.normalized_name}</strong></td>
                <td class="item-qty">Al gusto</td>
                <td class="item-detail">${item.notes || 'Cantidad no especificada'}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lista de Compras - ${result.diet_name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #16a34a;
      margin: 0 0 10px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
    }
    .meta-item label {
      display: block;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .category-block {
      margin-bottom: 30px;
    }
    .category-title {
      font-size: 18px;
      color: #0f172a;
      border-bottom: 2px solid #16a34a;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .items-table th {
      text-align: left;
      color: #64748b;
      font-weight: 600;
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .badge {
      display: inline-block;
      background: #e2e8f0;
      color: #334155;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
    }
    .item-notes {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .waste-note {
      margin-top: 40px;
      padding: 16px;
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 4px;
      font-size: 13px;
      color: #166534;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 0; }
      input[type="checkbox"] { border: 1px solid #000; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">LISTA DE COMPRAS</h1>
      <div class="meta-grid">
        <div class="meta-item">
          <label>Dieta</label>
          <strong>${result.diet_name}</strong>
        </div>
        <div class="meta-item">
          <label>Días Planificados</label>
          <strong>${result.total_days_planned || (result.selected_days.length * (result.cycle_multiplier || 1))} días ${result.cycle_multiplier && result.cycle_multiplier > 1 ? `(${result.cycle_multiplier} ciclos - ×${result.cycle_multiplier})` : ''}</strong>
        </div>
        <div class="meta-item">
          <label>Estrategia</label>
          <strong>${result.purchase_strategy}</strong>
        </div>
        <div class="meta-item">
          <label>Fecha</label>
          <strong>${result.generated_at}</strong>
        </div>
      </div>
    </div>

    ${categoriesHtml}
    ${unspecifiedHtml}

    <div style="margin-top: 25px; padding: 12px 18px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 13px; font-weight: 700; color: #92400e; font-style: italic; display: flex; justify-content: space-between; align-items: center;">
      <span>💪 "Disciplina hoy, resultados mañana."</span>
      <span style="font-size: 11px; text-transform: uppercase; color: #b45309;">Lic. N. Talia Tinoco Fabián • Céd. Prof. 11290678</span>
    </div>

    <div class="waste-note">
      <strong>NOTA IMPORTANTE:</strong> ${result.waste_note}
    </div>
    
    <div style="text-align: center; margin-top: 25px; font-size: 11px; color: #94a3b8; font-weight: 600;">
      NutriShop — Lic. N. Talia Tinoco Fabián • Cédula Profesional: 11290678 • Nutrición Clínica
    </div>
  </div>
</body>
</html>`;
  }

  public static downloadHtml(result: ShoppingListCalculationResult) {
    const content = this.generateStandaloneHtml(result);
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-de-compras-${result.diet_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
