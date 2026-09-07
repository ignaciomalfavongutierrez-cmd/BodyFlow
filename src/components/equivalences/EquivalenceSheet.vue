<template>
  <div class="sheet-wrapper" id="printable-equivalence-sheet">
    
    <!-- Header Section (Identical branding to RecommendationSheet and Clinical Menu) -->
    <header class="sheet-header">
      <div class="logo-brand">
        <TaliaOfficialLogo :size="82" class="brand-logo-img" />
      </div>

      <div class="main-banner">
        <h2>Sistema de Equivalencias</h2>
        <p>GUÍA CLÍNICA DE INTERCAMBIO DE ALIMENTOS (SMAE)</p>
      </div>

      <div class="cedula-box">
        <div class="cedula-label">
          <i class="fa-solid fa-id-card"></i> Cédula Prof.
        </div>
        <div class="cedula-number">11290678</div>
      </div>
    </header>

    <!-- Patient Metadata Row with Auto-Date -->
    <div class="patient-bar" :class="{ 'no-patient': !patientName && isPrinting }">
      <div class="patient-field" v-if="patientName || !isPrinting">
        <label for="patient-equiv-input"><strong>Paciente:</strong></label>
        <span v-if="isPrinting" class="patient-print-text">{{ patientName || 'Guía Clínica General' }}</span>
        <input 
          v-else
          id="patient-equiv-input"
          type="text" 
          :value="patientName"
          @input="$emit('update:patientName', ($event.target as HTMLInputElement).value)"
          class="patient-input no-print" 
          placeholder="Nombre del paciente (o dejar en blanco para guía general)" 
        />
      </div>

      <div class="date-field">
        <strong>Fecha:</strong>
        <span class="date-display">{{ formattedDate }}</span>
      </div>

      <div class="objective-badge-field">
        <strong>Referencia:</strong> 
        <span class="ms-1 objective-badge-text">SMAE Oficial 5ª Ed.</span>
      </div>
    </div>

    <!-- Clinical Exchange Rule Highlight Bar -->
    <div class="special-notes-bar">
      <div class="special-notes-icon">
        <i class="fa-solid fa-scale-balanced"></i>
      </div>
      <div class="special-notes-content">
        <span class="special-notes-title">Regla de Intercambio Clínico:</span>
        <span class="special-notes-text">
          Los alimentos dentro del mismo grupo aportan un valor nutricional similar y pueden sustituirse libremente en la porción indicada sin alterar tus calorías ni tus macronutrientes meta.
        </span>
      </div>
    </div>

    <!-- Specific Indications / Medical Notes (Conditional) -->
    <div v-if="specificIndications && specificIndications.trim()" class="special-notes-bar custom-indications">
      <div class="special-notes-icon indications-icon">
        <i class="fa-solid fa-stethoscope"></i>
      </div>
      <div class="special-notes-content">
        <span class="special-notes-title">Indicación Nutricional Personalizada:</span>
        <span class="special-notes-text">{{ specificIndications }}</span>
      </div>
    </div>

    <!-- Sheet Content Cards: 2 Columns Symmetrical Grid for the Groups -->
    <main class="sheet-body">
      <div class="equiv-grid">
        <div
          v-for="group in groupsToRender"
          :key="group.key"
          class="equiv-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-header-left">
              <span class="group-icon">{{ group.icon }}</span>
              <div class="card-title">{{ group.nombre }}</div>
            </div>
            <div class="macro-badge">
              ~{{ group.macrosPromedio.calories }} kcal | {{ group.macrosPromedio.protein }}g P | {{ group.macrosPromedio.carbs }}g C | {{ group.macrosPromedio.fat }}g G
            </div>
          </div>

          <!-- Group Subtitle Rule -->
          <div class="group-rule-hint">
            <strong>1 Equivalente = </strong> {{ group.reglaIntercambio }}
          </div>

          <!-- Food Items List -->
          <ul class="equiv-list">
            <li v-for="item in group.alimentos" :key="item.id">
              <div class="item-line">
                <span class="item-name"><strong>{{ item.nombre }}:</strong> {{ item.porcion }}</span>
                <span v-if="item.nota" class="item-tag">{{ item.nota }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Motivation & Commitment Bar -->
      <div class="summary-bar">
        <div class="highlight-text">
          <i class="fa-solid fa-seedling"></i>
          <span>Elige variedad en cada grupo para asegurar un aporte óptimo de vitaminas, minerales y fibra dietética.</span>
        </div>
        <div class="summary-tag">
          Variedad & Equilibrio Nutricional
        </div>
      </div>
    </main>

    <!-- Professional Footer with Contact Info (Identical to RecommendationSheet) -->
    <footer class="sheet-footer">
      <div class="contact-card">
        <div class="contact-grid">
          <div class="contact-item">
            <i class="fa-solid fa-user-doctor"></i>
            <span><strong>Nutrióloga:</strong> Lic. N. Talia Tinoco Fabián</span>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-id-badge"></i>
            <span><strong>Cédula Profesional:</strong> 11290678</span>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-location-dot"></i>
            <span><strong>Dirección:</strong> AND. Emiliano Zapata No. 2, col. Obrera, Santa Clara</span>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-phone"></i>
            <span><strong>Teléfono / Citas:</strong> 3541009737</span>
          </div>
          <div class="contact-item span-2">
            <i class="fa-solid fa-envelope"></i>
            <span><strong>Correo Electrónico:</strong> lic.n.talia@gmail.com</span>
          </div>
        </div>
      </div>

      <div class="footer-logo">
        <TaliaOfficialLogo :size="100" class="footer-logo-img" />
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EquivalenceGroup } from '../../types/equivalences';
import { SMAE_EQUIVALENCE_GROUPS } from '../../catalog/nutrition/equivalencesCatalog';
import TaliaOfficialLogo from '../common/TaliaOfficialLogo.vue';

