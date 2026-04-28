import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = process.argv[2] || '/tmp/hu_50k.txt';
const outputPath = path.resolve(__dirname, '..', 'src', 'data', 'words.ts');

const raw = fs.readFileSync(inputPath, 'utf8');

// Keep only words that consist of Hungarian letters. Allow hyphen inside words.
const hungarianWord = /^[a-záéíóöőúüűabcdefghijklmnopqrstuvwxyz]+(-[a-záéíóöőúüűabcdefghijklmnopqrstuvwxyz]+)*$/i;

const seen = new Set();
const words = [];

for (const line of raw.split('\n')) {
  const [w, fStr] = line.trim().split(/\s+/);
  if (!w) continue;
  const lower = w.toLowerCase();
  if (lower.length < 2) continue;
  if (!hungarianWord.test(lower)) continue;
  if (seen.has(lower)) continue;
  seen.add(lower);
  const freq = parseInt(fStr, 10) || 0;
  words.push([lower, freq]);
}

// Already sorted by frequency desc in source file, but resort for safety.
words.sort((a, b) => b[1] - a[1]);

// Just keep the words array (index implicitly encodes rank).
const justWords = words.map(([w]) => w);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `// Auto-generated from hu_50k frequency list.\n// ${justWords.length} Hungarian words, ordered by descending frequency.\n\nconst WORDS: string[] = ${JSON.stringify(justWords)};\n\nexport default WORDS;\n`
);

console.log(`Wrote ${justWords.length} words to ${outputPath}`);
