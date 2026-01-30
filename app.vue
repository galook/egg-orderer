<template>
  <div class="page">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Convex + Nuxt.js</p>
        <h1>Egg Orderer</h1>
        <p class="subtitle">
          Live breakfast ordering for perfectly timed eggs.
        </p>
        <div class="hero-meta">
          <span class="meta-pill">Live queue</span>
          <span class="meta-pill">Cooker schedule</span>
          <span class="meta-pill">Sound cues</span>
        </div>
      </div>
      <div class="status-card">
        <div>
          <p class="label">Order window</p>
          <p class="value" :class="settings?.ordersClosed ? 'closed' : 'open'">
            {{ settings?.ordersClosed ? "Closed" : "Open" }}
          </p>
          <p v-if="settings?.ordersClosed" class="detail">
            Orders closed at {{ formatTime(settings?.closedAt) }}
          </p>
        </div>
        <div class="divider"></div>
        <div class="sound-row">
          <div>
            <p class="label">Sound cues</p>
            <p class="detail">{{ soundHint }}</p>
          </div>
          <button
            class="toggle"
            :class="{ on: soundEnabled }"
            role="switch"
            :aria-checked="soundEnabled"
            @click="toggleSound"
          >
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <main class="content">
      <section class="panel">
        <h2>Register</h2>
        <p class="muted">Choose a name and your role for this breakfast.</p>
        <div v-if="!currentUser" class="stack">
          <label class="field">
            <span>Name</span>
            <input v-model="registration.name" placeholder="Your name" />
          </label>
          <label class="field">
            <span>Role</span>
            <select v-model="registration.role">
              <option value="eater">Eater</option>
              <option value="cooker">Cooker</option>
            </select>
          </label>
          <button class="primary" :disabled="!canRegister" @click="register">
            Join breakfast
          </button>
        </div>
        <div v-else class="user-card">
          <p class="pill">Logged in as</p>
          <h3>{{ currentUser.name }}</h3>
          <p class="role">{{ currentUser.role === "eater" ? "Eater" : "Cooker" }}</p>
          <button class="ghost" @click="resetUser">Switch user</button>
        </div>
      </section>

      <section class="panel" v-if="currentUser?.role === 'eater'">
        <h2>Order your eggs</h2>
        <p class="muted">Select the Czech style, see the animation, and pick your quantity.</p>
        <div v-if="settings?.ordersClosed" class="notice">
          The cooker has closed orders. You can still watch your order status.
        </div>
        <div class="order-grid">
          <label
            v-for="type in eggTypes"
            :key="type.value"
            class="egg-choice"
            :class="[`type-${type.value}`, { active: orderForm.eggType === type.value }]"
          >
            <input
              type="radio"
              :value="type.value"
              v-model="orderForm.eggType"
              :disabled="settings?.ordersClosed"
            />
            <EggAnimation :type="type.value" />
            <div class="egg-meta">
              <div class="egg-header">
                <h3>{{ type.label }}</h3>
                <span class="egg-tag">{{ type.tag }}</span>
              </div>
              <p>{{ type.description }}</p>
            </div>
          </label>
        </div>
        <div class="order-actions">
          <label class="field">
            <span>Amount</span>
            <input
              type="number"
              min="1"
              max="12"
              v-model.number="orderForm.quantity"
              :disabled="settings?.ordersClosed"
            />
          </label>
          <button
            class="primary"
            :disabled="!canOrder"
            @click="placeOrder"
          >
            Place order
          </button>
        </div>
        <div class="stack" v-if="userOrders.length">
          <h3>Your live order updates</h3>
          <div
            class="order-card"
            :class="`type-${order.eggType}`"
            v-for="order in userOrders"
            :key="order._id"
          >
            <div class="order-info">
              <p class="pill">{{ eggLabel(order.eggType) }}</p>
              <h4>{{ order.quantity }} egg(s)</h4>
              <p class="muted">Placed at {{ formatTime(order.createdAt) }}</p>
            </div>
            <div class="status">
              <p class="label">Status</p>
              <p class="value" :class="{ ready: isReady(order.readyAt) }">
                {{ orderStatus(order) }}
              </p>
              <p v-if="timeRemaining(order)" class="muted countdown">
                {{ timeRemaining(order) }} left
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="panel" v-if="currentUser?.role === 'cooker'">
        <h2>Cooker control room</h2>
        <p class="muted">Watch incoming orders, then close and cook them in one batch.</p>
        <div class="button-row">
          <button class="ghost" :disabled="settings?.ordersClosed" @click="closeOrders">
            Close orders
          </button>
          <button
            class="primary"
            :disabled="!settings?.ordersClosed || settings?.cookingStartedAt"
            @click="startCooking"
          >
            Start cooking
          </button>
        </div>
        <div class="notice" v-if="settings?.cookingStartedAt">
          Cooking started at {{ formatTime(settings?.cookingStartedAt) }}. Follow the pull-out schedule below.
        </div>
        <div class="stack">
          <h3>Live order queue</h3>
          <div v-if="orders.length === 0" class="muted">No orders yet.</div>
          <div
            class="order-card"
            :class="`type-${order.eggType}`"
            v-for="order in orders"
            :key="order._id"
          >
            <div class="order-info">
              <p class="pill">{{ eggLabel(order.eggType) }}</p>
              <h4>{{ order.quantity }} egg(s)</h4>
              <p class="muted">{{ order.user?.name }} · {{ formatTime(order.createdAt) }}</p>
            </div>
            <div class="status">
              <p class="label">Progress</p>
              <p class="value" :class="{ ready: isReady(order.readyAt) }">
                {{ orderStatus(order) }}
              </p>
              <p v-if="timeRemaining(order)" class="muted countdown">
                Pull in {{ timeRemaining(order) }}
              </p>
            </div>
          </div>
        </div>
        <div class="stack" v-if="schedule.length">
          <h3>Pull-out schedule</h3>
          <div class="schedule" v-for="item in schedule" :key="item.orderId" :class="`type-${item.eggType}`">
            <div class="order-info">
              <p class="pill">{{ eggLabel(item.eggType) }}</p>
              <h4>{{ item.quantity }} egg(s)</h4>
              <p class="muted">for {{ item.userName }}</p>
            </div>
            <div class="status">
              <p class="label">Ready at</p>
              <p class="value" :class="{ ready: isReady(item.readyAt) }">
                {{ formatTime(item.readyAt) }}
              </p>
              <p class="muted countdown">{{ scheduleCountdown(item.readyAt) }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed, ref, watch } from "vue";
