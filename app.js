const appRoot = document.getElementById("app");
const bundleChunks = [0, 1, 2, 3, 4];

async function loadText(path) {
  const response = await fetch(`${path}?v=13`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.text();
}

async function inflateGzipBase64(value) {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser is too old to load the compressed app bundle.");
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const stream = new Blob([bytes], { type: "application/gzip" })
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function boot() {
  try {
    const encoded = (await Promise.all(
      bundleChunks.map((index) => loadText(`./app.bundle.${index}.txt`)),
    )).join("");
    const source = await inflateGzipBase64(encoded);
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    await import(url);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    appRoot.innerHTML = `
      <main class="auth-layout">
        <section class="auth-card">
          <h1>Workout Log could not load.</h1>
          <p class="error">${error.message || "Refresh the page and try again."}</p>
        </section>
      </main>
    `;
  }
}

boot();
