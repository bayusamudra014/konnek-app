// src/components/ChatBubble.tsx
interface ChatBubbleProps {
  message: { text: string; isUser: boolean; id: number };
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.isUser;
  return (
    <div
      className={`my-2 p-3 rounded-lg max-w-96 ${
        isUser
          ? "bg-blue-500 text-white self-end"
          : "bg-gray-300 text-black self-start"
      }`}
    >
      {message.text}
    </div>
  );
};

export default ChatBubble;
