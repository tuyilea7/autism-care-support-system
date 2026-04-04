from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from chatbot import AutismCareBot
from database import init_db, get_db
from collections import Counter
import bcrypt
import uuid
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET", "autism-care-secret-key-2026")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)
jwt = JWTManager(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "try_complete.json")
bot = AutismCareBot(DATA_PATH)
init_db()


def make_title(text: str) -> str:
    """Generate a short chat title from the first user message."""
    text = text.strip()
    return text[:60] + ("…" if len(text) > 60 else "")


# ════════════════════════════════════════════════════════════
#  AUTH
# ════════════════════════════════════════════════════════════

@app.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    full_name  = (body.get("full_name") or "").strip()
    email      = (body.get("email") or "").strip().lower()
    password   = (body.get("password") or "").strip()
    child_name = (body.get("child_name") or "").strip()
    child_age  = body.get("child_age")

    if not full_name or not email or not password:
        return jsonify({"error": "full_name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (full_name, email, password, child_name, child_age, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (full_name, email, hashed, child_name or None,
             child_age or None, datetime.utcnow().isoformat())
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        token = create_access_token(identity=str(user["id"]))
        return jsonify({"token": token, "user": _user_dict(user)}), 201
    except Exception as e:
        if "UNIQUE" in str(e):
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": "Registration failed"}), 500
    finally:
        db.close()


@app.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email    = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
            return jsonify({"error": "Invalid email or password"}), 401
        token = create_access_token(identity=str(user["id"]))
        return jsonify({"token": token, "user": _user_dict(user)})
    finally:
        db.close()


@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db = get_db()
    try:
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(_user_dict(user))
    finally:
        db.close()


def _user_dict(user):
    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "child_name": user["child_name"],
        "child_age": user["child_age"],
    }


# ════════════════════════════════════════════════════════════
#  SESSIONS  (sidebar list — like ChatGPT)
# ════════════════════════════════════════════════════════════

