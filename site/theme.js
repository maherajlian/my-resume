(() => {
  const key = "resume-theme";
  const root = document.documentElement;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const validPreference = (value) => value === "light" || value === "dark";
  let preference = null;
  let button;

  try {
    const saved = window.localStorage.getItem(key);
    if (validPreference(saved)) preference = saved;
  } catch {}

  function applyTheme() {
    const theme = preference || (media && media.matches ? "dark" : "light");
    root.dataset.theme = theme;
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#141b18" : "#f7f7f2");
    if (button) button.setAttribute("aria-pressed", String(theme === "dark"));
  }

  function setupToggle() {
    button = document.getElementById("theme-toggle");
    if (!button) return;
    applyTheme();
    button.hidden = false;
    button.addEventListener("click", () => {
      preference = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(key, preference);
      } catch {}
      applyTheme();
    });
  }

  applyTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupToggle, { once: true });
  } else {
    setupToggle();
  }

  if (media && media.addEventListener) {
    media.addEventListener("change", () => {
      if (!preference) applyTheme();
    });
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== key && event.key !== null) return;
    preference = validPreference(event.newValue) ? event.newValue : null;
    applyTheme();
  });
})();
