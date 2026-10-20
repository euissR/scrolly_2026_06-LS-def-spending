// Drives the Flourish story iframes: switches slide when a step scrolls into view.
document.querySelectorAll(".scrolly-stage").forEach((stage) => {
  const iframe = stage.querySelector("iframe");
  const base = iframe?.dataset.base;
  const steps = stage.querySelectorAll(".steps [data-slide]");
  if (!iframe || !base || !steps.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const url = new URL(iframe.src);
        const nextHash = `slide-${entry.target.dataset.slide}`;
        if (url.hash !== `#${nextHash}`) {
          url.hash = nextHash;
          iframe.src = url.toString();
        }
      });
    },
    { threshold: 0.6 },
  );

  steps.forEach((step) => observer.observe(step));
});
