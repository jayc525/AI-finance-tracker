import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import API from "../api";

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "How much did I spend on food last week?",
  "Show my spending trend for the last 3 months",
];

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat", { message: text });
      const aiMsg = { role: "ai", content: res.data.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        role: "ai",
        content: err.response?.data?.message || "Sorry, I couldn't process that. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1>Ask AI</h1>
        <p>Ask questions about your spending in plain English</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="icon">💬</div>
            <h3>Ask me anything about your expenses</h3>
            <p>Try one of the suggestions below</p>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>{msg.content}</div>
        ))}

        {loading && (
          <div className="chat-message ai">
            <span className="thinking">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your expenses..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
}

export default Chat;
