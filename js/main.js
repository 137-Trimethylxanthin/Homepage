document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const links = document.querySelectorAll("nav a");

  // Function to load content dynamically
  const loadPage = async (page, addToHistory = true) => {
    try {
      const response = await fetch(`${page}.html`);
      if (!response.ok) throw new Error("Page not found");
      const html = await response.text();
      content.innerHTML = html;

      // Update browser history
      if (addToHistory) {
        history.pushState({ page }, "", `/${page}`);
      }
    } catch (error) {
      content.innerHTML = `<h2>Error</h2><p>${error.message}</p>`;
    }
  };

  // Attach click event to navigation links
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = event.target.dataset.page;
      loadPage(page);
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.page) {
      loadPage(event.state.page, false);
    } else {
      content.innerHTML = `<h2>Welcome!</h2><p>Click a link to load a page.</p>`;
    }
  });

  // Load the correct page on initial load
  const initialPage = window.location.pathname.slice(1) || "home";
  loadPage(initialPage, false);
});