const props = withDefaults(
  defineProps<{
    patientName?: string;
    specificIndications?: string;
    selectedGroups?: string[];
    isPrinting?: boolean;
  }>(),
  {
    patientName: '',
    specificIndications: '',
    selectedGroups: () => [],
    isPrinting: false
  }
);

defineEmits<{
  (e: 'update:patientName', value: string): void;
}>();

const groupsToRender = computed<EquivalenceGroup[]>(() => {
  if (props.selectedGroups && props.selectedGroups.length > 0) {
    return SMAE_EQUIVALENCE_GROUPS.filter(g => props.selectedGroups.includes(g.key));
  }
  return SMAE_EQUIVALENCE_GROUPS;
});

const formattedDate = computed(() => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const now = new Date();
  const dia = now.getDate();
  const mes = meses[now.getMonth()];
  const anio = now.getFullYear();
  return `${dia} de ${mes}, ${anio}`;
});
</script>

<style scoped>
/* Scoped typography & color tokens matching Lic. Talia's branding */
.sheet-wrapper {
  --primary-green: #556637;
  --primary-dark: #3b4625;
  --primary-light: #eef3e5;
  --accent-sage: #8c9b74;
  --soft-banner: #d7dac3;
  --border-green: #cad7b7;
  --text-dark: #2b351e;
  --text-muted: #5e6950;
  --bg-cream: #fafbf7;

  font-family: 'Montserrat', sans-serif;
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  background: var(--bg-cream);
  color: var(--text-dark);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d8dfcc;
  position: relative;
  line-height: 1.35;
  text-align: left;
  box-sizing: border-box;
}

/* Header Section */
.sheet-header {
  padding: 14px 24px 12px 24px;
  display: grid;
  grid-template-columns: 210px 1fr 150px;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-bottom: 2px solid var(--border-green);
}