@app.route("/api/sessions", methods=["GET"])
@jwt_required()
def list_sessions():
    """Return all sessions for the user, newest first."""
    user_id = get_jwt_identity()
    db = get_db()
    try:
        rows = db.execute(
            "SELECT session_id, title, created_at, updated_at "
            "FROM sessions WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        db.close()


@app.route("/api/sessions", methods=["POST"])
@jwt_required()
def create_session():
    """Create a new empty session and return its id."""
    user_id = get_jwt_identity()
    sid = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    db = get_db()
    try:
        db.execute(
            "INSERT INTO sessions (session_id, user_id, title, created_at, updated_at) "
            "VALUES (?, ?, 'New Chat', ?, ?)",
            (sid, user_id, now, now)
        )
        db.commit()
        return jsonify({"session_id": sid, "title": "New Chat",
                        "created_at": now, "updated_at": now}), 201
    finally:
        db.close()


@app.route("/api/sessions/<session_id>", methods=["PATCH"])
@jwt_required()
def rename_session(session_id):
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title required"}), 400
    db = get_db()
    try:
        db.execute(
            "UPDATE sessions SET title = ? WHERE session_id = ? AND user_id = ?",
            (title, session_id, user_id)
        )
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


@app.route("/api/sessions/<session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    user_id = get_jwt_identity()
    db = get_db()
    try:
        db.execute(
            "DELETE FROM conversations WHERE session_id = ? AND user_id = ?",
            (session_id, user_id)
        )
        db.execute(
            "DELETE FROM sessions WHERE session_id = ? AND user_id = ?",
            (session_id, user_id)
        )
        db.commit()
        return jsonify({"ok": True})
    finally:
        db.close()


# ════════════════════════════════════════════════════════════
#  CHAT
# ════════════════════════════════════════════════════════════

@app.route("/api/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    user_message = (body.get("message") or "").strip()
    session_id   = body.get("session_id")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400
    if not session_id:
        return jsonify({"error": "session_id required"}), 400

    now = datetime.utcnow().isoformat()
    db = get_db()
    try:
        # Ensure session exists and belongs to user
        sess = db.execute(
            "SELECT * FROM sessions WHERE session_id = ? AND user_id = ?",
            (session_id, user_id)
        ).fetchone()
        if not sess:
            return jsonify({"error": "Session not found"}), 404

        # Auto-title from first user message
        is_first = db.execute(
            "SELECT COUNT(*) FROM conversations WHERE session_id = ? AND user_id = ?",
            (session_id, user_id)
        ).fetchone()[0] == 0

        if is_first and sess["title"] == "New Chat":
            title = make_title(user_message)
            db.execute(
                "UPDATE sessions SET title = ?, updated_at = ? "
                "WHERE session_id = ? AND user_id = ?",
                (title, now, session_id, user_id)
            )

        # Save user message
        db.execute(
            "INSERT INTO conversations (user_id, session_id, role, message, tag, timestamp) "
            "VALUES (?, ?, 'user', ?, NULL, ?)",
            (user_id, session_id, user_message, now)
        )

        # AI response
        result = bot.get_response(user_message)
        bot_response = result["response"]
        tag = result["tag"]

        db.execute(
            "INSERT INTO conversations (user_id, session_id, role, message, tag, timestamp) "
            "VALUES (?, ?, 'bot', ?, ?, ?)",
            (user_id, session_id, bot_response, tag, datetime.utcnow().isoformat())
        )

        # Bump session updated_at
        db.execute(
            "UPDATE sessions SET updated_at = ? WHERE session_id = ? AND user_id = ?",
            (datetime.utcnow().isoformat(), session_id, user_id)
        )
        db.commit()

        # Return updated session title (may have just been set)
        sess_row = db.execute(
            "SELECT title FROM sessions WHERE session_id = ?", (session_id,)
        ).fetchone()

        return jsonify({
            "session_id": session_id,
            "response": bot_response,
            "tag": tag,
            "title": sess_row["title"],
        })
    finally:
        db.close()


@app.route("/api/sessions/<session_id>/messages", methods=["GET"])
@jwt_required()
def get_messages(session_id):
    """Load all messages for a session."""
    user_id = get_jwt_identity()
    db = get_db()
    try:
        rows = db.execute(
            "SELECT role, message, timestamp FROM conversations "
            "WHERE user_id = ? AND session_id = ? ORDER BY id",
            (user_id, session_id)
        ).fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        db.close()


# ════════════════════════════════════════════════════════════
#  DASHBOARD
# ════════════════════════════════════════════════════════════

@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    db = get_db()
    try:
        total_sessions = db.execute(
            "SELECT COUNT(*) FROM sessions WHERE user_id = ?", (user_id,)
        ).fetchone()[0]

        total_user_msgs = db.execute(
            "SELECT COUNT(*) FROM conversations WHERE user_id = ? AND role = 'user'",
            (user_id,)
        ).fetchone()[0]

        total_bot_msgs = db.execute(
            "SELECT COUNT(*) FROM conversations WHERE user_id = ? AND role = 'bot'",
            (user_id,)
        ).fetchone()[0]

        tag_rows = db.execute(
            "SELECT tag, COUNT(*) as cnt FROM conversations "
            "WHERE user_id = ? AND role = 'bot' AND tag IS NOT NULL AND tag != 'fallback' "
            "GROUP BY tag ORDER BY cnt DESC LIMIT 8",
            (user_id,)
        ).fetchall()
        top_topics = [
            {"topic": r["tag"].replace("_", " ").title(), "count": r["cnt"]}
            for r in tag_rows
        ]

        session_rows = db.execute(
            "SELECT s.session_id, s.title, s.updated_at, "
            "COUNT(CASE WHEN c.role='user' THEN 1 END) as msg_count "
            "FROM sessions s LEFT JOIN conversations c ON s.session_id = c.session_id "
            "WHERE s.user_id = ? GROUP BY s.session_id ORDER BY s.updated_at DESC LIMIT 10",
            (user_id,)
        ).fetchall()

        recent_sessions = []
        for row in session_rows:
            last_tag = db.execute(
                "SELECT tag FROM conversations WHERE user_id = ? AND session_id = ? "
                "AND role = 'bot' AND tag IS NOT NULL AND tag != 'fallback' "
                "ORDER BY id DESC LIMIT 1",
                (user_id, row["session_id"])
            ).fetchone()
            recent_sessions.append({
                "title": row["title"],
                "messages": row["msg_count"],
                "updated_at": row["updated_at"],
                "last_topic": last_tag["tag"].replace("_", " ").title() if last_tag else "—"
            })

        avg_msgs = round(total_user_msgs / total_sessions, 1) if total_sessions else 0

        return jsonify({
            "total_sessions": total_sessions,
            "total_user_messages": total_user_msgs,
            "total_bot_messages": total_bot_msgs,
            "avg_messages_per_session": avg_msgs,
            "top_topics": top_topics,
            "recent_sessions": recent_sessions,
        })
    finally:
        db.close()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
