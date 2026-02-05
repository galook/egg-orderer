<template>
  <div class="egg" :class="type">
    <div class="shell"></div>
    <div class="white"></div>
    <div class="yolk"></div>
    <div class="shine"></div>
    <div class="steam"></div>
  </div>
</template>

<script setup lang="ts">
import type { EggType } from "~/utils/egg";

defineProps<{ type: EggType }>();
</script>

<style scoped>
.egg {
  width: 76px;
  height: 94px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 40px 40px 46px 46px;
  background: #fff9f0;
  border: 2px solid #f2e2d4;
  overflow: hidden;
  --shell-start: #fffdfa;
  --shell-end: #f5e8da;
  --yolk-start: #ffe89b;
  --yolk-end: #f9a03f;
}

.shell {
  position: absolute;
  inset: 6px;
  border-radius: 36px 36px 42px 42px;
  background: linear-gradient(135deg, var(--shell-start), var(--shell-end));
  animation: wobble 4s ease-in-out infinite;
}

.white {
  position: absolute;
  inset: 16px 14px 20px;
  border-radius: 34px;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(252, 244, 233, 0.9));
}

.yolk {
  position: absolute;
  bottom: 18px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--yolk-start), var(--yolk-end) 70%);
  box-shadow: 0 8px 14px rgba(249, 160, 63, 0.45);
  animation: pulse 3s ease-in-out infinite;
}

.yolk::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  mix-blend-mode: screen;
  opacity: 0;
}

.shine {
  position: absolute;
  width: 12px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  top: 16px;
  left: 18px;
  transform: rotate(-12deg);
  opacity: 0.6;
}

.steam {
  position: absolute;
  top: 8px;
  width: 6px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  animation: steam 2.5s ease-in-out infinite;
}

.egg.soft {
  --shell-start: #fff9f3;
  --shell-end: #f3dccb;
  --yolk-start: #ffd9a1;
  --yolk-end: #f49462;
}

.egg.soft .yolk {
  transform: scale(1.08);
  filter: blur(0.2px);
}

.egg.soft .yolk::after {
  opacity: 0.5;
  inset: -6px 8px 10px;
  background: radial-gradient(circle, rgba(255, 213, 160, 0.9), rgba(255, 213, 160, 0));
}

.egg.medium {
  --shell-start: #fff7ee;
  --shell-end: #f4dfc2;
  --yolk-start: #ffe38a;
  --yolk-end: #f4a63c;
}

.egg.medium .yolk {
  transform: scale(0.96);
  box-shadow: 0 0 0 6px rgba(247, 200, 120, 0.35), 0 8px 14px rgba(249, 160, 63, 0.45);
}

.egg.medium .yolk::after {
  opacity: 0.35;
}

.egg.hard {
  --shell-start: #fff1e1;
  --shell-end: #efd3b2;
  --yolk-start: #f9d87a;
  --yolk-end: #f08c2d;
}

.egg.hard .yolk {
  transform: scale(0.86);
  background: radial-gradient(circle at 40% 35%, #f7d079, #e9802d 70%);
}

.egg.hard .yolk::after {
  opacity: 0.45;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.55),
    rgba(255, 255, 255, 0.55) 2px,
    transparent 2px,
    transparent 4px
  );
}

.egg.hard .steam {
  opacity: 0.3;
}

@keyframes wobble {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes steam {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}
</style>
