import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({ messages, loading }) {
  return (
    <div className="chat-window" role="log" aria-live="polite" aria-label="Conversation">
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} message={msg.message} />
      ))}
      {loading && (
        <div className="bubble bot-bubble typing" aria-label="Assistant is typing">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      )}
    </div>
  );
}
