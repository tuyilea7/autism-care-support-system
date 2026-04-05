import { useState } from "react";

function toMidnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function groupByDate(sessions) {
  const order = ["Today", "Yesterday", "This Week", "Older"];
  const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  const todayMidnight = toMidnight(new Date());

  sessions.forEach((s) => {
    // handle both "2024-01-01T00:00:00" and "2024-01-01 00:00:00" from SQLite
    const raw = s.updated_at.includes("T") ? s.updated_at : s.updated_at.replace(" ", "T");
    const d = new Date(raw.endsWith("Z") ? raw : raw + "Z");
    const sessionMidnight = toMidnight(d);
    const diffDays = Math.round((todayMidnight - sessionMidnight) / 86400000);

    if (diffDays === 0)      groups["Today"].push(s);
    else if (diffDays === 1) groups["Yesterday"].push(s);
    else if (diffDays < 7)  groups["This Week"].push(s);
    else                     groups["Older"].push(s);
  });

  return { groups, order };
}

export default function Sidebar({
  sessions, activeSessionId, onSelect, onNew, onDelete, onRename, collapsed, onToggle
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuId, setMenuId] = useState(null);

  const startRename = (s) => {
    setRenamingId(s.session_id);
    setRenameVal(s.title);
    setMenuId(null);
  };

  const submitRename = (sid) => {
    if (renameVal.trim()) onRename(sid, renameVal.trim());
    setRenamingId(null);
  };

  const { groups: grouped, order: groupOrder } = groupByDate(sessions);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`} aria-label="Chat history">
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <button className="new-chat-btn" onClick={onNew}>
            <span>✏️</span> New Chat
          </button>
        )}
        <button className="collapse-btn" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {!collapsed && (
        <nav className="sidebar-nav">
          {sessions.length === 0 && (
            <p className="sidebar-empty">No conversations yet.<br />Start a new chat!</p>
          )}

          {groupOrder.map((label) =>
            grouped[label].length === 0 ? null : (
              <div key={label} className="sidebar-group">
                <p className="sidebar-group-label">{label}</p>
                {grouped[label].map((s) => (
                  <div
                    key={s.session_id}
                    className={`sidebar-item ${s.session_id === activeSessionId ? "sidebar-item-active" : ""}`}
                    onClick={() => { onSelect(s.session_id); setMenuId(null); }}
                  >
                    {renamingId === s.session_id ? (
                      <input
                        className="rename-input"
                        value={renameVal}
                        autoFocus
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => submitRename(s.session_id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRename(s.session_id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="sidebar-item-title">{s.title}</span>
                        <button
                          className="item-menu-btn"
                          aria-label="Options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuId(menuId === s.session_id ? null : s.session_id);
                          }}
                        >⋯</button>
                      </>
                    )}

                    {menuId === s.session_id && (
                      <div className="item-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => startRename(s)}>✏️ Rename</button>
                        <button
                          className="delete-option"
                          onClick={() => { onDelete(s.session_id); setMenuId(null); }}
                        >🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </nav>
      )}
    </aside>
  );
}
