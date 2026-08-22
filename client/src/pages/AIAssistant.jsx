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

  const quickPrompts = [
    "How many leave requests have I submitted?",
    "Summarize my attendance logs.",
    "What is my current leave status?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const text = inputText.trim();
    if (!text) return;

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

  const handleQuickPrompt = (prompt) => {
    setInputText(prompt);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-6 max-w-4xl flex flex-col h-[calc(100vh-85px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-amber-500/20">
            ✨
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-white tracking-tight">DayFlow AI HR Assistant</h1>
            <p className="text-xs text-zinc-400">Contextual natural-language query engine</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-3 rounded-2xl border border-rose-500/20 mb-3 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Panel */}
      <div className="flex-1 df-glass-card rounded-3xl p-6 overflow-y-auto space-y-4 mb-4 border-zinc-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <span className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">
              {msg.sender === 'user' ? 'You' : 'DayFlow AI'}
            </span>
            <div
              className={`p-4 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-zinc-100 text-zinc-950 font-medium rounded-br-none'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="mr-auto items-start max-w-[80%] flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-wider">DayFlow AI</span>
            <div className="p-4 rounded-2xl text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-bl-none italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Analyzing database context and generating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickPrompt(p)}
            className="text-[11px] px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Composer Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          className="flex-1 df-input py-3"
          placeholder="Ask a question about your attendance, leaves, or company policies..."
          required
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md hover:scale-105"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
