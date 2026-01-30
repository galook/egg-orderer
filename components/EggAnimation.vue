<template>
  <div class="egg" :class="type">
    <div class="shell"></div>
    <div class="yolk"></div>
    <div class="steam"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ type: "soft" | "medium" | "hard" }>();
</script>

<style scoped>
.egg {
  width: 72px;
  height: 90px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 40px 40px 46px 46px;
  background: #fff9f0;
  border: 2px solid #f2e2d4;
  overflow: hidden;
}

.shell {
  position: absolute;
  inset: 8px;
  border-radius: 36px 36px 42px 42px;
  background: linear-gradient(135deg, #fffdfa, #f5e8da);
  animation: wobble 4s ease-in-out infinite;
}

.yolk {
  position: absolute;
  bottom: 18px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffe89b, #f9a03f 70%);
  box-shadow: 0 8px 14px rgba(249, 160, 63, 0.45);
  animation: pulse 3s ease-in-out infinite;
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

.egg.soft .yolk {
  transform: scale(1.05);
  filter: blur(0.2px);
}

.egg.medium .yolk {
  transform: scale(0.95);
}

.egg.hard .yolk {
  transform: scale(0.85);
  background: radial-gradient(circle at 35% 35%, #f9d87a, #f08c2d 70%);
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
