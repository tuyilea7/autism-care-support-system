import { useState } from "react";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    child_name: "", child_age: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          child_name: form.child_name,
          child_age: form.child_age ? parseInt(form.child_age) : null,
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); return; }
      onAuth(data.token, data.user);
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">💙</span>
          <h1 className="auth-logo-title">Autism Care Support</h1>
          <p className="auth-logo-sub">Guidance for caregivers, anytime</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "register" && (
            <>
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name" name="full_name" type="text"
                  placeholder="e.g. Uwimana Marie"
                  value={form.full_name} onChange={update} required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="child_name">Child's Name</label>
                  <input
                    id="child_name" name="child_name" type="text"
                    placeholder="e.g. Amina"
                    value={form.child_name} onChange={update}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="child_age">Child's Age</label>
                  <input
                    id="child_age" name="child_age" type="number"
                    placeholder="e.g. 7" min="1" max="25"
                    value={form.child_age} onChange={update}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={update} required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              value={form.password} onChange={update} required
            />
          </div>

          {error && <p className="auth-error" role="alert">⚠️ {error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login"
            ? <>Don't have an account? <button className="link-btn" onClick={() => { setMode("register"); setError(""); }}>Register here</button></>
            : <>Already have an account? <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
}
