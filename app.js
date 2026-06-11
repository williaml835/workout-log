const appRoot = document.getElementById("app");
const bundleChunks = [0, 1, 2, 3];

async function loadText(path) {
  const response = await fetch(`${path}?v=12`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${path} (${response.status})`);
  }
  return (await response.text()).trim();
}

async function loadWorkoutLog() {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser is too old to open this app. Update your browser and try again.");
  }

  const encoded = (await Promise.all(
    bundleChunks.map((chunk) => loadText(`./app.bundle.${chunk}.txt`)),
  )).join("");
  const compressed = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const source = await new Response(stream).text();
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

  try {
    await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

loadWorkoutLog().catch((error) => {
  console.error(error);
  if (appRoot) {
    appRoot.innerHTML = `
      <main class="auth-layout">
        <section class="auth-card">
          <h1>Workout Log could not load.</h1>
          <p>${String(error.message || error)}</p>
        </section>
      </main>
    `;
  }
});
