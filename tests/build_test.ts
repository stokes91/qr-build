import { build } from "../src/build.ts";
import { CodewordEncoder } from "../src/lib/quick_response_code/lib/CodewordEncoder.ts";
import fixtures from "./fixtures.json" with { type: "json" };

const assert = (value: unknown, message = "Assertion failed") => {
  if (!value) throw new Error(message);
};

Deno.test("final coordinates preserve the source encoder across versions and masks", async () => {
  for (const fixture of fixtures) {
    const result = build(fixture.text, fixture.version, fixture.mask);
    const actual = JSON.stringify(
      result.coords.map((c) => [c.x, c.y, c.isDark]),
    );
    const hash = Array.from(
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(actual)),
      ),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
    assert(hash === fixture.hash, `${fixture.version}/${fixture.mask}`);
    const final = result.trace.frame(result.trace.events.length);
    assert(final.every((value) => value === 0 || value === 1));
    for (const c of result.coords) {
      assert(final[(c.y - 4) * result.info.edgeLength + c.x - 4] === c.isDark);
    }
  }
});

Deno.test("placement records light cells, dark cells, remainder bits and reversible partial frames", () => {
  const { trace, codewords } = build("ABC123", 2);
  const data = trace.events.filter((e) => e.stage === "data");
  assert(data.length === codewords.length * 8);
  assert(new Set(data.map((e) => `${e.x},${e.y}`)).size === data.length);
  data.forEach((event, i) =>
    assert(event.value === ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1))
  );
  assert(data.some((e) => e.value === 0) && data.some((e) => e.value === 1));
  assert(trace.events.filter((e) => e.stage === "remainder").length === 7);
  assert(trace.frame(0).every((value) => value === -1));
  const first = trace.events.findIndex((e) => e.x !== undefined);
  assert(trace.frame(first + 1).filter((value) => value !== -1).length === 1);
  const before = [...trace.frame(first + 20)];
  trace.frame(trace.events.length);
  assert(
    JSON.stringify(before) === JSON.stringify([...trace.frame(first + 20)]),
  );
});

Deno.test("automatic masking selects the lowest recorded penalty and forced masks remain forced", () => {
  for (const mask of [-1, 0, 7]) {
    const result = build("ABC123", 1, mask);
    const candidates = result.trace.events.filter((event) =>
      event.stage === "masks"
    );
    assert(candidates.length === (mask < 0 ? 8 : 1));
    const lowest = candidates.reduce((a, b) =>
      a.penalty! <= b.penalty! ? a : b
    );
    assert(result.mask === lowest.mask);
    if (mask >= 0) assert(result.mask === mask);
  }
});

Deno.test("byte mode preserves UTF-8, padding is repeatable, and overflowing input is rejected", () => {
  const result = build("café 🌿", 4);
  assert(result.mode === 4);
  assert(
    JSON.stringify(result.trace.events[0].values) ===
      JSON.stringify([...new TextEncoder().encode("café 🌿")]),
  );
  const encoder = new CodewordEncoder(1).appendSegment(
    new TextEncoder().encode("ABC123"),
    2,
  );
  assert(
    JSON.stringify(encoder.toArray(9, 17, 1)) ===
      JSON.stringify(encoder.toArray(9, 17, 1)),
  );
  for (
    const args of [["A".repeat(100), 1, -1], ["ABC123", 0, -1], [
      "ABC123",
      1,
      8,
    ], ["ABC123", 1.5, -1]] as const
  ) {
    let rejected = false;
    try {
      build(args[0], args[1], args[2]);
    } catch (error) {
      rejected = error instanceof RangeError;
    }
    assert(rejected);
  }
});
