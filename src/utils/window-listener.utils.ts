export function bindWindowEscape(callback: () => void) {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      callback();
    }
  });
}
