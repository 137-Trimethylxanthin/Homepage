<script lang="ts">
    export let otherClass = '';
    export let color = 'teal'
</script>

<h2 class="text-6xl text-{color} font-bold mb-4 {otherClass}">
    <strong><slot/></strong>
</h2>