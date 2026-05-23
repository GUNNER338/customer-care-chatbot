'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const router = useRouter();

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const userData = await response.json();
        setUser(userData.data || userData);
      } catch (err) {
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  // Fetch conversations
  const fetchConversations = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('http://localhost:5000/api/chatbot/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversationId) return;
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`http://localhost:5000/api/chatbot/conversations/${selectedConversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };
    fetchMessages();
  }, [selectedConversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const createNewChat = async () => {
    setSelectedConversationId(null);
    setMessages([]);
  };

  const handleRename = async (id, currentTitle) => {
    const newTitle = prompt('Enter new chat name:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    const token = localStorage.getItem('authToken');
    try {
      await fetch(`http://localhost:5000/api/chatbot/conversations/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      fetchConversations();
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`http://localhost:5000/api/chatbot/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const messageText = inputMessage;
    setInputMessage('');
    setIsSending(true);

    // Optimistically add user message
    const tempUserMessage = { id: Date.now().toString(), senderType: 'USER', content: messageText };
    setMessages(prev => [...prev, tempUserMessage]);

    const token = localStorage.getItem('authToken');
    try {
      const requestBody = {
        ...(selectedConversationId && { conversationId: selectedConversationId }),
        startNewConversation: !selectedConversationId,
        message: messageText
      };
      const response = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (!selectedConversationId && data.conversationId) {
          setSelectedConversationId(data.conversationId);
          fetchConversations();
        } else {
          // If we already had a conversation, just add the bot response
          const botMessage = { id: Date.now().toString() + 'bot', senderType: 'BOT', content: data.response };
          setMessages(prev => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const activeTitle = conversations.find(c => c.id === selectedConversationId)?.title || 'New Chat';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewChat}>
            <span>+</span> New Chat
          </button>
        </div>
        
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`conversation-item ${selectedConversationId === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversationId(conv.id)}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.title}
              </div>
              <div className="conversation-actions" onClick={e => e.stopPropagation()}>
                <button className="icon-btn" title="Rename" onClick={() => handleRename(conv.id, conv.title)}>✏️</button>
                <button className="icon-btn" title="Delete" onClick={() => handleDelete(conv.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginTop: '1rem' }}>
              No chat history.
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="user-mini-info">
              <span className="user-mini-name">{user?.fullName || 'User'}</span>
              <span className="user-mini-email">{user?.email}</span>
            </div>
            <button className="icon-btn" onClick={handleLogout} title="Logout">🚪</button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h2>{activeTitle}</h2>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>How can I help you today?</h3>
              <p>Type a message below to start a new conversation.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.senderType.toLowerCase()}`}>
                <div className={`avatar ${msg.senderType.toLowerCase()}`}>
                  {msg.senderType === 'USER' ? (user?.fullName?.[0] || 'U') : 'AI'}
                </div>
                <div className={`message ${msg.senderType.toLowerCase()}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="message-wrapper bot" style={{ opacity: 0.7 }}>
              <div className="avatar bot">AI</div>
              <div className="message bot">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form className="chat-form" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Message AI Support..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
            />
            <button type="submit" className="send-btn" disabled={!inputMessage.trim() || isSending}>
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
