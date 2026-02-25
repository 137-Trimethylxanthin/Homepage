<script lang="ts">
  let {
    handleAddressChange = $bindable((address: string): void => {}),
  }: { handleAddressChange?: (address: string) => void } = $props();

  let address: string = $state("/");
  //bind enter to handleAddressChange
  $effect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const checkedAddress = address.trim();
        handleAddressChange(checkedAddress ?? "/");
      }
    });
  });
</script>

<div
  class="flex items-center gap-2 border-b border-t border-[#9f9f9f] bg-[#c0c0c0] px-2 py-1 text-sm"
>
  <label for="address">Address:</label>
  <input
    id="address"
    type="text"
    bind:value={address}
    class="h-6 flex-1 bg-white px-2 text-sm outline-none win95-sunken"
  />
  <button
    type="button"
    class="webdings-icon toolbar-button"
    aria-label="Address options"
    onclick={() => handleAddressChange(address)}>4</button
  >
</div>
