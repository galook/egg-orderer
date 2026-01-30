export type EggType = "soft" | "medium" | "hard";

export const eggTypes = [
  {
    value: "soft",
    label: "na měkko",
    tag: "Silky",
    description: "Silky white with a bright, flowing yolk.",
    minutes: 4
  },
  {
    value: "medium",
    label: "na hniličku",
    tag: "Jammy",
    description: "A jammy center with tender whites.",
    minutes: 6.5
  },
  {
    value: "hard",
    label: "na tvrdo",
    tag: "Firm",
    description: "Fully set, sliceable, classic breakfast.",
    minutes: 10
  }
] as const;

export const getEggLabel = (eggType: string) => {
  return eggTypes.find((type) => type.value === eggType)?.label ?? eggType;
};

export const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

export type OrderSettings = {
  ordersClosed?: boolean | null;
  cookingStartedAt?: number | null;
};

export type OrderLike = {
  readyAt?: number | null;
};

export const getOrderStatus = (
  order: OrderLike,
  settings: OrderSettings | null | undefined,
  now: number
) => {
  if (!settings?.ordersClosed) return "Ordering";
  if (!settings?.cookingStartedAt) return "Queued";
  if (order.readyAt && now >= order.readyAt) return "Ready to serve";
  return "Cooking";
};

export const getTimeRemaining = (readyAt: number | null | undefined, now: number) => {
  if (!readyAt) return "";
  const diff = readyAt - now;
  if (diff <= 0) return "0:00";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getScheduleCountdown = (readyAt: number, now: number) => {
  const diff = readyAt - now;
  if (diff <= 0) return "Take eggs out now";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
};
