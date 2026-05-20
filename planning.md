## Notes

- Confirmed `src/pages/api/proxy.ts` is being handled as a prerendered route in the current Astro setup, and Astro clears `request.url` search params for prerendered routes.
- Fix: mark the endpoint as `prerender = false` so it runs on demand, then parse query params from `new URL(request.url)`.
- Confirmed proxied pages are rendered into the app document, so relative `href`/`src`/stylesheet references resolve against `localhost` instead of the fetched page URL.
- Fix: expose the final upstream URL from the proxy response, then rewrite relative document references in the client before rendering and keep anchor navigation inside the browser component.
- Confirmed the repo does not include a Webdings font file, and the existing `@font-face` only points to local system Webdings, which is absent on Linux.
- Fix: stop relying on proprietary Webdings digit mappings for the few browser controls and use real symbol glyphs with a local symbol-font stack in CSS.
- Confirmed `src/components/win95/browser/WebControls.svelte` still used Webdings digit mappings for Back/Forward even though matching 16x16 IE arrow assets already exist in `public/icons/95/custom/IE1/`.
- Fix: swap the toolbar Back/Forward controls to `BlackLeft.png` and `BlackRight.png` so the arrows render consistently without a system Webdings font.
- Confirmed `src/components/win95/ApplicationBorder.svelte` still used legacy title-bar glyph mappings (`0`, `1`, `r`) for minimize/maximize/close.
- Fix: replace those character-based controls with CSS-drawn Win95 button glyphs so title bar controls render consistently without any symbol font dependency.
- Confirmed proxied pages were injected directly into the host document, so remote CSS root selectors targeted the app page instead of the browser pane; the host browser content area also forced its own white background and padding.
- Fix: render fetched pages inside a shadow root, remove the host padding/background, preserve `html`/`body` presentation attributes on an inner wrapper, and scope remote `html`/`body`/`:root` CSS rules to that wrapper so backgrounds and layout apply inside the browser window.
- Confirmed form submissions inside fetched pages were not intercepted, so Google search and similar GET/POST flows could escape the in-app browser or fail to resolve against the proxied document URL.
- Fix: intercept form submits in `Browser.svelte`, resolve actions against the current document address, and route the resulting request back through the browser loader.
- Confirmed `src/pages/api/proxy.ts` always decoded upstream responses as text, which corrupts CSS asset handling and any non-text resource fetched through the proxy.
- Fix: proxy CSS, text, and binary responses separately, and rewrite proxied CSS `url(...)` / `@import` references so linked stylesheets and background assets continue loading through `/api/proxy`.
- Confirmed the repo did not define an `M95` font family even though it already ships the regular Win95 `MS Sans Serif 8pt.ttf` asset.
- Fix: alias that shipped Win95 font as `M95` in global CSS and force the browser shadow-root content tree and pseudo-elements to use `M95` with an `!important` override, keeping the change scoped to rendered page content.
