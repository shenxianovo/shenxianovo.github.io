<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

export let slug: string;
export let increment = false;
export let apiBase: string;

let count: number | null = null;

onMount(async () => {
	try {
		if (increment) {
			const res = await fetch(`${apiBase}?slug=${encodeURIComponent(slug)}`, {
				method: "POST",
			});
			if (res.ok) {
				count = Number.parseInt(await res.text(), 10) || 0;
			}
		} else {
			const res = await fetch(`${apiBase}?slug=${encodeURIComponent(slug)}`);
			if (res.ok) {
				count = Number.parseInt(await res.text(), 10) || 0;
			}
		}
	} catch {
		// silently fail — view count is non-critical
	}
});
</script>

<div class="flex flex-row items-center">
  <slot />
  <div class="text-sm">
    {#if count !== null}
      {count} 次浏览
    {:else}
      <span class="opacity-50">- 次浏览</span>
    {/if}
  </div>
</div>
