/**
 * Renders bot messages with basic markdown support:
 * **bold**, numbered lists, bullet lists, line breaks.
 */
function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;

  const flushList = (key) => {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag key={`list-${key}`}>
        {listItems.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const olMatch = line.match(/^(\d+)\)\s+(.*)/);
    const ulMatch = line.match(/^[-*]\s+(.*)/);

    if (olMatch) {
      if (listType !== "ol") { flushList(i); listType = "ol"; }
      listItems.push(olMatch[2]);
    } else if (ulMatch) {
      if (listType !== "ul") { flushList(i); listType = "ul"; }
      listItems.push(ulMatch[1]);
    } else {
      flushList(i);
      if (line.trim() === "") {
        elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(
          <p key={`p-${i}`} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
        );
      }
    }
  });

  flushList("end");
  return elements;
}

function inlineFormat(text) {
  // **bold**
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function MessageBubble({ role, message }) {
  const isBot = role === "bot";

  return (
    <div className={`bubble-wrapper ${isBot ? "bot-wrapper" : "user-wrapper"}`}>
      {isBot && (
        <div className="avatar bot-avatar" aria-hidden="true">💙</div>
      )}
      <div
        className={`bubble ${isBot ? "bot-bubble" : "user-bubble"}`}
        role={isBot ? "article" : undefined}
      >
        {isBot ? renderMarkdown(message) : <p>{message}</p>}
      </div>
      {!isBot && (
        <div className="avatar user-avatar" aria-hidden="true">👤</div>
      )}
    </div>
  );
}
