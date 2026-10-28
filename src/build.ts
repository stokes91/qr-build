import { CodewordEncoder } from "./lib/quick_response_code/lib/CodewordEncoder.ts";
import { ModuleCanvas } from "./lib/quick_response_code/lib/ModuleCanvas.ts";
import { SymbolSizes } from "./lib/quick_response_code/lib/SymbolSizes.ts";
import { Trace } from "./trace.ts";

export function build(text: string, version = 1, mask = -1) {
  if (!Number.isInteger(version) || version < 1 || version > 40) {
    throw new RangeError("Choose a version from 1 to 40.");
  }
  if (!Number.isInteger(mask) || mask < -1 || mask > 7) {
    throw new RangeError("Choose a mask from 0 to 7, or automatic.");
  }
  const bytes = new TextEncoder().encode(text);
  const mode =
    [...text].every((c) =>
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".includes(c)
      )
      ? 2
      : 4;
  const ecl = version < 4 ? 2 : version < 10 ? 3 : version < 14 ? 0 : 1;
  const info = SymbolSizes[ecl][version];
  const trace = new Trace(info.edgeLength);
  trace.observe({
    stage: "input",
    source: "build",
    label: `${bytes.length} UTF-8 bytes · ${
      mode === 2 ? "alphanumeric" : "byte"
    } mode`,
    values: [...bytes],
  });
  const encoder = new CodewordEncoder(version, trace.observe).appendSegment(
    bytes,
    mode,
  );
  const codewords = encoder.toArray(
    info.codewordCount,
    info.eccPerBlock,
    info.blocksCount,
  );
  const canvas = new ModuleCanvas(info, mask, trace.observe);
  canvas.placeDataBits(codewords);
  canvas.getModuleMatrixWithQuietZone();
  return {
    trace,
    info,
    mode,
    bytes,
    codewords,
    mask: canvas.getMaskId(),
    coords: canvas.barcodeCanvas.getCoords(),
  };
}
