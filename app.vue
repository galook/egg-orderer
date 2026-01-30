<template>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">Convex + Nuxt.js</p>
        <h1>Egg Orderer</h1>
        <p class="subtitle">
          Live breakfast ordering for perfectly timed eggs.
        </p>
      </div>
      <div class="status-card">
        <p class="label">Order window</p>
        <p class="value" :class="settings?.ordersClosed ? 'closed' : 'open'">
          {{ settings?.ordersClosed ? "Closed" : "Open" }}
        </p>
        <p v-if="settings?.ordersClosed" class="detail">
          Orders closed at {{ formatTime(settings?.closedAt) }}
        </p>
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
            :class="{ active: orderForm.eggType === type.value }"
          >
            <input
              type="radio"
              :value="type.value"
              v-model="orderForm.eggType"
              :disabled="settings?.ordersClosed"
            />
            <EggAnimation :type="type.value" />
            <div>
              <h3>{{ type.label }}</h3>
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
          <div class="order-card" v-for="order in userOrders" :key="order._id">
            <div>
              <p class="pill">{{ eggLabel(order.eggType) }}</p>
              <h4>{{ order.quantity }} egg(s)</h4>
              <p class="muted">Placed at {{ formatTime(order.createdAt) }}</p>
            </div>
            <div class="status">
              <p class="label">Status</p>
              <p class="value">{{ orderStatus(order) }}</p>
              <p v-if="timeRemaining(order)" class="muted">
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
          <div class="order-card" v-for="order in orders" :key="order._id">
            <div>
              <p class="pill">{{ eggLabel(order.eggType) }}</p>
              <h4>{{ order.quantity }} egg(s)</h4>
              <p class="muted">{{ order.user?.name }} · {{ formatTime(order.createdAt) }}</p>
            </div>
            <div class="status">
              <p class="label">Progress</p>
              <p class="value">{{ orderStatus(order) }}</p>
              <p v-if="timeRemaining(order)" class="muted">
                Pull in {{ timeRemaining(order) }}
              </p>
            </div>
          </div>
        </div>
        <div class="stack" v-if="schedule.length">
          <h3>Pull-out schedule</h3>
          <div class="schedule" v-for="item in schedule" :key="item.orderId">
            <div>
              <p class="pill">{{ eggLabel(item.eggType) }}</p>
              <h4>{{ item.quantity }} egg(s)</h4>
              <p class="muted">for {{ item.userName }}</p>
            </div>
            <div class="status">
              <p class="label">Ready at</p>
              <p class="value">{{ formatTime(item.readyAt) }}</p>
              <p class="muted">{{ scheduleCountdown(item.readyAt) }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from "vue";
import { useConvexClient } from "~/composables/useConvexClient";
import { useConvexQuery } from "~/composables/useConvexQuery";
import EggAnimation from "~/components/EggAnimation.vue";

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

const eggTypes = [
  {
    value: "soft",
    label: "na měkko",
    description: "Silky white and a runny center."
  },
  {
    value: "medium",
    label: "na hniličku",
    description: "Jammy yolk with tender whites."
  },
  {
    value: "hard",
    label: "na tvrdo",
    description: "Fully set, classic breakfast style."
  }
];

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

const eggLabel = (eggType: string) => {
  return eggTypes.find((type) => type.value === eggType)?.label ?? eggType;
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

const orderStatus = (order: any) => {
  if (!settings.value?.ordersClosed) return "Ordering";
  if (!settings.value?.cookingStartedAt) return "Queued";
  if (order.readyAt && now.value >= order.readyAt) return "Ready to serve";
  return "Cooking";
};

const timeRemaining = (order: any) => {
  if (!order.readyAt) return "";
  const diff = order.readyAt - now.value;
  if (diff <= 0) return "0:00";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const scheduleCountdown = (readyAt: number) => {
  const diff = readyAt - now.value;
  if (diff <= 0) return "Take eggs out now";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
};

onMounted(() => {
  const stored = localStorage.getItem("egg-user-id");
  if (stored) {
    userId.value = stored;
  }
});
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: "Inter", "Segoe UI", sans-serif;
  background: #f6f2ee;
  color: #1f1a17;
}

.page {
  min-height: 100vh;
  padding: 48px clamp(20px, 4vw, 64px) 72px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #9d8169;
  margin: 0;
}

h1 {
  font-size: clamp(32px, 5vw, 56px);
  margin: 8px 0 12px;
}

.subtitle {
  font-size: 18px;
  color: #5a4c43;
  margin: 0;
}

.status-card {
  background: #fff;
  padding: 20px 24px;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(52, 34, 23, 0.1);
  min-width: 220px;
}

.status-card .label {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #9d8169;
}

.status-card .value {
  font-size: 24px;
  margin: 8px 0;
  font-weight: 600;
}

.status-card .value.open {
  color: #1e7f5a;
}

.status-card .value.closed {
  color: #c2442c;
}

.status-card .detail {
  margin: 0;
  color: #7a6a60;
}

.content {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.panel {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 16px 40px rgba(52, 34, 23, 0.12);
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
}

.field input,
.field select {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5dbd4;
  font-size: 16px;
}

.primary {
  background: #f9a03f;
  border: none;
  color: #1f1a17;
  padding: 12px 18px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.egg-choice {
  border: 1px solid #eadfd8;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.egg-choice input {
  display: none;
}

.egg-choice.active {
  border-color: #f9a03f;
  box-shadow: 0 12px 24px rgba(249, 160, 63, 0.25);
}

.order-actions {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.notice {
  background: #fff6e8;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #f9a03f;
  color: #7a4b15;
}

.order-card,
.schedule {
  background: #fdfbf9;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
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
</style>
