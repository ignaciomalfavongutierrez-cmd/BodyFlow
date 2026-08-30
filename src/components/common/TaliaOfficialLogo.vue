<template>
  <div class="inline-flex items-center justify-center shrink-0" :class="containerClass">
    <!-- SVG Vector Mode (Ideal for Watermarks & Scalable Backgrounds) -->
    <svg
      v-if="watermark || mode === 'svg'"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full h-full select-none"
      :class="imageClass"
      :style="svgStyle"
    >
      <g fill="none" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round">
        <!-- Leaf Top-Left -->
        <path
          d="M205 110 C185 70 230 45 260 60 C260 90 230 115 205 110 Z"
          :fill="fillColor"
        />
        <path d="M210 105 C230 85 245 72 255 65" :stroke-width="strokeWidth * 0.7" />

        <!-- Apple Stem -->
        <path d="M250 145 C250 98 272 75 292 68" :stroke-width="strokeWidth * 1.3" />

        <!-- Apple Outline & Contours -->
        <path
          d="M250 145
             C215 105 135 115 110 190
             C80 275 120 375 225 385
             C240 387 250 378 250 378
             C250 378 260 387 275 385
             C380 375 420 275 390 190
             C365 115 285 105 250 145 Z"
          :fill="fillColor"
        />

        <!-- Inner Artistic Contour / Infinity Flow -->
        <path
          d="M250 145
             C225 185 285 225 345 205
             C385 225 380 310 295 345
             C265 358 250 378 250 378"
        />

        <!-- Measuring Tape Ribbon Wrapped Around Apple -->
        <!-- Top Tape Line -->
        <path d="M95 270 C160 310 340 310 405 270" :stroke-width="strokeWidth * 1.1" />
        <!-- Bottom Tape Line -->
        <path d="M90 310 C155 350 345 350 410 310" :stroke-width="strokeWidth * 1.1" />
        <!-- Tape Ends -->
        <path d="M95 270 L90 310" />
        <path d="M405 270 L410 310" />

        <!-- Measuring Tape Tick Marks -->
        <line x1="125" y1="281" x2="125" y2="299" :stroke-width="strokeWidth * 0.9" />
        <line x1="150" y1="288" x2="150" y2="301" :stroke-width="strokeWidth * 0.6" />
        <line x1="175" y1="293" x2="175" y2="311" :stroke-width="strokeWidth * 0.9" />
        <line x1="200" y1="297" x2="200" y2="310" :stroke-width="strokeWidth * 0.6" />
        <line x1="225" y1="300" x2="225" y2="318" :stroke-width="strokeWidth * 0.9" />
        <line x1="250" y1="301" x2="250" y2="314" :stroke-width="strokeWidth * 0.6" />
        <line x1="275" y1="300" x2="275" y2="318" :stroke-width="strokeWidth * 0.9" />
        <line x1="300" y1="297" x2="300" y2="310" :stroke-width="strokeWidth * 0.6" />
        <line x1="325" y1="293" x2="325" y2="311" :stroke-width="strokeWidth * 0.9" />
        <line x1="350" y1="288" x2="350" y2="301" :stroke-width="strokeWidth * 0.6" />
        <line x1="375" y1="281" x2="375" y2="299" :stroke-width="strokeWidth * 0.9" />
      </g>

      <!-- Typography -->
      <g :fill="color" stroke="none">
        <text
          x="250"
          y="435"
          text-anchor="middle"
          font-family="'Outfit', system-ui, -apple-system, sans-serif"
          font-size="28"
          font-weight="800"
          letter-spacing="3"
        >
          TALIA TINOCO FABIÁN
        </text>
        <text
          x="250"
          y="472"
          text-anchor="middle"
          font-family="'Outfit', system-ui, -apple-system, sans-serif"
          font-size="18"
          font-weight="700"
          letter-spacing="10"
        >
          NUTRICIÓN
        </text>
      </g>
    </svg>

    <!-- Standard Raster Image Mode (Crisp Official PNG) -->
    <img
      v-else
      src="/talia-official-logo.png"
      alt="Lic. Talia Tinoco Fabián - Nutrición"
      :class="imageClass"
      :style="imageStyle"
      loading="eager"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    customClass?: string;
    showGlow?: boolean;
    shape?: 'none' | 'rounded' | 'circle';
    watermark?: boolean;
    mode?: 'image' | 'svg';
    color?: string;
    fillColor?: string;
    strokeWidth?: number;
  }>(),
  {
    size: 'md',
    customClass: '',
    showGlow: false,
    shape: 'none',
    watermark: false,
    mode: 'image',
    color: '#556637',
    fillColor: 'none',
    strokeWidth: 5.5
  }
);

const dimensionPx = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  switch (props.size) {
    case 'xs': return '28px';
    case 'sm': return '38px';
    case 'md': return '48px';
    case 'lg': return '64px';
    case 'xl': return '96px';
    default: return '48px';
  }
});

const imageStyle = computed(() => ({
  width: dimensionPx.value,
  height: dimensionPx.value,
  objectFit: 'contain' as const,
}));

const svgStyle = computed(() => {
  if (props.watermark) {
    return {
      width: '100%',
      height: '100%'
    };
  }
  return {
    width: dimensionPx.value,
    height: dimensionPx.value
  };
});

const containerClass = computed(() => [
  props.customClass,
  props.watermark ? 'w-full h-full' : '',
  props.showGlow ? 'drop-shadow-[0_4px_12px_rgba(85,102,55,0.25)]' : ''
]);

const imageClass = computed(() => [
  'select-none transition-transform duration-200 object-contain',
  props.shape === 'circle' ? 'rounded-full' : (props.shape === 'rounded' ? 'rounded-xl' : '')
]);
</script>
