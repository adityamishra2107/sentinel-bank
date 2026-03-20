import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const FinanceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! I'm your AI Financial Assistant. Ask me about your spending, categories, or savings advice.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: userMsg }, config);
      
      // Simulate slight delay for "thinking"
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
        setIsTyping(false);
      }, 600);
    } catch (error) {
      console.error('Chat error', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my servers.", sender: 'bot' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 z-50 dark:bg-slate-900 dark:border-slate-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Sentinel AI</h3>
                <p className="text-indigo-200 text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'bot' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {msg.sender === 'bot' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}>
                  {/* Basic markdown parsing for bold text */}
                  {msg.text.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/50 dark:text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100 rounded-tl-sm flex items-center gap-1 dark:bg-slate-800 dark:border-slate-700">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 shrink-0 dark:bg-slate-900 dark:border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 translate-x-px" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none active:scale-95 ${
          isOpen ? 'bg-slate-800 text-white rotate-90 scale-0 opacity-0 absolute pointer-events-none' : 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white scale-100 opacity-100 z-50'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
};

export default FinanceChatbot;
