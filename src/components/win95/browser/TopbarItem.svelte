<script lang="ts">
  type TopbarItem = { title: string };

  let { title }: { title: string } = $props();
</script>

<div class="flex items-center text-sm cursor-pointer">
  <span>
    <span class="underline">{title.slice(0, 1)}</span>{title.slice(1)}
  </span>
</div>
