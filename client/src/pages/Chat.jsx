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
    // Add user message and an empty AI message to be streamed into
    setMessages((prev) => [...prev, userMsg, { role: "ai", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: data.error };
                  return newMsgs;
                });
              } else if (data.type === "text") {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { 
                    ...newMsgs[newMsgs.length - 1], 
                    content: newMsgs[newMsgs.length - 1].content + data.text 
                  };
                  return newMsgs;
                });
              }
            } catch (e) {
              // ignore partial JSON from chunks that break exactly on a newline
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: "Sorry, I couldn't process that. Please try again." };
        return newMsgs;
      });
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
