const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const sessions = new Map();
const messages = new Map();

// Mock data for responses
const mockResponses = {
  programming: {
    content: 'Here are the top programming languages based on popularity and usage:',
    table: {
      headers: ['Language', 'Popularity', 'Use Case', 'Difficulty'],
      rows: [
        ['Python', '⭐⭐⭐⭐⭐', 'Web, AI, Data Science', 'Easy'],
        ['JavaScript', '⭐⭐⭐⭐⭐', 'Web Development', 'Medium'],
        ['Java', '⭐⭐⭐⭐', 'Enterprise, Android', 'Medium'],
        ['C++', '⭐⭐⭐⭐', 'Systems, Gaming', 'Hard'],
        ['Go', '⭐⭐⭐', 'Cloud, Backend', 'Medium'],
        ['TypeScript', '⭐⭐⭐⭐', 'Web Development', 'Medium'],
        ['Rust', '⭐⭐⭐', 'Systems, Performance', 'Hard'],
        ['Swift', '⭐⭐⭐', 'iOS Development', 'Medium']
      ]
    }
  },
  frameworks: {
    content: 'Here\'s a comprehensive overview of modern web frameworks:',
    table: {
      headers: ['Framework', 'Type', 'Learning Curve', 'Performance', 'Community'],
      rows: [
        ['React', 'Library', 'Medium', '⭐⭐⭐⭐', 'Very Large'],
        ['Vue', 'Framework', 'Easy', '⭐⭐⭐⭐⭐', 'Large'],
        ['Angular', 'Framework', 'Hard', '⭐⭐⭐⭐', 'Large'],
        ['Svelte', 'Compiler', 'Easy', '⭐⭐⭐⭐⭐', 'Growing'],
        ['Next.js', 'Framework', 'Medium', '⭐⭐⭐⭐⭐', 'Large'],
        ['Nuxt', 'Framework', 'Medium', '⭐⭐⭐⭐', 'Medium'],
        ['Remix', 'Framework', 'Medium', '⭐⭐⭐⭐⭐', 'Growing']
      ]
    }
  },
  databases: {
    content: 'Popular databases and their characteristics:',
    table: {
      headers: ['Database', 'Type', 'Best For', 'Scalability', 'Ease of Use'],
      rows: [
        ['PostgreSQL', 'Relational', 'Complex queries', '⭐⭐⭐⭐', 'Medium'],
        ['MySQL', 'Relational', 'Web apps', '⭐⭐⭐⭐', 'Easy'],
        ['MongoDB', 'Document', 'Flexible schema', '⭐⭐⭐⭐⭐', 'Easy'],
        ['Redis', 'Key-Value', 'Caching', '⭐⭐⭐⭐⭐', 'Easy'],
        ['Cassandra', 'Wide-Column', 'Big data', '⭐⭐⭐⭐⭐', 'Hard'],
        ['DynamoDB', 'Key-Value', 'AWS ecosystem', '⭐⭐⭐⭐⭐', 'Medium']
      ]
    }
  },
  default: {
    content: 'Here\'s a detailed comparison based on your query:',
    table: {
      headers: ['Item', 'Category', 'Rating', 'Status', 'Notes'],
      rows: [
        ['Item A', 'Technology', '⭐⭐⭐⭐⭐', 'Active', 'Highly recommended'],
        ['Item B', 'Technology', '⭐⭐⭐⭐', 'Active', 'Good choice'],
        ['Item C', 'Technology', '⭐⭐⭐', 'Growing', 'Emerging option'],
        ['Item D', 'Technology', '⭐⭐⭐⭐', 'Stable', 'Reliable'],
        ['Item E', 'Technology', '⭐⭐⭐⭐⭐', 'Popular', 'Industry standard']
      ]
    }
  }
};