import { useConvexClient } from "~/composables/useConvexClient";
import { useConvexQuery } from "~/composables/useConvexQuery";
import EggAnimation from "~/components/EggAnimation.vue";
import {
  eggTypes,
  getEggLabel,
  formatTime,
  getOrderStatus,
  getTimeRemaining,
  getScheduleCountdown
} from "~/utils/egg";

const convex = useConvexClient();
const now = useNow();

const registration = reactive({
  name: "",
  role: "eater"
});

const orderForm = reactive({
  eggType: "soft",
  quantity: 2
});

const soundEnabled = ref(true);
const soundReady = ref(false);
const soundUnsupported = ref(false);

const userId = useState<string | null>("user-id", () => null);

const { data: currentUser } = useConvexQuery(
  () => (userId.value ? { name: "users:getById", args: { id: userId.value } } : null),
  convex
);

const { data: settings } = useConvexQuery(
  () => ({ name: "settings:get", args: {} }),
  convex
);

const { data: orders } = useConvexQuery(
  () => ({ name: "orders:list", args: {} }),
  convex
);

const { data: userOrders } = useConvexQuery(
  () => (userId.value ? { name: "orders:listByUser", args: { userId: userId.value } } : null),
  convex
);

const { data: schedule } = useConvexQuery(
  () => ({ name: "orders:schedule", args: {} }),
  convex
);

const canRegister = computed(() => registration.name.trim().length > 1);
const canOrder = computed(() =>
  !settings.value?.ordersClosed && orderForm.quantity > 0 && orderForm.eggType
);

const soundHint = computed(() => {
  if (soundUnsupported.value) return "Audio unavailable";
  if (!soundEnabled.value) return "Sound off";
  if (!soundReady.value) return "Tap anywhere to enable audio";
  return "Sound on";
});

