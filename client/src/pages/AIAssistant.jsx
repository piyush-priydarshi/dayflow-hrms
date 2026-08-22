import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const AIAssistant = () => {
  const { user, token } = useAuth();
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user ? user.name : 'there'}! I am DayFlow AI, your HR Assistant. You can ask me questions about your attendance schedules or leave details. Try asking: "How many leave requests have I submitted?" or "Summarize my attendance logs."`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError('');

    const text = inputText.trim();
    if (!text) return;

    // User Message addition
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: text,
          employeeId: user.employeeId
        })
      });

      const data = await response.json();
      if (response.ok) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.answer || 'Sorry, I did not receive a response.'
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setError(data.message || 'Error processing AI chat response');
      }
    } catch (err) {
      setError('Connection refused. Ensure the backend server is running.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-2xl flex flex-col h-[85vh]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">DayFlow AI HR Assistant</h1>
          <p className="text-xs text-gray-500 mt-0.5">Auditing your logs via secure read-only context queries.</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-2.5 rounded border border-red-200 mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Message List Panel */}
      <div className="flex-1 bg-white border border-gray-300 rounded p-4 overflow-y-auto space-y-4 mb-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <span className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wide">
              {msg.sender === 'user' ? 'You' : 'DayFlow AI'}
            </span>
            <div
              className={`p-3 rounded text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="mr-auto items-start max-w-[85%] flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wide">DayFlow AI</span>
            <div className="p-3 rounded text-sm bg-gray-100 text-gray-400 rounded-bl-none border border-gray-200 italic shadow-sm">
              Analyzing database context and generating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-500 text-sm"
          placeholder="Ask about your attendance or leave applications..."
          required
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-6 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
