# Magyar Rímkereső (Hungarian Rhyme Search)

A small React + TypeScript + Vite app that takes a Hungarian word as input and
displays words from a Hungarian frequency dictionary that rhyme with it.

## How it works

- The app bundles ~50k Hungarian words, sorted by descending frequency, from
  [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  (`content/2018/hu/hu_50k.txt`).
- For a given input word, it finds the last vowel and then scores every word in
  the dictionary by the length of the longest common suffix. A word "rhymes"
  if that suffix contains at least the last vowel of the input.
- Results are grouped by how many trailing characters match. Within a group
  they are sorted by frequency (most common first).
- An optional "loose rhymes" toggle treats vowel-length pairs as equivalent
  (á ≈ a, é ≈ e, í ≈ i, ó ≈ o, ő ≈ ö, ú ≈ u, ű ≈ ü).

## Develop

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically <http://localhost:5173>).

## Build

```bash
npm run build
npm run preview
```

## Regenerating the word list

The word list is checked in at `src/data/words.ts` as a static import. To
regenerate it from a fresh frequency file:

```bash
curl -L -o /tmp/hu_50k.txt \
  https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/hu/hu_50k.txt
node scripts/prepare-words.mjs /tmp/hu_50k.txt
```