// Helper function to generate mock response
function generateMockResponse(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('database') || lowerQuery.includes('sql') || lowerQuery.includes('mongo') || lowerQuery.includes('db')) {
    return mockResponses.databases;
  } else if (lowerQuery.includes('programming') || lowerQuery.includes('language') || lowerQuery.includes('code')) {
    return mockResponses.programming;
  } else if (lowerQuery.includes('framework') || lowerQuery.includes('react') || lowerQuery.includes('vue') || lowerQuery.includes('angular')) {
    return mockResponses.frameworks;
  } else {
    return mockResponses.default;
  }
}

// Helper function to generate title from message
function generateTitle(message) {
  const words = message.split(' ').slice(0, 6);
  return words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
}

// API Routes

// Create new session
app.post('/api/sessions/new', (req, res) => {
  const sessionId = `session-${uuidv4()}`;
  const session = {
    id: sessionId,
    title: 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  sessions.set(sessionId, session);
  messages.set(sessionId, []);
  
  res.json({
    sessionId: session.id,
    title: session.title,
    createdAt: session.createdAt
  });
});

// Get all sessions
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  res.json({
    sessions: sessionList
  });
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// Get session messages
app.get('/api/sessions/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const sessionMessages = messages.get(sessionId) || [];
  
  res.json({
    sessionId,
    messages: sessionMessages
  });
});

// Ask a question
app.post('/api/ask', (req, res) => {
  const { sessionId, message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  let currentSessionId = sessionId;
  
  // If no session ID, create a new session
  if (!currentSessionId || !sessions.has(currentSessionId)) {
    currentSessionId = `session-${uuidv4()}`;
    const newSession = {
      id: currentSessionId,
      title: generateTitle(message),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessions.set(currentSessionId, newSession);
    messages.set(currentSessionId, []);
  }
  
  // Get or create message array for session
  let sessionMessages = messages.get(currentSessionId) || [];
  
  // Add user message
  const userMessage = {
    id: `msg-${Date.now()}-user`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  sessionMessages.push(userMessage);
  
  // Generate assistant response
  const mockResponse = generateMockResponse(message);
  const assistantMessage = {
    id: `msg-${Date.now()}-assistant`,
    role: 'assistant',
    content: mockResponse.content,
    table: mockResponse.table,
    timestamp: new Date().toISOString(),
    feedback: null
  };
  
  sessionMessages.push(assistantMessage);
  messages.set(currentSessionId, sessionMessages);
  
  // Update session
  const session = sessions.get(currentSessionId);
  if (session && session.title === 'New Chat') {
    session.title = generateTitle(message);
  }
  if (session) {
    session.updatedAt = new Date().toISOString();
  }
  
  res.json({
    sessionId: currentSessionId,
    message: assistantMessage
  });
});

// Update message feedback
app.post('/api/messages/:messageId/feedback', (req, res) => {
  const { messageId } = req.params;
  const { feedback } = req.body;
  
  if (!['like', 'dislike'].includes(feedback)) {
    return res.status(400).json({ error: 'Invalid feedback' });
  }
  
  // Find message across all sessions
  let found = false;
  for (const [sessionId, sessionMessages] of messages.entries()) {
    const message = sessionMessages.find(m => m.id === messageId);
    if (message) {
      message.feedback = feedback;
      found = true;
      break;
    }
  }
  
  if (!found) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.json({ success: true, messageId, feedback });
});

// Delete session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  sessions.delete(sessionId);
  messages.delete(sessionId);
  
  res.json({ success: true, sessionId });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    sessions: sessions.size,
    totalMessages: Array.from(messages.values()).reduce((acc, msgs) => acc + msgs.length, 0)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  
  // Initialize some sample sessions
  const sampleSessions = [
    {
      id: 'session-1',
      title: 'Programming Languages Overview',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'session-2',
      title: 'Web Development Frameworks',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'session-3',
      title: 'Database Comparison',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];
  
  sampleSessions.forEach(session => {
    sessions.set(session.id, session);
    messages.set(session.id, []);
  });
  
  console.log('✅ Sample sessions initialized');
});