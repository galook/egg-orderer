import { describe, it, expect } from "vitest";
import {
  getEggLabel,
  getOrderStatus,
  getScheduleCountdown,
  getTimeRemaining,
  formatTime
} from "../utils/egg";

describe("egg utils", () => {
  it("returns the localized label for known types", () => {
    expect(getEggLabel("soft")).toBe("na měkko");
    expect(getEggLabel("medium")).toBe("na hniličku");
    expect(getEggLabel("hard")).toBe("na tvrdo");
  });

  it("falls back to the raw value for unknown types", () => {
    expect(getEggLabel("poached")).toBe("poached");
  });

  it("formats missing time as placeholder", () => {
    expect(formatTime(null)).toBe("--");
    expect(formatTime(undefined)).toBe("--");
  });

  it("returns ordering status while window is open", () => {
    const status = getOrderStatus({ readyAt: null }, { ordersClosed: false }, 0);
    expect(status).toBe("Ordering");
  });

  it("returns queued before cooking starts", () => {
    const status = getOrderStatus({ readyAt: null }, { ordersClosed: true }, 0);
    expect(status).toBe("Queued");
  });

  it("returns ready when the countdown completes", () => {
    const status = getOrderStatus({ readyAt: 1000 }, { ordersClosed: true, cookingStartedAt: 1 }, 1500);
    expect(status).toBe("Ready to serve");
  });

  it("returns cooking when in progress", () => {
    const status = getOrderStatus({ readyAt: 2000 }, { ordersClosed: true, cookingStartedAt: 1 }, 1000);
    expect(status).toBe("Cooking");
  });

  it("renders time remaining in mm:ss", () => {
    expect(getTimeRemaining(61000, 0)).toBe("1:01");
  });

  it("returns zero for past ready times", () => {
    expect(getTimeRemaining(1000, 2000)).toBe("0:00");
  });

  it("returns empty for missing ready time", () => {
    expect(getTimeRemaining(null, 2000)).toBe("");
  });

  it("returns a pull-out call to action after time elapses", () => {
    expect(getScheduleCountdown(1000, 2000)).toBe("Take eggs out now");
  });

  it("returns remaining countdown for future ready time", () => {
    expect(getScheduleCountdown(61000, 0)).toBe("1:01 remaining");
  });
});
