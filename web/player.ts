import { build } from "../src/build.ts";
import type { Stage } from "../src/trace.ts";
import sources from "./source.json" with { type: "json" };

const names: Record<Stage, string> = {
  input: "Read the message",
  segments: "Encode the characters",
  padding: "Fill the data capacity",
  correction: "Add error correction",
  interleave: "Interleave the blocks",
  finders: "Place the finders",
  timing: "Draw the timing tracks",
  alignment: "Add alignment patterns",
  reserved: "Reserve the metadata",
  data: "Place the data bits",
  remainder: "Fill the remainder",
  masks: "Compare the eight masks",
  mask: "Apply the selected mask",
  format: "Write the format bits",
  complete: "The finished QR code",
};

const root = document.querySelector<HTMLElement>("[data-qr-build]");
if (root) mount(root);

function mount(root: HTMLElement) {
  root.innerHTML =
    `<form class="qr-inputs"><label class="qr-message">Your message<input name="message" value="ABC123" maxlength="3000" spellcheck="false" autocomplete="off"></label><label>Version<select name="version" aria-label="QR version"></select></label><label>Mask<select name="mask"><option value="-1">Automatic</option>${
      Array.from({ length: 8 }, (_, i) => `<option value="${i}">${i}</option>`)
        .join("")
    }</select></label><button type="submit">Build QR code ↗</button></form><p class="qr-error" role="alert" hidden></p><p class="qr-meta"></p><div class="qr-workbench"><div class="qr-preview"><div class="qr-overline"><span>THE SYMBOL</span><span class="qr-position"></span></div><canvas class="qr-main-canvas" width="580" height="580" role="img" aria-label="QR code construction"></canvas><div class="qr-legend"><span><i class="qr-unknown"></i>Unfilled</span><span><i class="qr-light"></i>0 / light</span><span><i class="qr-dark"></i>1 / dark</span></div><p class="qr-current"></p><div class="qr-controls"><button type="button" data-action="start" aria-label="Restart">↺</button><button type="button" data-action="back" aria-label="Previous event">←</button><button type="button" data-action="play">Play</button><button type="button" data-action="next" aria-label="Next event">→</button><button type="button" data-action="finish">Finish</button></div><label class="qr-scrub">Construction progress<input type="range" name="progress" min="0" value="0" step="1"></label><label class="qr-speed">Speed<select name="speed"><option value="12">12 cells / sec</option><option value="80" selected>80 cells / sec</option><option value="400">400 cells / sec</option><option value="1600">1,600 cells / sec</option></select></label><p class="qr-status" role="status" aria-live="polite"></p></div><div class="qr-inspector"><div class="qr-overline"><span>THE RUNNING CODE</span><span class="qr-function"></span></div><h2 class="qr-stage-title"></h2><div class="qr-values" aria-label="Current encoded values"></div><pre class="qr-source" tabindex="0"><code></code></pre></div></div><nav class="qr-stages" aria-label="Construction stages"></nav><section class="qr-gallery-section"><div class="qr-section-heading"><div><span class="qr-kicker">THE CONSTRUCTION, FRAME BY FRAME</span><h2>Every stage leaves a trace.</h2></div><p>Choose a frame to move the player to that point.</p></div><div class="qr-gallery"></div></section><section class="qr-masks-section"><div class="qr-section-heading"><div><span class="qr-kicker">MASK CANDIDATES</span><h2>Choose the lowest penalty.</h2></div><p>The same message, with each candidate mask.</p></div><div class="qr-masks"></div></section>`;
  const get = <T extends Element = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const form = get<HTMLFormElement>("form");
  const version = get<HTMLSelectElement>('[name="version"]');
  version.innerHTML = Array.from(
    { length: 40 },
    (_, i) =>
      `<option value="${i + 1}">${i + 1} · ${17 + 4 * (i + 1)} × ${
        17 + 4 * (i + 1)
      }</option>`,
  ).join("");
  const progress = get<HTMLInputElement>('[name="progress"]');
  const canvas = get<HTMLCanvasElement>(".qr-main-canvas");
  const play = get<HTMLButtonElement>('[data-action="play"]');
  let result: ReturnType<typeof build>;
  let cursor = 0,
    running = false,
    raf = 0,
    last = 0,
    credit = 0,
    shownSource = "";
  let stageEnds: { stage: Stage; end: number }[] = [];

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    play.textContent = "Play";
  }

  function render() {
    const event = result.trace.events[cursor - 1];
    draw(
      canvas,
      result.trace.frame(cursor),
      result.info.edgeLength,
      event?.x,
      event?.y,
      cursor === result.trace.events.length,
    );
    progress.value = String(cursor);
    get(".qr-position").textContent =
      `${cursor.toLocaleString()} / ${result.trace.events.length.toLocaleString()}`;
    const stage = event?.stage ?? "input";
    const label = event?.label ?? "A blank grid. Press Play to start.";
    get(".qr-stage-title").textContent = names[stage];
    get(".qr-current").textContent = label;
    canvas.setAttribute("aria-label", `${names[stage]}. ${label}`);
    if (!running) get(".qr-status").textContent = label;
    const sourceName = event?.source ?? "build";
    get(".qr-function").textContent = `${sourceName}()`;
    if (shownSource !== sourceName) {
      get(".qr-source code").textContent =
        sources[sourceName as keyof typeof sources] || sources.build;
      get(".qr-source").scrollTop = 0;
      shownSource = sourceName;
    }
    const values = event?.values;
    get(".qr-values").textContent = values
      ? values.map((value) =>
        stage === "segments"
          ? String(value)
          : value.toString(16).padStart(2, "0").toUpperCase()
      ).join(stage === "segments" ? "" : " ")
      : event?.bitIndex !== undefined
      ? `BIT ${
        event.bitIndex + 1
      }   →   (${event.x}, ${event.y})   =   ${event.value}`
      : event?.x !== undefined
      ? `(${event.x}, ${event.y})   =   ${event.value}`
      : "";
    root.querySelectorAll<HTMLButtonElement>(".qr-stages button").forEach(
      (button) => {
        button.setAttribute(
          "aria-current",
          button.dataset.stage === stage ? "step" : "false",
        );
      },
    );
  }

  function seek(value: number) {
    stop();
    cursor = Math.max(0, Math.min(result.trace.events.length, value));
    render();
  }

  function tick(now: number) {
    if (!running) return;
    credit += Math.min(now - last, 100) *
      Number(get<HTMLSelectElement>('[name="speed"]').value) / 1000;
    last = now;
    if (credit >= 1) {
      const count = Math.floor(credit);
      credit -= count;
      cursor = Math.min(cursor + count, result.trace.events.length);
      if (cursor === result.trace.events.length) stop();
      render();
    }
    if (running) raf = requestAnimationFrame(tick);
  }

  function thumbnail(
    stage: Stage,
    end: number,
    container: HTMLElement,
    title: string,
  ) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "qr-frame";
    const image = document.createElement("canvas");
    image.width = image.height = Math.max(
      232,
      (result.info.edgeLength + 8) * 3,
    );
    image.setAttribute("aria-hidden", "true");
    const caption = document.createElement("span");
    caption.textContent = title;
    button.append(image, caption);
    button.addEventListener("click", () => {
      seek(end);
      canvas.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
    });
    draw(
      image,
      result.trace.frame(end),
      result.info.edgeLength,
      undefined,
      undefined,
      stage === "complete" || stage === "masks",
    );
    container.append(button);
  }

  function generate() {
    stop();
    try {
      const next = build(
        get<HTMLInputElement>('[name="message"]').value,
        Number(version.value),
        Number(get<HTMLSelectElement>('[name="mask"]').value),
      );
      result = next;
      get(".qr-error").hidden = true;
    } catch (error) {
      get(".qr-error").textContent = error instanceof Error
        ? error.message
        : "Unable to encode this message.";
      get(".qr-error").hidden = false;
      return;
    }
    get(".qr-masks-section h2").textContent =
      Number(get<HTMLSelectElement>('[name="mask"]').value) < 0
        ? "Choose the lowest penalty."
        : "Inspect the selected mask.";
    get(".qr-masks-section .qr-section-heading p").textContent =
      Number(get<HTMLSelectElement>('[name="mask"]').value) < 0
        ? "The same message, with each candidate mask."
        : "Choose Automatic to compare all eight candidates.";
    cursor = 0;
    shownSource = "";
    const ecl = ["M", "L", "H", "Q"][result.info.ecl];
    get(".qr-meta").textContent =
      `Version ${result.info.version} · ${result.info.edgeLength} × ${result.info.edgeLength} cells · correction ${ecl} · ${result.bytes.length} bytes · ${
        result.mode === 2 ? "alphanumeric" : "byte"
      } mode · runs in your browser`;
    progress.max = String(result.trace.events.length);
    stageEnds = [];
    result.trace.events.forEach((event, index, events) => {
      if (events[index + 1]?.stage !== event.stage) {
        stageEnds.push({ stage: event.stage, end: index + 1 });
      }
    });
    get(".qr-stages").replaceChildren();
    get(".qr-gallery").replaceChildren();
    get(".qr-masks").replaceChildren();
    stageEnds.forEach(({ stage, end }, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.stage = stage;
      button.textContent = `${String(index + 1).padStart(2, "0")} ${
        names[stage]
      }`;
      button.addEventListener("click", () => seek(end));
      get(".qr-stages").append(button);
      if (
        [
          "finders",
          "timing",
          "alignment",
          "reserved",
          "data",
          "remainder",
          "mask",
          "format",
          "complete",
        ].includes(stage)
      ) {
        thumbnail(stage, end, get(".qr-gallery"), names[stage]);
      }
    });
    result.trace.events.forEach((event, index) => {
      if (event.stage === "masks") {
        thumbnail(
          "masks",
          index + 1,
          get(".qr-masks"),
          `Mask ${event.mask} · ${event.penalty} points${
            event.mask === result.mask ? " · selected" : ""
          }`,
        );
      }
    });
    render();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });
  progress.addEventListener("input", () => seek(Number(progress.value)));
  get('[data-action="start"]').addEventListener("click", () => seek(0));
  get('[data-action="back"]').addEventListener("click", () => seek(cursor - 1));
  get('[data-action="next"]').addEventListener("click", () => seek(cursor + 1));
  get('[data-action="finish"]').addEventListener(
    "click",
    () => seek(result.trace.events.length),
  );
  play.addEventListener("click", () => {
    if (running) {
      stop();
      render();
      return;
    }
    if (cursor === result.trace.events.length) cursor = 0;
    running = true;
    play.textContent = "Pause";
    last = performance.now();
    credit = 0;
    raf = requestAnimationFrame(tick);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  generate();
}

function draw(
  canvas: HTMLCanvasElement,
  grid: Int8Array,
  size: number,
  x?: number,
  y?: number,
  complete = false,
) {
  const scale = Math.max(1, Math.floor(canvas.width / (size + 8)));
  const pixels = scale * (size + 8);
  if (canvas.width !== pixels) canvas.width = canvas.height = pixels;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pixels, pixels);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = grid[row * size + col];
      context.fillStyle = value < 0 ? "#e4e8e2" : value ? "#13281e" : "#ffffff";
      context.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
    }
  }
  if (!complete && x !== undefined && y !== undefined) {
    context.strokeStyle = "#ef733f";
    context.lineWidth = Math.max(1, scale / 5);
    context.strokeRect((x + 4) * scale, (y + 4) * scale, scale, scale);
  }
}
