<template>
  <div class="sheet-wrapper" id="printable-recommendation-sheet">
    
    <!-- Header Section -->
    <header class="sheet-header">
      <div class="logo-brand">
        <TaliaOfficialLogo :size="82" class="brand-logo-img" />
      </div>

      <div class="main-banner">
        <h2>Recomendaciones</h2>
        <p>{{ bannerSubtitle }}</p>
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
        <label for="patient-sheet-input"><strong>Paciente:</strong></label>
        <span v-if="isPrinting" class="patient-print-text">{{ patientName || 'Recomendaciones Generales' }}</span>
        <input 
          v-else
          id="patient-sheet-input"
          type="text" 
          :value="patientName"
          @input="$emit('update:patientName', ($event.target as HTMLInputElement).value)"
          class="patient-input no-print" 
          placeholder="Nombre del paciente (opcional)" 
        />
      </div>

      <div class="date-field">
        <strong>Fecha:</strong>
        <span class="date-display">{{ formattedDate }}</span>
      </div>

      <div class="objective-badge-field">
        <strong>Objetivo:</strong> 
        <span class="ms-1 objective-badge-text">{{ objective.badgeLabel }}</span>
      </div>
    </div>

    <!-- Specific Indications / Padecimientos (Conditional Highlight Box) -->
    <div v-if="specificIndications && specificIndications.trim()" class="special-notes-bar">
      <div class="special-notes-icon">
        <i class="fa-solid fa-stethoscope"></i>
      </div>
      <div class="special-notes-content">
        <span class="special-notes-title">Indicaciones Específicas / Padecimientos:</span>
        <span class="special-notes-text">{{ specificIndications }}</span>
      </div>
    </div>

    <!-- Sheet Content Cards: 2 Columns x 3 Rows -->
    <main class="sheet-body">
      <div class="recom-grid">
        <div
          v-for="card in cards"
          :key="card.id"
          class="recom-card"
          :class="{ highlight: card.highlight }"
        >
          <div class="card-header">
            <div class="card-icon-badge">
              <i :class="card.icon"></i>
            </div>
            <div class="card-title">{{ card.num }}. {{ card.title }}</div>
          </div>

          <ul class="recom-list">
            <li v-for="(item, idx) in card.items" :key="idx">
              <strong>{{ item.title }}</strong> {{ item.description }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Motivation & Commitment Bar -->
      <div class="summary-bar">
        <div class="highlight-text">
          <i class="fa-solid fa-seedling"></i>
          <span>{{ summaryText }}</span>
        </div>
        <div class="summary-tag">
          {{ summaryTag }}
        </div>
      </div>
    </main>

    <!-- Professional Footer with Contact Info -->
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
import type { RecommendationObjective, RecommendationCard } from '../../types/recommendations';
import TaliaOfficialLogo from '../common/TaliaOfficialLogo.vue';

const props = withDefaults(
  defineProps<{
    objective: RecommendationObjective;
    patientName?: string;
    specificIndications?: string;
    customCards?: RecommendationCard[];
    customBannerSubtitle?: string;
    customSummaryText?: string;
    customSummaryTag?: string;
    isAiAdapted?: boolean;
    isPrinting?: boolean;
  }>(),
  {
    patientName: '',
    specificIndications: '',
    customBannerSubtitle: '',
    customSummaryText: '',
    customSummaryTag: '',
    isAiAdapted: false,
    isPrinting: false,
  }
);

defineEmits<{
  (e: 'update:patientName', value: string): void;
}>();

const cards = computed(() => {
  return props.customCards && props.customCards.length > 0
    ? props.customCards
    : props.objective.cards;
});

const bannerSubtitle = computed(() => {
  return props.customBannerSubtitle || props.objective.bannerSubtitle;
});

const summaryText = computed(() => {
  return props.customSummaryText || props.objective.summaryText;
});

const summaryTag = computed(() => {
  return props.customSummaryTag || props.objective.summaryTag;
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

.apple-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text h1 {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #556637;
  text-transform: uppercase;
  line-height: 1.15;
  margin: 0;
}

.brand-text p {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #8c9b74;
  text-transform: uppercase;
  margin-top: 1px;
  margin-bottom: 0;
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
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin: 0;
}

.main-banner p {
  font-size: 9px;
  letter-spacing: 0.5px;
  font-weight: 600;
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

.patient-input::placeholder {
  color: #8fa074;
  font-weight: 400;
  font-style: italic;
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

/* Special notes / Padecimientos Bar */
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

.special-notes-text {
  font-weight: 600;
  color: #232d16;
}

/* Content Area */
.sheet-body {
  padding: 12px 24px 10px 24px;
}

/* Symmetrical Grid Layout: 2 Columns x 3 Rows with EQUAL heights */
.recom-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 10px 12px;
  align-items: stretch;
}

.recom-card {
  background: #ffffff;
  border: 1.2px solid #d3dec3;
  border-radius: 8px;
  padding: 9px 13px;
  box-shadow: 0 1px 3px rgba(100, 120, 70, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e7eee0;
  flex-shrink: 0;
}

.card-icon-badge {
  width: 22px;
  height: 22px;
  background: #7e9455;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  flex-shrink: 0;
}

.card-title {
  font-size: 10.5px;
  font-weight: 700;
  color: #48572b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.recom-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex: 1;
  gap: 5px;
}

.recom-list li {
  position: relative;
  padding-left: 13px;
  font-size: 9.1px;
  color: #364028;
  line-height: 1.35;
}

.recom-list li::before {
  content: "•";
  position: absolute;
  left: 2px;
  top: -1px;
  color: #7e9455;
  font-size: 13px;
  font-weight: bold;
}

.recom-list li strong {
  color: #243014;
  font-weight: 700;
}

.recom-card.highlight {
  background: linear-gradient(135deg, #f7f9f2 0%, #ffffff 100%);
  border: 1.2px solid #9fb084;
}

.recom-card.highlight .card-icon-badge {
  background: #5d713a;
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
  font-size: 9.2px;
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
  font-size: 8.5px;
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

.footer-logo-img {
  width: 32px;
  height: 32px;
  margin-bottom: 2px;
  display: block;
}

.footer-logo-title {
  font-size: 8.5px;
  font-weight: 800;
  color: #556637;
  letter-spacing: 0.6px;
}

.footer-logo-sub {
  font-size: 7px;
  font-weight: 600;
  color: #8c9b74;
  letter-spacing: 1.5px;
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
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .recom-card, .summary-bar, .contact-card, .sheet-footer, .sheet-header {
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
  .recom-grid {
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
  .footer-logo {
    margin-left: 0;
  }
}
</style>
