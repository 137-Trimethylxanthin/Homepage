<script lang="ts">
    export let otherClass = '';
    export let color = 'teal'

</script>

<h1 class="text-8xl text-{color} font-bold mb-4 {otherClass}">
    <strong><slot/></strong>
</h1>