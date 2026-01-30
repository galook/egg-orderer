import { describe, it, expect, vi } from "vitest";
import { effectScope, ref, nextTick } from "vue";
import { useConvexQuery } from "../composables/useConvexQuery";

const createClient = () => {
  const unsubscribe = vi.fn();
  let onUpdateCb: ((value: unknown) => void) | null = null;
  let onErrorCb: ((err: Error) => void) | null = null;
  const client = {
    onUpdate: vi.fn((_name, _args, cb, errCb) => {
      onUpdateCb = cb;
      onErrorCb = errCb ?? null;
      return { unsubscribe };
    })
  } as any;
  return { client, unsubscribe, getOnUpdate: () => onUpdateCb, getOnError: () => onErrorCb };
};

describe("useConvexQuery", () => {
  it("subscribes with onUpdate and updates data", async () => {
    const { client, unsubscribe, getOnUpdate } = createClient();
    const scope = effectScope();
    let data: any;
    let error: any;

    scope.run(() => {
      ({ data, error } = useConvexQuery(
        () => ({ name: "orders:list", args: {} }),
        client,
        []
      ));
    });

    expect(client.onUpdate).toHaveBeenCalledWith(
      "orders:list",
      {},
      expect.any(Function),
      expect.any(Function)
    );
    expect(data.value).toEqual([]);

    getOnUpdate()?.(["ok"]);
    await nextTick();

    expect(data.value).toEqual(["ok"]);
    expect(error.value).toBeNull();

    scope.stop();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("captures errors and resets to initial when query is disabled", async () => {
    const { client, getOnError } = createClient();
    const scope = effectScope();
    const enabled = ref(true);
    let data: any;
    let error: any;

    scope.run(() => {
      ({ data, error } = useConvexQuery(
        () => (enabled.value ? { name: "orders:list", args: {} } : null),
        client,
        []
      ));
    });

    getOnError()?.(new Error("boom"));
    await nextTick();
    expect(error.value?.message).toBe("boom");

    enabled.value = false;
    await nextTick();
    expect(data.value).toEqual([]);

    scope.stop();
  });
});