.logo-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-banner {
  background: var(--soft-banner);
  color: #3b4625;
  text-align: center;
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.main-banner h2 {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin: 0;
}

.main-banner p {
  font-size: 8.5px;
  letter-spacing: 0.5px;
  font-weight: 700;
  margin-top: 1px;
  margin-bottom: 0;
  color: #536037;
}

.cedula-box {
  border: 1.2px solid #bdcbb0;
  background: #fbfcf9;
  border-radius: 6px;
  padding: 5px 8px;
  text-align: right;
}

.cedula-label {
  font-size: 8px;
  font-weight: 600;
  color: #7b8a65;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.cedula-number {
  font-size: 12.5px;
  font-weight: 800;
  color: #3f4e24;
  letter-spacing: 0.4px;
}

/* Patient Metadata Bar */
.patient-bar {
  background: #eef3e5;
  border-bottom: 1px solid var(--border-green);
  padding: 6px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #495730;
  font-weight: 600;
  gap: 12px;
  transition: all 0.3s ease;
}

.patient-field {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.patient-input {
  border: none;
  border-bottom: 1.5px dashed #899c68;
  background: transparent;
  padding: 2px 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #2b351e;
  width: 100%;
  max-width: 320px;
  outline: none;
  transition: all 0.2s;
}

.patient-input:focus {
  border-bottom: 1.5px solid #5d713a;
  background: #ffffff;
  border-radius: 3px 3px 0 0;
}

.patient-print-text {
  font-weight: 700;
  color: #2b351e;
  font-size: 11px;
}

.date-field {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.date-display {
  font-weight: 700;
  color: #3f4e24;
  background: #ffffff;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #cad7b7;
  font-size: 10.5px;
}

.objective-badge-field {
  flex-shrink: 0;
}

.objective-badge-text {
  font-weight: 600;
  color: #536336;
}

/* Special notes / Regla de intercambio bar */
.special-notes-bar {
  background: linear-gradient(135deg, #f3f7ea 0%, #ebf2df 100%);
  border-bottom: 1.5px dashed #9eb084;
  padding: 6px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 9.5px;
  color: #394723;
}

.special-notes-bar.custom-indications {
  background: #fffbeb;
  border-bottom-color: #fcd34d;
  color: #78350f;
}

.special-notes-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6e844b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}

.special-notes-icon.indications-icon {
  background: #d97706;
}

.special-notes-content {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.special-notes-title {
  font-weight: 800;
  text-transform: uppercase;
  color: #405228;
  letter-spacing: 0.3px;
}

.custom-indications .special-notes-title {
  color: #92400e;
}

.special-notes-text {
  font-weight: 600;
  color: #232d16;
}

.custom-indications .special-notes-text {
  color: #451a03;
}

/* Content Area */
.sheet-body {
  padding: 12px 24px 10px 24px;
}

/* 2 Columns Symmetrical Grid */
.equiv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 12px;
  align-items: stretch;
}

.equiv-card {
  background: #ffffff;
  border: 1.2px solid #d3dec3;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(100, 120, 70, 0.03);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e7eee0;
  flex-shrink: 0;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-icon {
  font-size: 13px;
}

.card-title {
  font-size: 10.5px;
  font-weight: 800;
  color: #48572b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.macro-badge {
  font-size: 7.8px;
  font-weight: 700;
  color: #4f6333;
  background: #f1f5eb;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #d5e0cc;
  white-space: nowrap;
}

.group-rule-hint {
  font-size: 8.2px;
  color: #556637;
  background: #fafcf7;
  padding: 3px 6px;
  border-radius: 4px;
  border-left: 2px solid #7e9455;
  margin-bottom: 6px;
  line-height: 1.25;
}

.equiv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.equiv-list li {
  position: relative;
  padding-left: 11px;
  font-size: 8.8px;
  color: #364028;
  line-height: 1.3;
}

.equiv-list li::before {
  content: "•";
  position: absolute;
  left: 2px;
  top: -1px;
  color: #7e9455;
  font-size: 12px;
  font-weight: bold;
}

.item-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6px;
}

.item-name strong {
  color: #243014;
  font-weight: 700;
}

.item-tag {
  font-size: 7.5px;
  color: #6b7c53;
  font-style: italic;
  white-space: nowrap;
}

/* Summary Bar */
.summary-bar {
  margin-top: 10px;
  border: 1.2px solid #8e9f69;
  background: #ffffff;
  padding: 7px 14px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  font-weight: 700;
  color: #435227;
}

.summary-bar .highlight-text {
  color: #4e6030;
  display: flex;
  align-items: center;
  gap: 6px;
}

.summary-tag {
  font-size: 8.2px;
  text-transform: uppercase;
  color: #556637;
  letter-spacing: 0.5px;
}

/* Professional Footer */
.sheet-footer {
  margin-top: 6px;
  border-top: 1.5px solid var(--border-green);
  background: #ffffff;
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-card {
  background: #f4f7ee;
  border-radius: 6px;
  padding: 6px 12px;
  border: 1px solid #d4dfc7;
  max-width: 580px;
  flex: 1;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px 14px;
  font-size: 8.8px;
  color: #43512b;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.contact-item i {
  color: #7b9252;
  font-size: 9px;
  width: 12px;
  text-align: center;
}

.contact-item strong {
  color: #2c361c;
}

.contact-item.span-2 {
  grid-column: span 2;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-left: 15px;
}

/* Print & PDF optimization */
@page {
  size: letter portrait;
  margin: 4mm;
}

@media print {
  .sheet-wrapper {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    background: #fafbf7 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .equiv-card, .summary-bar, .contact-card, .sheet-footer, .sheet-header {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}

@media (max-width: 768px) {
  .sheet-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 8px;
  }
  .logo-brand {
    justify-content: center;
  }
  .cedula-box {
    text-align: center;
  }
  .equiv-grid {
    grid-template-columns: 1fr;
  }
  .patient-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .sheet-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  .contact-grid {
    grid-template-columns: 1fr;
  }
  .contact-item {
    justify-content: center;
  }
}
</style>
