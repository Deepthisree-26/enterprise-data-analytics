import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/aiService';
import { getUserRole } from '../utils/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ManagerChat: React.FC = () => {
  const role = getUserRole() || 'Executive';
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your Enterprise Business Intelligence AI Copilot. Ask me about revenue calculations, profit margins, regional market share, or machine learning projections.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const answer = await sendMessage(text);
      const botMsg: Message = { role: 'assistant', content: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || err.message || 'Service unavailable'}`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    { label: 'Revenue calculation', q: 'How is revenue calculated and what is our current total?' },
    { label: 'What is sales profit?', q: 'What is sales profit and our current average margin?' },
    { label: 'Regional performance', q: 'Show regional performance breakdown and top markets' },
    { label: 'ML forecast', q: 'Explain the ML forecast and R² model accuracy' },
    { label: 'Role duties', q: 'What are the responsibilities for Analyst, Manager, and Admin?' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Executive AI Assistant</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              {role} View
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time conversational business intelligence querying telemetry, financial formulas, and forecasts
          </p>
        </div>
      </div>

      {/* Main Chat Feed Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950/70 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-indigo-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-slate-400 ml-1">Analyzing database telemetry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-500 font-semibold uppercase shrink-0">Suggestions:</span>
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq.q)}
              className="text-xs px-3 py-1 rounded-full bg-slate-800/90 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-all shrink-0 whitespace-nowrap"
            >
              {sq.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question (e.g. 'revenue calculation', 'what is sales profit', 'regional share')..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 shrink-0"
          >
            <span>Send</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerChat;
