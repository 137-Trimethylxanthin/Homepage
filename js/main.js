document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  // Function to load content dynamically
  const loadPage = async (page, addToHistory = true) => {
      //temp remove the Homepage/ from the pathname
    page = page.replace("Homepage/", "");
    if (!page || page === "index") {
      content.innerHTML = `<h2>Welcome!</h2><p>Click a link to load a page.</p>`;
      content.innerHTML += `
      <nav>
       <a href="index.html" data-page="index">index</a>
            <a href="home.html" data-page="home">home</a>
            <a href="test.html" data-page="test">test</a>
          </nav>
      `

    } else {
      try {
        const response = await fetch(`${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        content.innerHTML = html;


      } catch (error) {
        content.innerHTML = `<h2>Error</h2><p>${error.message}</p>`;
      }
    }
    // Update browser history
    if (addToHistory) {
      history.pushState({ page }, "", `/${page}.html`);
    }

    let searchBar = document.getElementById("search");

    //replace http or https with www.
    let url = window.location.href.replace(/(^\w+:|^)\/\//, '');

    //set current page for the input field
    searchBar.value = `${url}`;

    const links = document.querySelectorAll("nav a");

    // Attach click event to navigation links
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const page = event.target.dataset.page;
        loadPage(page);
      });
    });
  };

  // Handle browser back/forward buttons
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.page) {
      loadPage(event.state.page, false);
    } else {
      content.innerHTML = `<h2>Welcome!</h2><p>Click a link to load a page.</p>`;
      content.innerHTML += `
      <nav>
						<a href="home.html" data-page="home">home</a>
						<a href="test.html" data-page="test">test</a>
					</nav>
      `
    }
  });

  // Load the correct page on initial load
  const initialPage = window.location.pathname.slice(1).slice(0, -5);
  console.log("initialPage: " + initialPage);
  loadPage(initialPage, false);
});
