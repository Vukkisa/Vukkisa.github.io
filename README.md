# vukkisa.github.io

Jayanth Vukkisa's portfolio: *from writing queries to teaching machines.*

Hand-built static site. No framework, no build step, no dependencies.

```
index.html          content and structure
css/styles.css      design tokens + layout
css/js/main.js      every interactive piece (one module per section)
assests/            résumé PDF (folder name kept so existing links keep working)
```

Run locally: `python3 -m http.server` and open http://localhost:8000

Keyboard: press `/` (or Ctrl/Cmd+K) to jump between sections.

Demos on the page (retriever, zone simulator, forecasts, etc.) are small illustrative models
running in the browser. They are not the production systems they are named after.
