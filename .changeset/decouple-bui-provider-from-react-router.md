---
'@backstage/core-app-api': patch
---

Added `BUIRouterProvider` to publish router integration via versioned context, enabling `BUIProvider` in `@backstage/ui` to detect the router without a direct `react-router-dom` dependency.
