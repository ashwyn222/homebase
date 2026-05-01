import { useState } from 'react';
import { Search } from 'lucide-react';
import type { WidgetContext } from './types';

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: DictionaryMeaning[];
}

export function DictionaryWidget(_ctx: WidgetContext) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<DictionaryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (word: string) => {
    const w = word.trim();
    if (!w) return;
    setLoading(true);
    setError(null);
    setEntries(null);
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
      );
      if (!res.ok) {
        if (res.status === 404) {
          setError(`No definitions for "${w}".`);
        } else {
          setError(`Error ${res.status}`);
        }
        return;
      }
      const data = (await res.json()) as DictionaryEntry[];
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dict-widget">
      <form
        className="dict-input"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(query);
        }}
      >
        <Search size={14} />
        <input
          type="text"
          placeholder="Look up a word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div className="dict-body">
        {loading && <div className="muted">Looking up…</div>}
        {error && <div className="error">{error}</div>}
        {entries?.map((entry, i) => (
          <div key={i} className="dict-entry">
            <div className="dict-head">
              <span className="dict-word">{entry.word}</span>
              {entry.phonetic && (
                <span className="dict-phon">{entry.phonetic}</span>
              )}
            </div>
            {entry.meanings.map((m, j) => (
              <div key={j} className="dict-meaning">
                <em className="dict-pos">{m.partOfSpeech}</em>
                <ol>
                  {m.definitions.slice(0, 3).map((d, k) => (
                    <li key={k}>
                      {d.definition}
                      {d.example && (
                        <div className="dict-example">“{d.example}”</div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
