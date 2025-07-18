import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "OneSec Summary",
    description: "Get instant one-sentence summaries of any webpage using AI",
    permissions: ["activeTab", "scripting", "storage", "sidePanel"],
    host_permissions: ["<all_urls>"],
    side_panel: {
      default_path: "side-panel.html",
    },
  },
});
