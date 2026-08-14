import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), ".next", "static");

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await cssFiles(file));
    else if (entry.name.endsWith(".css")) files.push(file);
  }

  return files;
}

const files = await cssFiles(root);
let changed = 0;

for (const file of files) {
  const before = await readFile(file, "utf8");
  const after = before
    .replaceAll("calc(var(--spacing)*", "calc(var(--spacing) * ")
    .replace(/calc\(var\(--radius\)([+-])([^\)]+)\)/g, "calc(var(--radius) $1 $2)")
    .replace(/calc\(([^()]+)\/([^()]+)\)/g, "calc($1 / $2)");

  if (after !== before) {
    await writeFile(file, after);
    changed++;
  }
}

console.log(`Normalized Tailwind calc expressions in ${changed} CSS files.`);