const register = async () => {
  const result = await convex.mutation("users:create", {
    name: registration.name.trim(),
    role: registration.role
  });
  userId.value = result;
  localStorage.setItem("egg-user-id", result);
};

const resetUser = () => {
  userId.value = null;
  localStorage.removeItem("egg-user-id");
};

const placeOrder = async () => {
  if (!currentUser.value) return;
  await convex.mutation("orders:create", {
    userId: currentUser.value._id,
    eggType: orderForm.eggType,
    quantity: orderForm.quantity
  });
};

const closeOrders = async () => {
  await convex.mutation("settings:close", {});
};

const startCooking = async () => {
  await convex.mutation("orders:startCooking", {});
};

const eggLabel = (eggType: string) => getEggLabel(eggType);

const orderStatus = (order: { readyAt?: number | null }) =>
  getOrderStatus(order, settings.value ?? null, now.value);

const timeRemaining = (order: { readyAt?: number | null }) =>
  getTimeRemaining(order.readyAt, now.value);

const scheduleCountdown = (readyAt: number) => getScheduleCountdown(readyAt, now.value);

const isReady = (readyAt?: number | null) => !!readyAt && now.value >= readyAt;

let audioContext: AudioContext | null = null;
let lastChimeAt = 0;
const chimedIds = new Set<string>();

const unlockAudio = async () => {
  if (soundUnsupported.value || soundReady.value) return;
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) {
    soundUnsupported.value = true;
    return;
  }
  audioContext = audioContext ?? new AudioCtor();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  soundReady.value = audioContext.state === "running";
};

const playChime = () => {
  if (!soundEnabled.value || soundUnsupported.value || !soundReady.value) return;
  if (!audioContext) return;
  const nowMs = Date.now();
  if (nowMs - lastChimeAt < 800) return;
  lastChimeAt = nowMs;

  const tone = audioContext.createOscillator();
  const gain = audioContext.createGain();
  tone.type = "triangle";
  tone.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.35, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

  tone.connect(gain);
  gain.connect(audioContext.destination);
  tone.start();
  tone.stop(audioContext.currentTime + 0.55);
};

const checkReadyChimes = (items: Array<{ readyAt?: number | null }>, idKey: string) => {
  for (const item of items) {
    const readyAt = item.readyAt;
    const id = (item as any)[idKey] as string | undefined;
    if (!readyAt || !id) continue;
    if (now.value >= readyAt && !chimedIds.has(id)) {
      chimedIds.add(id);
      playChime();
    }
  }
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  if (soundEnabled.value) {
    unlockAudio();
  }
};

watch(soundEnabled, (value) => {
  localStorage.setItem("egg-sound-enabled", value ? "true" : "false");
});

watch([now, userOrders, schedule], () => {
  if (userOrders.value?.length) {
    checkReadyChimes(userOrders.value, "_id");
  }
  if (schedule.value?.length) {
    checkReadyChimes(schedule.value, "orderId");
  }
});

