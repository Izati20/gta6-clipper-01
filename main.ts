// gta6-clipper-01 entry program.
//
// The entry itself is a public YouTube Short (a vertical GTA VI clip that
// ends with the make.fun pitch). This program's whole job is to hand the
// video's address to the grader: it reads VIDEO.json from the repository
// root and copies it, byte for byte, into the output directory, where the
// house reads the video through the YouTube Data API.
//
// Node 22, standard library only.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Where this file lives is the repository root: VIDEO.json sits beside it.
// MAKEFUN_BOT_DIR overrides it when the grader unpacks the repo elsewhere.
const repoDir = process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));

// The grader sets MAKEFUN_OUTPUT_DIR; /output is the documented fallback.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(repoDir, "VIDEO.json");
if (!existsSync(source)) {
  console.error(`VIDEO.json not found in repository root (${repoDir})`);
  process.exit(1);
}

// Fail loudly on a malformed file rather than hand the grader junk: the
// house expects {"url": "https://www.youtube.com/shorts/<id>"}.
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, "utf8"));
} catch {
  console.error("VIDEO.json is not valid JSON");
  process.exit(1);
}
const url = (parsed as { url?: unknown })?.url;
// The house accepts the watch/shorts forms and the youtu.be short link.
const isYouTube =
  typeof url === "string" &&
  (url.startsWith("https://www.youtube.com/") || url.startsWith("https://youtu.be/"));
if (!isYouTube) {
  console.error("VIDEO.json does not carry a YouTube url");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "VIDEO.json");
copyFileSync(source, target);
console.log(`copied VIDEO.json -> ${target} (video: ${url})`);
