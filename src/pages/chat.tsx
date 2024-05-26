// src/pages/chat.tsx
import { useState } from "react";
import ChatBubble from "@/components/ChatBubble";
import { useDarkMode } from "@/context/DarkModeContext";

const ChatPage = () => {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, how can I help you?",
      isUser: false,
    },
    {
      id: 2,
      text: "I need help with my account. I wnat to Reset my password i think!",
      isUser: true,
    },
    {
      id: 3,
      text: "Sure, I can help you with that",
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: newMessage,
          isUser: true,
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <header
        className={`p-4 flex justify-between items-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-blue-500 text-white"
        }`}
      >
        <h1 className="text-xl">Chat with ....</h1>
      </header>
      <div className="flex-grow p-4 overflow-auto flex flex-col">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} />
        ))}
      </div>
      <div className="p-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={`w-full p-2 border rounded-l-md ${
            isDarkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white text-black border-gray-300"
          }`}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
