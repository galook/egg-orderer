<template>
  <div class="page">
    <header class="hero">
      <div class="hero-copy">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true"></span>
          <div>
            <p class="eyebrow">Convex + Nuxt.js</p>
            <h1>Egg Orderer</h1>
          </div>
        </div>
        <p class="subtitle">
          A live breakfast command center that turns boiling chaos into perfectly timed eggs.
        </p>
        <div class="hero-steps">
          <div class="step">
            <span class="step-number">01</span>
            <div>
              <p class="step-title">Register</p>
              <p class="step-text">Choose a name and role.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">02</span>
            <div>
              <p class="step-title">Order</p>
              <p class="step-text">Pick your egg style and quantity.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">03</span>
            <div>
              <p class="step-title">Serve</p>
              <p class="step-text">Follow the pull-out schedule.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="status-card" aria-live="polite">
        <div class="status-grid">
          <div class="status-item">
            <p class="label">Order window</p>
            <p class="value" :class="windowStateClass">{{ windowStateLabel }}</p>
            <p class="detail">{{ windowStateNote }}</p>
          </div>
          <div class="status-item">
            <p class="label">Next pull-out</p>
            <p class="value">{{ nextReadyLabel }}</p>
            <p class="detail">{{ nextReadyNote }}</p>
          </div>
          <div class="status-item">
            <p class="label">Orders in queue</p>
            <p class="value">{{ totalOrders }}</p>
            <p class="detail">{{ totalEggs }} eggs in flight</p>
          </div>
          <div class="status-item">
            <p class="label">Your cart</p>
            <p class="value">{{ userEggsLabel }}</p>
            <p class="detail">{{ userEggsNote }}</p>
          </div>
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
            aria-label="Toggle sound cues"
            @click="toggleSound"
          >
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="errorBanner" class="alert" role="alert">
      <strong>Connection issue.</strong>
      <span>{{ errorBanner }}</span>
    </div>

    <main class="content">
      <section class="panel" id="register">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Step 1</p>
            <h2>Register</h2>
            <p class="muted">Choose a name and your role for this breakfast.</p>
          </div>
          <span class="status-pill" :class="currentUser ? 'ready' : 'idle'">
            {{ currentUser ? "Signed in" : "Not signed in" }}
          </span>
        </div>
        <div class="register-grid">
          <div class="stack" v-if="!currentUser">
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
          <div class="helper-card">
            <p class="pill">How it works</p>
            <ol>
              <li>Pick your role to unlock the right tools.</li>
              <li>Queue orders while the window is open.</li>
              <li>Start cooking and follow the pull-out schedule.</li>
            </ol>
            <p class="muted">Sound cues will chime when eggs are ready.</p>
          </div>
        </div>
      </section>

      <section class="panel" v-if="currentUser?.role === 'eater'" id="order">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Step 2</p>
            <h2>Order your eggs</h2>
            <p class="muted">Select the Czech style, see the animation, and pick your quantity.</p>
          </div>
          <span class="status-pill" :class="settings?.ordersClosed ? 'closed' : 'open'">
            {{ settings?.ordersClosed ? "Orders closed" : "Orders open" }}
          </span>
        </div>

        <div v-if="settings?.ordersClosed" class="notice">
          The cooker has closed orders. You can still watch your order status.
        </div>

        <div class="order-layout">
          <div>
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
                  <p class="cook-time">~{{ type.minutes }} minutes</p>
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
              <button class="primary" :disabled="!canOrder" @click="placeOrder">
                Place order
              </button>
            </div>
          </div>

          <aside class="order-summary">
            <h3>Order summary</h3>
            <div class="summary-card">
              <p class="pill">Selected style</p>
              <h4>{{ selectedEgg?.label ?? "" }} · {{ selectedEgg?.tag ?? "" }}</h4>
              <p class="muted">{{ selectedEgg?.description ?? "" }}</p>
              <div class="summary-row">
                <span>Estimated cook time</span>
                <strong>~{{ selectedEgg?.minutes ?? 0 }} min</strong>
              </div>
              <div class="summary-row">
                <span>Quantity</span>
                <strong>{{ orderForm.quantity }} eggs</strong>
              </div>
              <div class="summary-row">
                <span>Status</span>
                <strong>{{ settings?.ordersClosed ? "Waiting for cook" : "Ready to order" }}</strong>
              </div>
            </div>
            <div class="summary-note">
              <p class="muted">You will get a chime when your eggs are ready.</p>
            </div>
          </aside>
        </div>

        <div class="stack" v-if="userOrders.length">
          <h3>Your live order updates</h3>
          <div
            class="order-card"
            :class="[`type-${order.eggType}`, statusTone(order)]"
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

      <section class="panel" v-if="currentUser?.role === 'cooker'" id="kitchen">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Cooker tools</p>
            <h2>Kitchen control room</h2>
            <p class="muted">Watch incoming orders, then close and cook them in one batch.</p>
          </div>
          <span class="status-pill" :class="settings?.cookingStartedAt ? 'ready' : 'queued'">
            {{ settings?.cookingStartedAt ? "Cooking" : "Idle" }}
          </span>
        </div>
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
          <button class="danger" @click="reopenOrders">
            Start new round
          </button>
        </div>
        <div class="notice" v-if="settings?.cookingStartedAt">
          Cooking started at {{ formatTime(settings?.cookingStartedAt) }}. Follow the pull-out schedule below.
        </div>

        <div class="cooker-grid">
          <div class="stack">
            <h3>Live order queue</h3>
            <div v-if="orders.length === 0" class="empty-state">
              <p>No orders yet.</p>
              <span>Share the link to start the breakfast wave.</span>
            </div>
            <div
              class="order-card"
              :class="[`type-${order.eggType}`, statusTone(order)]"
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
            <div
              class="schedule"
              v-for="item in schedule"
              :key="item.orderId"
              :class="[`type-${item.eggType}`, { ready: isReady(item.readyAt) }]"
            >
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

          <div class="stack" v-else>
            <h3>Pull-out schedule</h3>
            <div class="empty-state">
              <p>No pull-out times yet.</p>
              <span>Start cooking to generate the schedule.</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel-compact">
        <h2>Breakfast status</h2>
        <p class="muted">At-a-glance health for the current round.</p>
        <div class="mini-stats">
          <div class="mini-stat">
            <p class="label">Orders</p>
            <p class="value">{{ totalOrders }}</p>
          </div>
          <div class="mini-stat">
            <p class="label">Eggs</p>
            <p class="value">{{ totalEggs }}</p>
          </div>
          <div class="mini-stat">
            <p class="label">Next ready</p>
            <p class="value">{{ nextReadyLabel }}</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Egg Orderer · Built for crisp mornings and perfect timing.</p>
    </footer>
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

