// Quick sanity check for the rhyme algorithm from outside the bundler.
import { readFileSync } from 'node:fs';

const wordsSrc = readFileSync(new URL('../src/data/words.ts', import.meta.url), 'utf8');
const m = wordsSrc.match(/const WORDS: string\[\] = (\[[\s\S]*?\]);/);
const WORDS = JSON.parse(m[1]);

const HUN_VOWELS = new Set(['a','á','e','é','i','í','o','ó','ö','ő','u','ú','ü','ű']);
const VOWEL_CLASS = {a:'a',á:'a',e:'e',é:'e',i:'i',í:'i',o:'o',ó:'o',ö:'ö',ő:'ö',u:'u',ú:'u',ü:'ü',ű:'ü'};

function isVowel(c){return HUN_VOWELS.has(c);}
function lastVowelFromEnd(w){for(let i=w.length-1;i>=0;i--)if(isVowel(w[i]))return w.length-1-i;return -1;}
function commonSuffix(a,b,loose){let i=0;const max=Math.min(a.length,b.length);while(i<max){const ca=a[a.length-1-i],cb=b[b.length-1-i];if(ca===cb){i++;continue;}if(loose&&isVowel(ca)&&isVowel(cb)&&VOWEL_CLASS[ca]===VOWEL_CLASS[cb]){i++;continue;}break;}return i;}

function findRhymes(input, loose=false, limit=15) {
  const w = input.toLowerCase();
  const lv = lastVowelFromEnd(w);
  const min = lv + 1;
  const out = [];
  for (let rank = 0; rank < WORDS.length; rank++) {
    const cand = WORDS[rank];
    if (cand === w) continue;
    if (cand.length < min) continue;
    const s = commonSuffix(w, cand, loose);
    if (s < min) continue;
    out.push({ word: cand, score: s, rank });
  }
  out.sort((a,b) => b.score-a.score || a.rank-b.rank);
  return out.slice(0, limit);
}

for (const word of ['szerelem', 'csillag', 'álom', 'ház', 'virág', 'szív']) {
  console.log(`\n=== ${word} ===`);
  const r = findRhymes(word, false, 10);
  for (const m of r) console.log(`  ${m.score}  ${m.word}  (#${m.rank})`);
}
