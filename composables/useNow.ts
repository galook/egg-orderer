import { ref, onMounted, onUnmounted } from "vue";

export const useNow = () => {
  const now = ref(Date.now());
  let timer: number | null = null;

  onMounted(() => {
    timer = window.setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });

  onUnmounted(() => {
    if (timer) window.clearInterval(timer);
  });

  return now;
};
