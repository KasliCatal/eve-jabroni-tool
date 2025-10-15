'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [betterJita, setBetterJita] = useState([]);
  const [betterNPC, setBetterNPC] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setBetterJita([]);
    setBetterNPC([]);
    setTotalSavings(0);

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
        body: JSON.stringify(names.slice(0, 1000))
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setBetterJita(data.betterJita || []);
      setBetterNPC(data.betterNPC || []);
      setTotalSavings(data.totalSavings || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (items, title) => (
    items.length > 0 && (
      <>
        <h3>{title}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th>Name</th><th>Type ID</th><th>Jita Price (ISK)</th><th>NPC Price (ISK)</th><th>Savings (ISK)</th><th>Notes</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.type_id}>
                <td>{item.name}</td>
                <td>{item.type_id}</td>
                <td>{(item.jita_price || 0).toLocaleString()} {item.fallback ? '(Region fallback)' : ''}</td>
                <td>{item.npc_price !== null ? item.npc_price.toLocaleString() : 'N/A'}</td>
                <td>{(item.savings || 0).toLocaleString()}</td>
                <td>{item.npc_price === null ? 'No NPC option (market only)' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>EVE Skill Resolver & Price Comparator</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste skill list here (e.g., Infomorph Psychology I\nCybernetics II)"
          rows={10}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" disabled={loading}>Resolve & Compare Prices</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {renderTable(betterJita, 'Better to Buy in Jita 4-4')}
      {renderTable(betterNPC, 'Better to Buy in NPC School Stations (e.g., School of Applied Knowledge in Josameto)')}
      {totalSavings > 0 && <p><strong>Total Savings: {totalSavings.toLocaleString()} ISK</strong></p>}
    </div>
  );
}
