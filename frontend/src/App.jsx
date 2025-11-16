import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Moon, Sun, Menu, X, ThumbsUp, ThumbsDown, MessageSquare, User } from 'lucide-react';

// Real API calls to backend
const API_BASE = 'http://localhost:3000/api';

const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log('Making API call to:', url); // Debug log
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    console.log('Response status:', response.status); // Debug log
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const data = await apiCall('/sessions');
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const startNewChat = async () => {
    try {
      const data = await apiCall('/sessions/new', { method: 'POST' });
      const newSession = {
        id: data.sessionId,
        title: data.title,
        createdAt: new Date().toISOString()
      };
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const data = await apiCall(`/sessions/${sessionId}/messages`);
      setCurrentSession(sessions.find(s => s.id === sessionId));
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input
    };

    setMessages([...messages, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let sessionId = currentSession?.id;
      if (!sessionId) {
        const newSessionData = await apiCall('/sessions/new', { method: 'POST' });
        sessionId = newSessionData.sessionId;
        const newSession = {
          id: sessionId,
          title: currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : ''),
          createdAt: new Date().toISOString()
        };
        setSessions([newSession, ...sessions]);
        setCurrentSession(newSession);
      }

      const data = await apiCall(`/ask`, {
        method: 'POST',
        body: JSON.stringify({ 
          sessionId: sessionId,
          message: currentInput 
        })
      });

      setMessages(prev => [...prev, data.message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error to user
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, there was an error connecting to the server. Please make sure the backend is running on http://localhost:3000'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFeedback = (messageId, type) => {
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ${darkMode ? 'bg-gray-950' : 'bg-white'} border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'} overflow-hidden flex flex-col md:relative fixed md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30 h-full`}>
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={startNewChat}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <Plus size={18} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2">Recent Chats</div>
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                currentSession?.id === session.id
                  ? darkMode ? 'bg-gray-800' : 'bg-gray-200'
                  : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{session.title}</div>
                  <div className="text-xs text-gray-500">{formatDate(session.createdAt)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">User</div>
              <div className="text-xs text-gray-500">user@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-4 flex items-center justify-between`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <h1 className="text-lg font-semibold">{currentSession?.title || 'ChatGPT Clone'}</h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h2 className="text-3xl font-semibold mb-4">How can I help you today?</h2>
                <p className="text-gray-500">Ask me anything and I'll provide detailed answers with structured data.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`${message.role === 'user' ? 'ml-auto' : ''}`}>
                  {message.role === 'user' ? (
                    <div className={`inline-block px-4 py-2 rounded-2xl ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white ml-auto`}>
                      {message.content}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                        <p className="mb-3">{message.content}</p>
                        
                        {message.table && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={darkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                                  {message.table.headers.map((header, i) => (
                                    <th key={i} className="px-4 py-2 text-left font-semibold">{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.table.rows.map((row, i) => (
                                  <tr key={i} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    {row.map((cell, j) => (
                                      <td key={j} className="px-4 py-2">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(message.id, 'like')}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'dislike')}
                          className={`p-1.5 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-4`}>
          <div className="max-w-3xl mx-auto">
            <div className={`flex gap-2 p-2 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-300'}`}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message ChatGPT..."
                className={`flex-1 px-4 py-2 bg-transparent outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl ${
                  input.trim() && !loading
                    ? darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;