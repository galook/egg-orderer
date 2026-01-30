import { ref, watchEffect, onScopeDispose } from "vue";
import type { ConvexClient } from "convex/browser";

export const useConvexQuery = (
  getQuery: () => { name: string; args: Record<string, unknown> } | null,
  client: ConvexClient
) => {
  const data = ref<any>(null);
  const error = ref<Error | null>(null);

  watchEffect((onCleanup) => {
    const query = getQuery();
    if (!query) {
      data.value = null;
      return;
    }

    const subscription = client.onUpdate(
      query.name,
      query.args,
      (result) => {
        data.value = result;
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
    data.value = null;
  });

  return { data, error };
};
