import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL.trim();
console.log("SOCKET_SERVER_URL:", import.meta.env.VITE_SOCKET_SERVER_URL);

function getInitial(name) {
  return name && name.length > 0 ? name[0].toUpperCase() : "?";
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef();
  const userName = "You";

  useEffect(() => {
    // התחברות ל־Socket.io
    socketRef.current = io(SOCKET_SERVER_URL, { transports: ["websocket"] });

    console.log(SOCKET_SERVER_URL);

    socketRef.current.on("connect", () => {
      console.log("🟢 Connected to socket server");
    });

    socketRef.current.on("message", (message) => {
      // קבל הודעה מהשרת (הנח: הודעה היא מחרוזת)
      setMessages((prev) => [...prev, { text: message, sender: "Other" }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  function sendMessage() {
    if (input.trim() === "") return;
    socketRef.current.emit("message", input);
    setMessages((prev) => [...prev, { text: input, sender: userName }]);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div className="chat-container">
      <h2 className="chat-title">Medical Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === userName;
          return (
            <div
              key={idx}
              className={`chat-bubble-wrapper ${isMe ? "me" : "other"}`}
            >
              {isMe ? (
                <>
                  <div className="avatar me-avatar">{getInitial(userName)}</div>
                  <div className={`chat-bubble me-bubble`}>{msg.text}</div>
                </>
              ) : (
                <>
                  <div className="avatar other-avatar">
                    {getInitial(msg.sender)}
                  </div>
                  <div className={`chat-bubble other-bubble`}>{msg.text}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
