// Hungarian rhyme matching.
//
// A Hungarian word rhymes with another when the tail (from the last vowel of
// the input onward) matches. We score candidates by the length of the matching
// suffix — longer matches rhyme better. Among equally long matches, we prefer
// more frequent words (lower index in the word list).

const HUN_VOWELS = new Set(['a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'ö', 'ő', 'u', 'ú', 'ü', 'ű']);

// For "loose" rhymes we group vowels by length-agnostic quality.
const VOWEL_CLASS: Record<string, string> = {
  a: 'a', á: 'a',
  e: 'e', é: 'e',
  i: 'i', í: 'i',
  o: 'o', ó: 'o',
  ö: 'ö', ő: 'ö',
  u: 'u', ú: 'u',
  ü: 'ü', ű: 'ü',
};

export function isHunVowel(ch: string): boolean {
  return HUN_VOWELS.has(ch);
}

// Index (from the end, 0 = last char) of the last vowel in `word`.
// Returns -1 if the word has no vowels.
export function lastVowelIndexFromEnd(word: string): number {
  for (let i = word.length - 1; i >= 0; i--) {
    if (isHunVowel(word[i])) return word.length - 1 - i;
  }
  return -1;
}

// Length (in characters) of the common suffix between `a` and `b`.
function commonSuffixLength(a: string, b: string, loose: boolean): number {
  let i = 0;
  const max = Math.min(a.length, b.length);
  while (i < max) {
    const ca = a[a.length - 1 - i];
    const cb = b[b.length - 1 - i];
    if (ca === cb) {
      i++;
      continue;
    }
    if (loose && isHunVowel(ca) && isHunVowel(cb) && VOWEL_CLASS[ca] === VOWEL_CLASS[cb]) {
      i++;
      continue;
    }
    break;
  }
  return i;
}

export interface RhymeMatch {
  word: string;
  score: number; // length of rhyming tail
  rank: number; // frequency rank (lower = more common)
}

export interface FindRhymesOptions {
  limit?: number;
  loose?: boolean; // allow á ~ a, é ~ e, etc.
}

export function findRhymes(
  input: string,
  words: string[],
  opts: FindRhymesOptions = {}
): RhymeMatch[] {
  const { limit = 200, loose = false } = opts;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return [];

  const lastVowel = lastVowelIndexFromEnd(normalized);
  if (lastVowel < 0) return []; // input with no vowel – can't rhyme

  // Minimum match required to be considered a rhyme:
  // the suffix must contain the last vowel of the input.
  const minMatch = lastVowel + 1;

  const matches: RhymeMatch[] = [];
  for (let rank = 0; rank < words.length; rank++) {
    const w = words[rank];
    if (w === normalized) continue;
    // Quick cull: the rhyming suffix cannot be longer than the word itself.
    if (w.length < minMatch) continue;
    const score = commonSuffixLength(normalized, w, loose);
    if (score < minMatch) continue;
    matches.push({ word: w, score, rank });
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.rank - b.rank;
  });

  return matches.slice(0, limit);
}
