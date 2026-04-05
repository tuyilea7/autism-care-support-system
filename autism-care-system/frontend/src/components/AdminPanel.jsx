import { useState, useEffect } from "react";

export default function AdminPanel({ token, onUnauth }) {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentHistory, setParentHistory] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [editingIntent, setEditingIntent] = useState(null);
  const [editPatterns, setEditPatterns] = useState("");
  const [editResponses, setEditResponses] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  const apiFetch = async (url, opts = {}) => {
    const res = await fetch(url, { headers: h(), ...opts });
    if (res.status === 401 || res.status === 403) { onUnauth(); return null; }
    return res.json();
  };

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const data = await apiFetch("/api/admin/stats");
    if (data) setStats(data);
  };

  const loadParents = async () => {
    const data = await apiFetch("/api/admin/users");
    if (data) setParents(data);
  };

  const loadParentHistory = async (uid) => {
    const data = await apiFetch(`/api/admin/users/${uid}/messages`);
    if (data) setParentHistory(data);
  };

  const loadDataset = async () => {
    const data = await apiFetch("/api/admin/dataset");
    if (data) setDataset(data);
  };

  const handleTabChange = (t) => {
    setTab(t);
    setSelectedParent(null);
    setEditingIntent(null);
    setSaveMsg("");
    if (t === "parents") loadParents();
    if (t === "dataset") loadDataset();
    if (t === "stats") loadStats();
  };

  const openParentHistory = (p) => {
    setSelectedParent(p);
    loadParentHistory(p.id);
  };

  const openEditIntent = (intent) => {
    setEditingIntent(intent.tag);
    setEditPatterns(intent.patterns.join("\n"));
    setEditResponses(intent.responses.join("\n---\n"));
    setSaveMsg("");
  };

  const saveIntent = async () => {
    setSaving(true);
    setSaveMsg("");
    const patterns = editPatterns.split("\n").map(s => s.trim()).filter(Boolean);
    const responses = editResponses.split("\n---\n").map(s => s.trim()).filter(Boolean);
    const res = await apiFetch(`/api/admin/dataset/${editingIntent}`, {
      method: "PUT",
      body: JSON.stringify({ patterns, responses }),
    });
    setSaving(false);
    if (res?.ok) {
      setSaveMsg("Saved successfully.");
      loadDataset();
    } else {
      setSaveMsg("Save failed.");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        {["stats", "parents", "dataset"].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "admin-tab-active" : ""}`} onClick={() => handleTabChange(t)}>
            {t === "stats" ? "📊 Overview" : t === "parents" ? "👥 Parents" : "📝 Dataset"}
          </button>
        ))}
      </div>

      {/* ── STATS ── */}
      {tab === "stats" && stats && (
        <div className="admin-stats">
          <div className="stat-cards">
            <div className="stat-card"><span className="stat-num">{stats.total_parents}</span><span className="stat-label">Registered Parents</span></div>
            <div className="stat-card"><span className="stat-num">{stats.total_sessions}</span><span className="stat-label">Total Sessions</span></div>
            <div className="stat-card"><span className="stat-num">{stats.total_messages}</span><span className="stat-label">Total Messages</span></div>
          </div>
          <div className="admin-section-title">Most Asked Topics</div>
          <div className="topics-list">
            {stats.top_topics.map((t, i) => (
              <div key={i} className="topic-row">
                <span className="topic-name">{t.topic}</span>
                <div className="topic-bar-wrap">
                  <div className="topic-bar" style={{ width: `${Math.min(100, (t.count / (stats.top_topics[0]?.count || 1)) * 100)}%` }} />
                </div>
                <span className="topic-count">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PARENTS ── */}
      {tab === "parents" && !selectedParent && (
        <div className="admin-parents">
          <div className="admin-section-title">Registered Parents & Caregivers</div>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Child</th><th>Age</th><th>Sessions</th><th>Messages</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {parents.map(p => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.email}</td>
                  <td>{p.child_name || "—"}</td>
                  <td>{p.child_age || "—"}</td>
                  <td>{p.total_sessions}</td>
                  <td>{p.total_messages}</td>
                  <td>{p.created_at?.slice(0, 10)}</td>
                  <td><button className="view-btn" onClick={() => openParentHistory(p)}>View Chats</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PARENT HISTORY ── */}
      {tab === "parents" && selectedParent && (
        <div className="admin-history">
          <button className="back-btn" onClick={() => setSelectedParent(null)}>← Back to Parents</button>
          <div className="admin-section-title">Chat History — {selectedParent.full_name}</div>
          {parentHistory.length === 0 && <p className="no-data">No conversations yet.</p>}
          {parentHistory.map((sess, i) => (
            <div key={i} className="history-session">
              <div className="history-session-title">{sess.title} <span className="history-date">{sess.updated_at?.slice(0, 10)}</span></div>
              <div className="history-messages">
                {sess.messages.map((m, j) => (
                  <div key={j} className={`history-msg ${m.role}`}>
                    <span className="history-role">{m.role === "user" ? "👤" : "💙"}</span>
                    <span className="history-text">{m.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DATASET ── */}
      {tab === "dataset" && !editingIntent && (
        <div className="admin-dataset">
          <div className="admin-section-title">Dataset Intents ({dataset.length} tags)</div>
          <div className="intent-list">
            {dataset.map((intent, i) => (
              <div key={i} className="intent-row">
                <div className="intent-info">
                  <span className="intent-tag">{intent.tag}</span>
                  <span className="intent-meta">{intent.patterns.length} patterns · {intent.responses.length} responses</span>
                </div>
                <button className="edit-btn" onClick={() => openEditIntent(intent)}>Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDIT INTENT ── */}
      {tab === "dataset" && editingIntent && (
        <div className="admin-edit-intent">
          <button className="back-btn" onClick={() => { setEditingIntent(null); setSaveMsg(""); }}>← Back to Dataset</button>
          <div className="admin-section-title">Editing: <code>{editingIntent}</code></div>
          <label className="edit-label">Patterns (one per line)</label>
          <textarea className="edit-textarea" rows={10} value={editPatterns} onChange={e => setEditPatterns(e.target.value)} />
          <label className="edit-label">Responses (separate each response with a line containing only <code>---</code>)</label>
          <textarea className="edit-textarea" rows={16} value={editResponses} onChange={e => setEditResponses(e.target.value)} />
          <div className="edit-actions">
            <button className="save-btn" onClick={saveIntent} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            {saveMsg && <span className="save-msg">{saveMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
