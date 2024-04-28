<script>

    const theme = (() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
    })();


    if (theme === 'frappe') {
        document.getElementsByTagName("body")[0].classList.remove('mocha');
    } else {
        document.getElementsByTagName("body")[0].classList.add('mocha');
    }

    window.localStorage.setItem('theme', theme);

    const handleToggleClick = () => {
        const element = document.getElementsByTagName("body")[0];
        console.log(element.classList);
        element.classList.toggle("mocha");
        element.classList.toggle("frappe");


        const isDark = element.classList.contains("mocha");
        localStorage.setItem("theme", isDark ? "mocha" : "frappe");
    }

</script>

<button on:click={handleToggleClick}>
    Change
</button>

