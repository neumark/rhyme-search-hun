import { useDeferredValue, useMemo, useState } from 'react';
import {WORDS} from './data/words';
import { findRhymes, type RhymeMatch } from './lib/rhyme';
import './App.css';

function groupByScore(matches: RhymeMatch[]): Map<number, RhymeMatch[]> {
  const groups = new Map<number, RhymeMatch[]>();
  for (const m of matches) {
    const arr = groups.get(m.score);
    if (arr) arr.push(m);
    else groups.set(m.score, [m]);
  }
  return groups;
}

function App() {
  const [input, setInput] = useState('');
  const [loose, setLoose] = useState(false);
  const deferredInput = useDeferredValue(input);

  const { matches, status } = useMemo(() => {
    const trimmed = deferredInput.trim();
    if (!trimmed) return { matches: [] as RhymeMatch[], status: 'idle' as const };
    const result = findRhymes(trimmed, WORDS, { limit: 300, loose });
    return { matches: result, status: 'ready' as const };
  }, [deferredInput, loose]);

  const grouped = useMemo(() => groupByScore(matches), [matches]);
  const sortedScores = useMemo(
    () => [...grouped.keys()].sort((a, b) => b - a),
    [grouped]
  );

  return (
    <div className="app">
      <header className="hero">
        <h1>
          Magyar <span className="accent">Rímkereső</span>
        </h1>
        <p className="subtitle">
          Írj be egy magyar szót, és megmutatjuk a leggyakoribb rímelő szavakat.
        </p>
      </header>

      <section className="search">
        <label htmlFor="word" className="sr-only">
          Szó
        </label>
        <input
          id="word"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          placeholder="pl. szerelem, csillag, álom…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <label className="loose-toggle">
          <input
            type="checkbox"
            checked={loose}
            onChange={(e) => setLoose(e.target.checked)}
          />
          <span>Lazább rímek (á ≈ a, é ≈ e, …)</span>
        </label>
      </section>

      <section className="results" aria-live="polite">
        {status === 'idle' && (
          <p className="empty">Kezdj el gépelni egy szót fent.</p>
        )}
        {status === 'ready' && matches.length === 0 && (
          <p className="empty">
            Nincs találat a(z) <strong>{deferredInput.trim()}</strong> szóra.
          </p>
        )}
        {status === 'ready' && matches.length > 0 && (
          <>
            <p className="count">
              {matches.length} találat — legjobb egyezések elöl
            </p>
            {sortedScores.map((score) => {
              const items = grouped.get(score)!;
              return (
                <div key={score} className="group">
                  <h2>
                    {score} karakter egyezik
                    <span className="count-badge">{items.length}</span>
                  </h2>
                  <ul>
                    {items.map((m) => {
                      const tail = m.word.slice(m.word.length - m.score);
                      const head = m.word.slice(0, m.word.length - m.score);
                      return (
                        <li key={m.word}>
                          <span className="head">{head}</span>
                          <span className="tail">{tail}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </section>

      <footer>
        <p>
          Szógyakoriság-lista:{' '}
          <a
            href="https://github.com/hermitdave/FrequencyWords"
            target="_blank"
            rel="noreferrer"
          >
            hermitdave/FrequencyWords
          </a>{' '}
          ({WORDS.length.toLocaleString('hu-HU')} szó).
        </p>
      </footer>
    </div>
  );
}

export default App;
