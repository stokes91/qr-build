const files = [
  "src/build.ts",
  "src/lib/quick_response_code/lib/CodewordEncoder.ts",
  "src/lib/quick_response_code/lib/ModuleCanvas.ts",
];
const names = [
  "build",
  "appendSegment",
  "toArray",
  "placeFinderPattern",
  "placeFunctionPatterns",
  "placeAlignmentPattern",
  "drawFormatBits",
  "placeDataBits",
  "applyMaskAndEvaluate",
  "computePenalty",
  "getModuleMatrixWithQuietZone",
];
const snippets: Record<string, string> = {};
for (const file of files) {
  const source = await Deno.readTextFile(file);
  for (const name of names) {
    const pattern = new RegExp(
      `^(?:export function |  (?:private |public )?)${name}\\(`,
      "m",
    );
    const match = pattern.exec(source);
    if (!match) continue;
    const start = match.index;
    const endPattern = file === "src/build.ts" ? /^}/m : /^  }/m;
    const rest = source.slice(start);
    const end = endPattern.exec(rest)!;
    snippets[name] = rest.slice(0, end.index + end[0].length).replace(
      /^  /gm,
      "",
    );
  }
}
await Deno.writeTextFile("web/source.json", JSON.stringify(snippets));
await Deno.mkdir("dist", { recursive: true });
const command = new Deno.Command(Deno.execPath(), {
  args: [
    "bundle",
    "--platform=browser",
    "--minify",
    "web/player.ts",
    "-o",
    "dist/player.js",
  ],
  stdout: "inherit",
  stderr: "inherit",
});
if (!(await command.output()).success) Deno.exit(1);
for (const name of ["index.html", "player.css"]) {
  await Deno.copyFile(`web/${name}`, `dist/${name}`);
}
