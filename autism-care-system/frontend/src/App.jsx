import { useState, useEffect, useRef } from "react";
import ChatWindow from "./components/ChatWindow.jsx";
import InputBar from "./components/InputBar.jsx";
import AuthPage from "./components/AuthPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

const WELCOME_MSG = (user) => ({
  role: "bot",
  message: `Hello${user?.child_name ? `, I'm here to help you care for ${user.child_name}` : ""}! I'm your Autism Care Support Assistant. Ask me anything about managing your child's behavior, communication, routines, or therapy guidance. How can I help you today?`,
});

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("acs_token") || null);
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("acs_user")); } catch { return null; }
  });

  const [sessions, setSessions]           = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const chatAreaRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────
  const authH = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  });

  // ── scroll to bottom ─────────────────────────────────────
  const scrollToBottom = (smooth = true) => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // ── load sessions on login ────────────────────────────────
  useEffect(() => {
    if (token && user) fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions", { headers: authH() });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setSessions(data);
    } catch { /* ignore */ }
  };

  // ── auth ─────────────────────────────────────────────────
  const handleAuth = (newToken, newUser) => {
    localStorage.setItem("acs_token", newToken);
    localStorage.setItem("acs_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("acs_token");
    localStorage.removeItem("acs_user");
    setToken(null); setUser(null);
    setSessions([]); setActiveSessionId(null); setMessages([]);
  };

  // ── new chat ──────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/sessions", { method: "POST", headers: authH() });
      if (res.status === 401) { logout(); return; }
      const sess = await res.json();
      setSessions((prev) => [sess, ...prev]);
      setActiveSessionId(sess.session_id);
      setMessages([WELCOME_MSG(user)]);
    } catch { /* ignore */ }
  };

  // ── select existing session ───────────────────────────────
  const handleSelectSession = async (sid) => {
    if (sid === activeSessionId) return;
    setActiveSessionId(sid);
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sid}/messages`, { headers: authH() });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      setMessages(data.length ? data : [WELCOME_MSG(user)]);
      // scroll after messages are set
      setTimeout(() => scrollToBottom(), 50);
    } catch {
      setMessages([WELCOME_MSG(user)]);
    } finally {
      setLoading(false);
    }
  };

  // ── delete session ────────────────────────────────────────
  const handleDeleteSession = async (sid) => {
    await fetch(`/api/sessions/${sid}`, { method: "DELETE", headers: authH() });
    setSessions((prev) => prev.filter((s) => s.session_id !== sid));
    if (sid === activeSessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  // ── rename session ────────────────────────────────────────
  const handleRenameSession = async (sid, title) => {
    await fetch(`/api/sessions/${sid}`, {
      method: "PATCH",
      headers: authH(),
      body: JSON.stringify({ title }),
    });
    setSessions((prev) =>
      prev.map((s) => s.session_id === sid ? { ...s, title } : s)
    );
  };

  // ── send message ──────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || !activeSessionId) return;

    setMessages((prev) => [...prev, { role: "user", message: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ message: text, session_id: activeSessionId }),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "bot", message: data.response }]);

      // Update title in sidebar if it was just auto-set
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === activeSessionId
            ? { ...s, title: data.title, updated_at: new Date().toISOString() }
            : s
        )
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", message: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── not logged in ─────────────────────────────────────────
  if (!token || !user) return <AuthPage onAuth={handleAuth} />;

  // ── admin gets their own panel ────────────────────────────
  if (user.role === "admin") {
    return (
      <div className="app-shell">
        <div className="main-panel">
          <header className="app-header">
            <div className="header-left">
              <span className="header-icon" aria-hidden="true">💙</span>
              <div>
                <h1 className="header-title">Autism Care — Admin</h1>
                <p className="header-subtitle">System management panel</p>
              </div>
            </div>
            <div className="header-right">
              <span className="user-greeting">🇷🇼 {user.full_name.split(" ")[0]}</span>
              <button className="logout-btn" onClick={logout}>Sign Out</button>
            </div>
          </header>
          <main className="dash-area">
            <AdminPanel token={token} onUnauth={logout} />
          </main>
        </div>
      </div>
    );
  }

  const noSessionSelected = !activeSessionId;

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* ── Main panel ── */}
      <div className="main-panel">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <span className="header-icon" aria-hidden="true">💙</span>
            <div>
              <h1 className="header-title">Autism Care Support</h1>
              <p className="header-subtitle">Real-time guidance for parents &amp; home caregivers</p>
            </div>
          </div>

          <div className="header-right">
            <span className="user-greeting">👤 {user.full_name.split(" ")[0]}</span>
            <button className="logout-btn" onClick={logout}>Sign Out</button>
          </div>
        </header>

        {/* Body */}
        {noSessionSelected ? (
          /* Empty state — no session picked yet */
          <main className="empty-state">
            <div className="empty-inner">
              <span className="empty-icon">💙</span>
              <h2>How can I help you today?</h2>
              <p>Start a new conversation or select one from the sidebar.</p>
              <button className="start-btn" onClick={handleNewChat}>
                ✏️ Start New Chat
              </button>
            </div>
          </main>
        ) : (
          <>
            <main className="chat-area" ref={chatAreaRef}>
              <ChatWindow messages={messages} loading={loading} />
            </main>
            <footer className="input-area">
              <InputBar onSend={sendMessage} disabled={loading} />
              <p className="disclaimer">
                General guidance only. Always consult a healthcare professional for medical concerns.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
