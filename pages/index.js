'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [sets, setSets] = useState(1);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const getCopyText = (items) => items.map(item => `${item.name} ${sets}`).join('\n');

  const renderTable = (items, title) => (
    items.length > 0 && (
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
        <h3 style={{ marginBottom: '10px' }}>{title}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e6e6e6' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type ID</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Jita Price (ISK)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>NPC Price (ISK)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Savings (ISK)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.type_id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.type_id}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{(item.jita_price || 0).toLocaleString()} {item.fallback ? '(Region fallback)' : ''}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.npc_price !== null ? item.npc_price.toLocaleString() : 'N/A'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{(item.savings || 0).toLocaleString()}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.npc_price === null ? 'No NPC option (market only)' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '10px' }}>
          <textarea
            readOnly
            value={getCopyText(items)}
            style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={() => copyToClipboard(getCopyText(items))}
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Copy List
          </button>
        </div>
      </div>
    )
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>EVE Skill Resolver & Price Comparator</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontWeight: 'bold' }}>Paste skill list:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste skill list here (e.g., Infomorph Psychology I\nCybernetics II)"
          rows={10}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <label style={{ fontWeight: 'bold' }}>How many sets?</label>
        <input
          type="number"
          value={sets}
          onChange={(e) => setSets(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Resolve & Compare Prices
        </button>
      </form>
      {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {renderTable(betterJita, 'Better to Buy in Jita 4-4')}
      {renderTable(betterNPC, 'Better to Buy in NPC School Stations (e.g., Kisogo or Itamo)')}
      {totalSavings > 0 && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Total Savings: {totalSavings.toLocaleString()} ISK</p>}
    </div>
  );
}
