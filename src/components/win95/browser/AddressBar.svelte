<script lang="ts">
  let {
    address = $bindable("/"),
    handleAddressChange = $bindable((address: string): void => {}),
  }: {
    address?: string;
    handleAddressChange?: (address: string) => void;
  } = $props();

  function submitAddress(): void {
    handleAddressChange(address.trim() || "/");
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      submitAddress();
    }
  }
</script>

<div
  class="flex items-center gap-2 border-b border-t border-[#9f9f9f] bg-[#c0c0c0] px-2 py-1 text-sm"
>
  <label for="address">Address:</label>
  <input
    id="address"
    type="text"
    bind:value={address}
    onkeydown={handleKeydown}
    class="h-6 flex-1 bg-white px-2 text-sm outline-none win95-sunken"
  />
  <button
    type="button"
    class="webdings-icon toolbar-button"
    aria-label="Address options"
    onclick={submitAddress}>4</button
  >
</div>