onMounted(() => {
  const stored = localStorage.getItem("egg-user-id");
  if (stored) {
    userId.value = stored;
  }
  const storedSound = localStorage.getItem("egg-sound-enabled");
  if (storedSound !== null) {
    soundEnabled.value = storedSound === "true";
  }
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  if (soundEnabled.value) {
    unlockAudio();
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Work+Sans:wght@400;500;600&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Work Sans", "Helvetica Neue", sans-serif;
  background: radial-gradient(circle at top, #fff8ef 0%, #f4e6d7 40%, #ecd9c7 100%);
  color: #2b2019;
}

:global(h1),
:global(h2),
:global(h3),
:global(h4) {
  font-family: "Fraunces", "Georgia", serif;
}

.page {
  min-height: 100vh;
  padding: 48px clamp(20px, 4vw, 68px) 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  overflow: hidden;
}

.page::before {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 227, 194, 0.7), rgba(255, 227, 194, 0));
  top: -120px;
  right: -120px;
  z-index: 0;
}

.page::after {
  content: "";
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 40% 60% 55% 45%;
  background: radial-gradient(circle, rgba(250, 186, 123, 0.35), rgba(250, 186, 123, 0));
  bottom: -100px;
  left: -80px;
  z-index: 0;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.hero-copy {
  max-width: 520px;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: #9b7562;
  margin: 0;
}

h1 {
  font-size: clamp(32px, 5vw, 58px);
  margin: 10px 0 12px;
}

.subtitle {
  font-size: 18px;
  color: #5f4a3f;
  margin: 0;
}

.hero-meta {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-pill {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(206, 174, 149, 0.6);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 22px 24px;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(52, 34, 23, 0.12);
  min-width: 240px;
  display: grid;
  gap: 18px;
}

.status-card .label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: #9d8169;
}

.status-card .value {
  font-size: 26px;
  margin: 8px 0;
  font-weight: 600;
}

.status-card .value.open {
  color: #1c7e59;
}

.status-card .value.closed {
  color: #c2442c;
}

.status-card .detail {
  margin: 0;
  color: #7a6a60;
  font-size: 13px;
}

.divider {
  height: 1px;
  background: #f0e3d8;
  width: 100%;
}

.sound-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle {
  width: 48px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #d7c4b8;
  background: #f6efe9;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle span {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  top: 3px;
  left: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
}

.toggle.on {
  background: #f5b266;
  border-color: #f5b266;
}

.toggle.on span {
  transform: translateX(20px);
}

.content {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  position: relative;
  z-index: 1;
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(52, 34, 23, 0.12);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: #5c4b43;
}

.field input,
.field select {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e5dbd4;
  font-size: 16px;
  background: #fffdfb;
}

.primary {
  background: linear-gradient(135deg, #f9a03f, #f7b05a);
  border: none;
  color: #2b2019;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(249, 160, 63, 0.35);
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ghost {
  background: transparent;
  border: 1px solid #d7c4b8;
  padding: 12px 18px;
  border-radius: 14px;
  cursor: pointer;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.order-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.egg-choice {
  border: 1px solid var(--egg-border, #eadfd8);
  border-radius: 20px;
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
}

.egg-choice input {
  display: none;
}

.egg-choice.active {
  border-color: var(--egg-border, #f9a03f);
  box-shadow: 0 12px 24px var(--egg-glow, rgba(249, 160, 63, 0.25));
  transform: translateY(-2px);
}

.egg-choice.type-soft {
  --egg-border: #f2b7a0;
  --egg-glow: rgba(242, 183, 160, 0.45);
}

.egg-choice.type-medium {
  --egg-border: #f2c56b;
  --egg-glow: rgba(242, 197, 107, 0.45);
}

.egg-choice.type-hard {
  --egg-border: #d79c5a;
  --egg-glow: rgba(215, 156, 90, 0.45);
}

.egg-meta h3 {
  margin: 0;
}

.egg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.egg-tag {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(248, 236, 224, 0.8);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.order-actions {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.notice {
  background: linear-gradient(135deg, #fff6e8, #ffe9cc);
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #f9a03f;
  color: #7a4b15;
}

.order-card,
.schedule {
  background: #fdfbf9;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border: 1px solid rgba(229, 211, 196, 0.6);
  border-left: 4px solid var(--egg-border, #e8d3c2);
}

.order-card.type-soft,
.schedule.type-soft {
  --egg-border: #f2b7a0;
}

.order-card.type-medium,
.schedule.type-medium {
  --egg-border: #f2c56b;
}

.order-card.type-hard,
.schedule.type-hard {
  --egg-border: #d79c5a;
}

.pill {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
  color: #9d8169;
  margin: 0 0 6px 0;
}

.muted {
  color: #7a6a60;
  font-size: 14px;
}

.user-card {
  background: #fdf8f2;
  border-radius: 16px;
  padding: 16px;
}

.role {
  margin: 0;
  font-weight: 600;
  color: #9d8169;
}

.order-info h4 {
  margin: 4px 0 6px;
}

.status {
  text-align: right;
}

.label {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #9d8169;
}

.value {
  font-size: 18px;
  font-weight: 600;
  margin: 4px 0;
}

.value.ready {
  color: #1c7e59;
}

.countdown {
  font-weight: 600;
}

@media (max-width: 720px) {
  .order-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .order-card,
  .schedule {
    flex-direction: column;
    align-items: flex-start;
  }

  .status {
    text-align: left;
  }

  .status-card {
    width: 100%;
  }
}
</style>
