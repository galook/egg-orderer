import { ref, watchEffect, onScopeDispose } from "vue";
import type { ConvexClient } from "convex/browser";

export const useConvexQuery = <T = any>(
  getQuery: () => { name: string; args: Record<string, unknown> } | null,
  client: ConvexClient,
  initialValue: T | null = null
) => {
  const data = ref<T | null>(initialValue);
  const error = ref<Error | null>(null);

  watchEffect((onCleanup) => {
    const query = getQuery();
    if (!query) {
      data.value = initialValue;
      return;
    }

    const subscription = client.onUpdate(
      query.name,
      query.args,
      (result) => {
        data.value = result as T;
        error.value = null;
      },
      (err) => {
        error.value = err;
      }
    );

    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  onScopeDispose(() => {
    data.value = initialValue;
  });

  return { data, error };
};