const { data: currentUser, error: currentUserError } = useConvexQuery(
  () => (userId.value ? { name: "users:getById", args: { id: userId.value } } : null),
  convex
);

const { data: settings, error: settingsError } = useConvexQuery(
  () => ({ name: "settings:get", args: {} }),
  convex
);

const { data: orders, error: ordersError } = useConvexQuery(
  () => ({ name: "orders:list", args: {} }),
  convex,
  []
);

const { data: userOrders, error: userOrdersError } = useConvexQuery(
  () => (userId.value ? { name: "orders:listByUser", args: { userId: userId.value } } : null),
  convex,
  []
);

const { data: schedule, error: scheduleError } = useConvexQuery(
  () => ({ name: "orders:schedule", args: {} }),
  convex,
  []
);

const selectedEgg = computed(() =>
  eggTypes.find((type) => type.value === orderForm.eggType) ?? eggTypes[0]
);

const totalOrders = computed(() => orders.value?.length ?? 0);
const totalEggs = computed(() =>
  orders.value?.reduce((sum, order) => sum + (order.quantity || 0), 0) ?? 0
);
const userEggs = computed(() =>
  userOrders.value?.reduce((sum, order) => sum + (order.quantity || 0), 0) ?? 0
);

const nextReadyAt = computed(() => schedule.value?.[0]?.readyAt ?? null);
const nextReadyCountdown = computed(() =>
  nextReadyAt.value ? getTimeRemaining(nextReadyAt.value, now.value) : ""
);
const nextReadyLabel = computed(() =>
  nextReadyAt.value ? formatTime(nextReadyAt.value) : "--"
);

const windowStateLabel = computed(() => {
  if (!settings.value) return "Syncing";
  return settings.value.ordersClosed ? "Closed" : "Open";
});

const windowStateClass = computed(() => {
  if (!settings.value) return "sync";
  return settings.value.ordersClosed ? "closed" : "open";
});

const windowStateNote = computed(() => {
  if (!settings.value) return "Connecting to the kitchen feed.";
  if (!settings.value.ordersClosed) return "Taking orders now.";
  return settings.value.closedAt
    ? `Closed at ${formatTime(settings.value.closedAt)}.`
    : "Orders are paused.";
});

