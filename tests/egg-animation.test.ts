import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EggAnimation from "../components/EggAnimation.vue";

describe("EggAnimation", () => {
  it("renders with the provided type class", () => {
    const wrapper = mount(EggAnimation, { props: { type: "soft" } });
    expect(wrapper.classes()).toContain("egg");
    expect(wrapper.classes()).toContain("soft");
  });

  it("contains the visual layers", () => {
    const wrapper = mount(EggAnimation, { props: { type: "hard" } });
    expect(wrapper.find(".shell").exists()).toBe(true);
    expect(wrapper.find(".white").exists()).toBe(true);
    expect(wrapper.find(".yolk").exists()).toBe(true);
    expect(wrapper.find(".steam").exists()).toBe(true);
  });
});
