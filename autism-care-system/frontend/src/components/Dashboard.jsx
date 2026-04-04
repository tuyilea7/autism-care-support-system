import { useState, useEffect } from "react";

const TOPIC_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c",
  "#16a34a", "#0891b2", "#ca8a04", "#dc2626",
];

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

function TopicBar({ topic, count, max, color }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="topic-row">
      <span className="topic-name">{topic}</span>
      <div className="topic-bar-track">
        <div
          className="topic-bar-fill"
          style={{ width: `${pct}%`, background: color }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="topic-count">{count}</span>
    </div>
  );
}

export default function Dashboard({ token, onUnauth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) { onUnauth(); return; }
      if (!res.ok) throw new Error("Failed to load dashboard data");
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="dash-center">
      <div className="dash-spinner" aria-label="Loading dashboard" />
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="dash-center">
      <p className="dash-error">⚠️ {error}</p>
      <button className="retry-btn" onClick={fetchData}>Retry</button>
    </div>
  );

  const maxCount = data.top_topics.length > 0 ? data.top_topics[0].count : 1;
  const avgMsgs = data.avg_messages_per_session ?? 0;

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h2 className="dash-title">System Dashboard</h2>
        <button className="refresh-btn" onClick={fetchData} aria-label="Refresh dashboard">
          ↻ Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <StatCard icon="💬" label="Total Sessions" value={data.total_sessions} />
        <StatCard icon="📨" label="Messages Sent" value={data.total_user_messages} />
        <StatCard icon="🤖" label="Bot Responses" value={data.total_bot_messages} />
        <StatCard icon="📊" label="Avg Messages/Session" value={avgMsgs} sub="per caregiver" />
      </div>

      <div className="dash-grid-2">
        {/* Top Topics */}
        <section className="dash-card" aria-labelledby="topics-heading">
          <h3 id="topics-heading" className="dash-card-title">Top Topics Asked</h3>
          {data.top_topics.length === 0 ? (
            <p className="dash-empty">No conversations yet. Start chatting to see topics.</p>
          ) : (
            <div className="topics-list">
              {data.top_topics.map((t, i) => (
                <TopicBar
                  key={t.topic}
                  topic={t.topic}
                  count={t.count}
                  max={maxCount}
                  color={TOPIC_COLORS[i % TOPIC_COLORS.length]}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Sessions */}
        <section className="dash-card" aria-labelledby="sessions-heading">
          <h3 id="sessions-heading" className="dash-card-title">Recent Sessions</h3>
          {data.recent_sessions.length === 0 ? (
            <p className="dash-empty">No sessions yet.</p>
          ) : (
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Conversation</th>
                  <th>Messages</th>
                  <th>Last Topic</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_sessions.map((s, i) => (
                  <tr key={i}>
                    <td className="session-title-cell">{s.title}</td>
                    <td>{s.messages}</td>
                    <td>
                      <span className="topic-badge">{s.last_topic}</span>
                    </td>
                    <td className="session-time">
                      {s.updated_at ? new Date(s.updated_at + "Z").toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Empty state hint */}
      {data.total_sessions === 0 && (
        <div className="dash-hint">
          💡 Go to the Chat tab and start a conversation — stats will appear here automatically.
        </div>
      )}
    </div>
  );
}
