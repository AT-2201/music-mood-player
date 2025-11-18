import React, { useState } from 'react';

const API = import.meta.env.VITE_API || 'http://localhost:4000';

export default function App() {
  const [text, setText] = useState('Feeling great today!');
  const [mood, setMood] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  async function detectMood() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setMood(data.mood);
      setConfidence(data.confidence);
    } finally {
      setLoading(false);
    }
  }

  async function getPlaylist() {
    if (!mood) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, userId: 'demo' })
      });
      const data = await res.json();
      setTracks(data.tracks || []);
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(trackId, value) {
    await fetch(`${API}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, value, userId: 'demo' })
    });
    // optimistic UI: nudge score locally
    setTracks(tracks.map(t => t.id === trackId ? { ...t, score: (t.score||0) + value } : t));
  }

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h1>🎶 Music Mood Player</h1>
      <p>Type how you feel or pick a mood to generate a playlist.</p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} style={{ padding: 10 }} />
        <div>
          <button onClick={detectMood} disabled={loading}>Detect Mood from Text</button>
          <span style={{ marginLeft: 12 }}>{mood ? `Mood: ${mood} (${(confidence*100).toFixed(0)}%)` : ''}</span>
        </div>
        <div>
          <label>Or choose mood: </label>
          {['happy','sad','relaxed','energetic'].map(m => (
            <button key={m} onClick={() => { setMood(m); setConfidence(1); }} style={{ marginRight: 8 }}>{m}</button>
          ))}
        </div>
        <div>
          <button onClick={getPlaylist} disabled={!mood || loading}>Get Playlist</button>
        </div>
      </div>

      {tracks.length > 0 && (
        <div>
          <h2>Playlist for "{mood}"</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
            {tracks.map(t => (
              <li key={t.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap:12, padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                {t.albumArt ? (
                  <img src={t.albumArt} alt={`${t.title} album art`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} />
                ) : <div style={{ width: 64, height: 64, background: '#f3f3f3', borderRadius: 4 }} />}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {t.spotifyUrl ? <a href={t.spotifyUrl} target="_blank" rel="noreferrer">{t.title}</a> : t.title}
                  </div>
                  <div style={{ color: '#555' }}>{t.artist}</div>
                  {t.previewUrl && (
                    <audio controls src={t.previewUrl} style={{ marginTop: 6, maxWidth: '100%' }}>
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {typeof t.score === 'number' ? <div style={{ fontSize: 12, color: '#666' }}>score {t.score}</div> : null}
                </div>
                <div>
                  <button onClick={() => sendFeedback(t.id, 1)} style={{ marginRight: 8 }}>👍</button>
                  <button onClick={() => sendFeedback(t.id, -1)}>👎</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