const nextReadyNote = computed(() => {
  if (!settings.value?.cookingStartedAt) return "Waiting for cooking to start.";
  if (!nextReadyAt.value) return "No pull-outs yet.";
  if (nextReadyCountdown.value === "0:00") return "Ready now.";
  return `${nextReadyCountdown.value} left.`;
});

const userEggsLabel = computed(() => {
  if (!currentUser.value) return "--";
  return userEggs.value.toString();
});

const userEggsNote = computed(() => {
  if (!currentUser.value) return "Sign in to track orders.";
  if (!userOrders.value?.length) return "No active orders.";
  return "Tracking your queue.";
});

const errorBanner = computed(() =>
  settingsError.value?.message ||
  ordersError.value?.message ||
  scheduleError.value?.message ||
  userOrdersError.value?.message ||
  currentUserError.value?.message ||
  ""
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

const reopenOrders = async () => {
  const confirmed = window.confirm(
    "Start a new round? This will clear all current orders and reopen ordering."
  );
  if (!confirmed) return;
  chimedIds.clear();
  await convex.mutation("settings:reopen", {});
};

const eggLabel = (eggType: string) => getEggLabel(eggType);

const orderStatus = (order: { readyAt?: number | null }) =>
  getOrderStatus(order, settings.value ?? null, now.value);

const timeRemaining = (order: { readyAt?: number | null }) =>
  getTimeRemaining(order.readyAt, now.value);

const scheduleCountdown = (readyAt: number) => getScheduleCountdown(readyAt, now.value);

const isReady = (readyAt?: number | null) => !!readyAt && now.value >= readyAt;

const statusTone = (order: { readyAt?: number | null }) => {
  const status = orderStatus(order);
  if (status === "Ready to serve") return "ready";
  if (status === "Cooking") return "cooking";
  if (status === "Queued") return "queued";
  return "open";
};

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
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,700&display=swap");

:global(:root) {
  --bg: #fbf4ea;
  --bg-strong: #f3dfc8;
  --ink: #2b2019;
  --ink-soft: #5f4a3f;
  --accent: #f5a24a;
  --accent-strong: #e9852b;
  --accent-soft: rgba(245, 162, 74, 0.2);
  --ready: #1c7e59;
  --warning: #d96445;
  --surface: rgba(255, 255, 255, 0.95);
  --surface-strong: rgba(255, 255, 255, 0.98);
  --border: rgba(210, 187, 165, 0.6);
  --shadow: 0 22px 50px rgba(52, 34, 23, 0.12);
}

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Manrope", "Helvetica Neue", sans-serif;
  background: radial-gradient(circle at top, #fff8ef 0%, #f4e6d7 40%, #ecd9c7 100%);
  color: var(--ink);
}

:global(h1),
:global(h2),
:global(h3),
:global(h4) {
  font-family: "Newsreader", "Georgia", serif;
}

.page {
  min-height: 100vh;
  padding: 56px clamp(20px, 4vw, 72px) 90px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  overflow: hidden;
  max-width: 1280px;
  margin: 0 auto;
}

.page::before {
  content: "";
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 227, 194, 0.7), rgba(255, 227, 194, 0));
  top: -160px;
  right: -160px;
  z-index: 0;
}

.page::after {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 40% 60% 55% 45%;
  background: radial-gradient(circle, rgba(250, 186, 123, 0.35), rgba(250, 186, 123, 0));
  bottom: -120px;
  left: -80px;
  z-index: 0;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 32px;
  align-items: start;
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 12px 24px rgba(245, 162, 74, 0.35);
  position: relative;
}

.brand-mark::before {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.65);
}

.eyebrow {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.32em;
  color: #9b7562;
  margin: 0 0 6px;
}

h1 {
  font-size: clamp(32px, 5vw, 56px);
  margin: 0;
}

.subtitle {
  font-size: 18px;
  color: var(--ink-soft);
  margin: 16px 0 0;
  max-width: 520px;
}

.hero-steps {
  margin-top: 24px;
  display: grid;
  gap: 12px;
}

.step {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(221, 196, 170, 0.6);
}

.step-number {
  font-weight: 700;
  color: var(--accent-strong);
}

.step-title {
  font-weight: 600;
  margin: 0;
}

.step-text {
  margin: 2px 0 0;
  color: var(--ink-soft);
  font-size: 14px;
}

