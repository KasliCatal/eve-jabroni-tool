'use client'; // Client-side only for hooks
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    // Parse: split by newline, trim, remove trailing levels (e.g., " I", " II", " 1"), deduplicate
    const names = [...new Set(input.split('\n')
      .map(line => line.replace(/\s+[IVXLCDM\d]+$/, '').trim())
      .filter(name => name.length > 0))];

    if (names.length === 0) {
      setError('No valid names found');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(names.slice(0, 1000)) // ESI limit: 1000
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResults(data.inventory_types || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>EVE Skill Resolver</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste skill list here (e.g., Infomorph Psychology I\nCybernetics II)"
          rows={10}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" disabled={loading}>Resolve to Type IDs</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {results.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Name</th><th>Type ID</th></tr></thead>
          <tbody>
            {results.map((item) => (
              <tr key={item.id}><td>{item.name}</td><td>{item.id}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
