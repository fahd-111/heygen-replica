import React, { useState } from 'react';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex gap-4 mt-4">
        <button className="px-4 py-2 bg-gray-700 text-white rounded-md">Text mode</button>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-md opacity-50">Voice mode</button>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something for the avatar to respond"
            className="w-full p-4 pr-12 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 p-2"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;