.status-card {
  background: var(--surface);
  padding: 22px 24px;
  border-radius: 24px;
  box-shadow: var(--shadow);
  display: grid;
  gap: 20px;
}

.status-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.status-item {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
}

.label {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: #9d8169;
}

.value {
  font-size: 22px;
  margin: 8px 0 4px;
  font-weight: 600;
}

.value.open {
  color: var(--ready);
}

.value.closed {
  color: var(--warning);
}

.value.sync {
  color: #b08c71;
}

.detail {
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
  background: var(--accent);
  border-color: var(--accent);
}

.toggle.on span {
  transform: translateX(20px);
}

.alert {
  background: rgba(255, 235, 230, 0.9);
  border: 1px solid rgba(217, 100, 69, 0.35);
  color: #8f2e1c;
  padding: 14px 18px;
  border-radius: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 1;
}

.content {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  position: relative;
  z-index: 1;
}

.panel {
  background: var(--surface);
  border-radius: 28px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeIn 0.6s ease both;
}

.panel-compact {
  align-self: start;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-eyebrow {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: #9b7562;
  margin: 0 0 8px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: var(--ink-soft);
}

.field input,
.field select {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #e5dbd4;
  font-size: 16px;
  background: #fffdfb;
}

.field input:focus,
.field select:focus {
  outline: 2px solid rgba(245, 162, 74, 0.35);
  border-color: rgba(245, 162, 74, 0.6);
}

.primary,
.ghost,
.danger {
  font-family: inherit;
  font-size: 15px;
}

.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
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

.primary:disabled,
.ghost:disabled,
.danger:disabled {
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

.danger {
  background: #fbe9e6;
  border: 1px solid #ebb2a7;
  color: #8f2e1c;
  padding: 12px 18px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
}

.danger:hover:not(:disabled) {
  background: #f8d8d2;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.helper-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  border: 1px solid rgba(221, 196, 170, 0.6);
  padding: 16px;
}

.helper-card ol {
  margin: 8px 0 12px 16px;
  padding: 0;
  color: var(--ink-soft);
  display: grid;
  gap: 6px;
}

.order-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
}

.order-summary {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-card {
  background: #fffdfb;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(221, 196, 170, 0.6);
  display: grid;
  gap: 10px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
  color: var(--ink-soft);
}

.summary-note {
  padding: 12px;
  border-radius: 14px;
  background: rgba(245, 162, 74, 0.12);
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
  background: rgba(255, 255, 255, 0.9);
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

.cook-time {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--ink-soft);
}

.order-actions {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.notice {
  background: linear-gradient(135deg, #fff6e8, #ffe9cc);
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--accent);
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card.ready,
.schedule.ready {
  box-shadow: 0 12px 26px rgba(28, 126, 89, 0.18);
  transform: translateY(-2px);
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

.order-card.ready {
  border-left-color: var(--ready);
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

.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  background: rgba(248, 236, 224, 0.8);
  border: 1px solid rgba(221, 196, 170, 0.6);
}

.status-pill.ready {
  background: rgba(28, 126, 89, 0.12);
  border-color: rgba(28, 126, 89, 0.3);
  color: var(--ready);
}

.status-pill.open {
  background: rgba(28, 126, 89, 0.12);
  border-color: rgba(28, 126, 89, 0.3);
  color: var(--ready);
}

.status-pill.closed {
  background: rgba(217, 100, 69, 0.12);
  border-color: rgba(217, 100, 69, 0.3);
  color: var(--warning);
}

.status-pill.queued {
  background: rgba(245, 162, 74, 0.15);
  border-color: rgba(245, 162, 74, 0.3);
  color: var(--accent-strong);
}

.status-pill.idle {
  color: #a38774;
}

.value.ready {
  color: var(--ready);
}

.countdown {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  border: 1px dashed rgba(221, 196, 170, 0.6);
  border-radius: 18px;
  padding: 18px;
  color: var(--ink-soft);
  background: rgba(255, 255, 255, 0.7);
}

.empty-state span {
  display: block;
  font-size: 13px;
  margin-top: 6px;
}

.cooker-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.mini-stats {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.mini-stat {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(221, 196, 170, 0.6);
  padding: 12px;
}

.footer {
  text-align: center;
  color: #8c776a;
  font-size: 13px;
  z-index: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .order-layout {
    grid-template-columns: 1fr;
  }
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
}

@media (prefers-reduced-motion: reduce) {
  .panel {
    animation: none;
  }

  .primary:hover:not(:disabled) {
    transform: none;
    box-shadow: none;
  }
}
</style>
