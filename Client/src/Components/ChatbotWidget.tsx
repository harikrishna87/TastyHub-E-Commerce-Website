import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('tastybot_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showGreetingCard, setShowGreetingCard] = useState(() => {
    return sessionStorage.getItem('tastybot_hide_greeting') !== 'true';
  });

  const handleCloseGreeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGreetingCard(false);
    sessionStorage.setItem('tastybot_hide_greeting', 'true');
  };

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('tastybot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Greet user dynamically and manage session clearing on login status change
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${backendUrl}/api/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.messages.length > 0) {
          const dbHistory = response.data.messages.map((m: any, idx: number) => ({
            id: `db-${idx}-${m.timestamp}`,
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(dbHistory);
          return;
        }
      } catch (err) {
        console.error('Failed to load chat history from database:', err);
      }

      // Fallback greeting if no database history exists
      const userName = user?.name ? `, ${user.name.split(' ')[0]}` : '';
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Hello${userName}! I'm **Buddy**, your AI dining assistant. 🍽️\n\nHow can I help you today? I can recommend dishes, track your orders, explain refunds, or tell you about active coupons!`,
          timestamp: new Date(),
        },
      ]);
    };

    if (!user) {
      // User logged out or guest session - clear previous chat to prevent leaks
      sessionStorage.removeItem('tastybot_messages');
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `Hello! I'm **Buddy**, your AI dining assistant. 🍽️\n\nHow can I help you today? I can recommend dishes, track your orders, explain refunds, or tell you about active coupons!`,
          timestamp: new Date(),
        },
      ]);
    } else {
      // Logged in user - fetch persistent history from DB
      fetchHistory();
    }
  }, [user]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestionChips = [
    { label: '🍕 Recommend Pizzas', query: 'Recommend some delicious pizzas from the menu' },
    { label: '🎫 Active Coupons', query: 'What active promo coupons or discount codes do you have?' },
    { label: '📦 Track My Order', query: 'Track my recent order status' },
    { label: '🥗 Low Calorie Options', query: 'Show me healthy, low calorie vegetarian dishes' },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Alert new messages when chatbot is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1 && messages[messages.length - 1].sender === 'bot') {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Map history for Gemini backend (removes standard systemInstruction because backend handles it)
      const chatHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      // Make API Request to endpoint
      const response = await axios.post(
        `${backendUrl}/api/chat`,
        {
          message: textToSend,
          history: chatHistory,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`,
          },
        }
      );

      const botReply = response.data.reply;
      const wasAdded = response.data.addedToCart;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botReply,
          timestamp: new Date(),
        },
      ]);

      if (wasAdded) {
        if ((window as any).updateCartCount) {
          (window as any).updateCartCount();
        }
        if ((window as any).showToast) {
          (window as any).showToast('success', 'Cart Updated', 'Item added to cart via TastyBot');
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      let errMsg = 'Sorry, I am having trouble connecting to my servers. Please try again.';
      if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `⚠️ **Error:** ${errMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text: string, isUserMessage: boolean) => {
    const lines = text.split('\n');

    // If it's a single line of text (not a list), render inline so it sits next to the floated timestamp
    if (lines.length === 1 && !lines[0].trim().startsWith('- ') && !lines[0].trim().startsWith('* ')) {
      const parts = lines[0].split('**');
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} style={{ color: isUserMessage ? '#14532d' : '#1b4332', fontWeight: '700' }}>{part}</strong>;
        }
        return part;
      });
    }

    return lines.map((line, idx) => {
      let content = line;

      // Handle bullet points
      const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
      if (isBullet) {
        content = content.replace(/^[-*]\s+/, '');
      }

      // Render bold tokens **text**
      const parts = content.split('**');
      const formattedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} style={{ color: isUserMessage ? '#14532d' : '#1b4332', fontWeight: '700' }}>{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="tastybot-li" style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc' }}>
            <span>{formattedLine}</span>
          </li>
        );
      }

      return (
        <p key={idx} className="tastybot-p" style={{ marginBottom: '4px', lineHeight: '1.5', display: 'block' }}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      <style>{`
        /* Chatbot Style Variables & Animation overrides */
        .tastybot-launcher {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          outline: none;
        }
        .tastybot-launcher:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 38px rgba(16, 185, 129, 0.6);
        }
        .tastybot-launcher-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #10b981;
          opacity: 0.6;
          animation: launcherPulse 2s infinite;
          pointer-events: none;
        }
        @keyframes launcherPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        
        .tastybot-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          animation: badgeBounce 1s infinite alternate;
        }
        @keyframes badgeBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }

        .tastybot-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 30vw;
          height: 100vh;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: -10px 0 50px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          animation: slideInDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          border-top-left-radius: 24px;
          border-bottom-left-radius: 24px;
        }
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 1200px) {
          .tastybot-container {
            width: 45vw;
          }
        }
        @media (max-width: 768px) {
          .tastybot-container {
            width: 100vw;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
        }

        .tastybot-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #064e3b, #047857);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tastybot-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tastybot-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .tastybot-status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          margin-left: 6px;
          box-shadow: 0 0 8px #10b981;
        }

        .tastybot-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
          background-color: #efeae2;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23ebe3d9' fill-opacity='0.75'%3E%3Cpath d='M15 15h6v2h-6zm45 45h6v2h-6zm40 10h4v4h-4zm-70 15c2 0 3-1 3-3s-1-3-3-3-3 1-3 3 1 3 3 3zm50-60c3 0 5-2 5-5s-2-5-5-5-5 2-5 5 2 5 5 5zm5 85c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3zm-60-45c0 4-3 7-7 7s-7-3-7-7 3-7 7-7 7 3 7 7zm55 0c0 4-3 7-7 7s-7-3-7-7 3-7 7-7 7 3 7 7z'/%3E%3Cpath d='M25 45l5-5 5 5-5 5zm50 15l3-3 3 3-3 3z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .tastybot-messages::-webkit-scrollbar {
          width: 5px;
        }
        .tastybot-messages::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }

        .tastybot-bubble {
          max-width: 82%;
          padding: 8px 12px 6px 12px;
          border-radius: 12px;
          font-size: 0.92rem;
          box-shadow: 0 1px 1.5px rgba(0, 0, 0, 0.12);
          animation: messageFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          word-break: break-word;
        }
        @keyframes messageFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tastybot-bubble-bot {
          align-self: flex-start;
          background: #ffffff;
          color: #1f2937;
          border-top-left-radius: 0;
          margin-left: 8px;
        }
        .tastybot-bubble-bot::before {
          content: "";
          position: absolute;
          top: 0;
          left: -8px;
          width: 8px;
          height: 12px;
          background: #ffffff;
          clip-path: polygon(100% 0, 0 0, 100% 100%);
        }

        .tastybot-bubble-user {
          align-self: flex-end;
          background: #d9fdd3;
          color: #1f2937;
          border-top-right-radius: 0;
          margin-right: 8px;
        }
        .tastybot-bubble-user::before {
          content: "";
          position: absolute;
          top: 0;
          right: -8px;
          width: 8px;
          height: 12px;
          background: #d9fdd3;
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }

        .tastybot-chips-container {
          padding: 10px 20px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          background: rgba(255, 255, 255, 0.5);
        }
        .tastybot-chips-container::-webkit-scrollbar {
          display: none;
        }
        .tastybot-chip {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #374151;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .tastybot-chip:hover {
          border-color: #10b981;
          color: #047857;
          background: #f0fdf4;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1);
        }

        .tastybot-input-container {
          padding: 14px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          background: white;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tastybot-input {
          flex: 1;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.92rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .tastybot-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
        .tastybot-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #10b981;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tastybot-send-btn:hover {
          background: #059669;
          transform: scale(1.05);
        }
        .tastybot-send-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        .tastybot-typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 8px;
          align-items: center;
          justify-content: center;
        }
        .tastybot-typing-dot {
          width: 6px;
          height: 6px;
          background: #047857;
          border-radius: 50%;
          opacity: 0.6;
          animation: typingDotBouncing 1.4s infinite ease-in-out both;
        }
        .tastybot-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .tastybot-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingDotBouncing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        
        .tastybot-timestamp {
          float: right;
          font-size: 0.65rem;
          color: #667781;
          margin-top: 6px;
          margin-left: 8px;
          user-select: none;
          line-height: 1;
        }

        .tastybot-launcher-greeting {
          position: fixed;
          bottom: 105px;
          right: 30px;
          background: #ffffff;
          color: #374151;
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          z-index: 9998;
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          animation: greetingFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(0,0,0,0.06);
          font-weight: 500;
        }
        @keyframes greetingFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tastybot-launcher-greeting::after {
          content: "";
          position: absolute;
          bottom: -8px;
          right: 22px;
          width: 0;
          height: 0;
          border-top: 8px solid #ffffff;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
        }
      `}</style>

      {/* Floating Action Button (Launcher) */}
      {!isOpen && (
        <>
          {showGreetingCard && (
            <div className="tastybot-launcher-greeting" onClick={handleOpenChat}>
              <span>Hey, I am Buddy AI chatbot 👋</span>
              <button 
                onClick={handleCloseGreeting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px',
                  marginLeft: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="pi pi-times" style={{ fontSize: '0.7rem' }}></i>
              </button>
            </div>
          )}
          <button className="tastybot-launcher" onClick={handleOpenChat}>
            <div className="tastybot-launcher-pulse"></div>
            {hasNewMessage && <div className="tastybot-badge"></div>}
            <i className="pi pi-comments" style={{ fontSize: '1.6rem' }}></i>
          </button>
        </>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="tastybot-container">
          {/* Header */}
          <div className="tastybot-header">
            <div className="tastybot-header-info">
              <div className="tastybot-avatar">
                <i className="pi pi-sparkles" style={{ fontSize: '1.2rem', color: '#6ee7b7' }}></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  Buddy
                  <span className="tastybot-status-dot"></span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#a7f3d0' }}>AI Dining Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: '4px' }}
            >
              <i className="pi pi-times" style={{ fontSize: '1.2rem' }}></i>
            </button>
          </div>

          {/* Messages Area */}
          <div className="tastybot-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`tastybot-bubble ${msg.sender === 'user' ? 'tastybot-bubble-user' : 'tastybot-bubble-bot'}`}
              >
                <div style={{ display: 'inline' }}>
                  {parseMarkdown(msg.text, msg.sender === 'user')}
                </div>
                <span className="tastybot-timestamp">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                </span>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="tastybot-bubble tastybot-bubble-bot" style={{ padding: '10px 14px', width: 'fit-content' }}>
                <div className="tastybot-typing-indicator">
                  <div className="tastybot-typing-dot"></div>
                  <div className="tastybot-typing-dot"></div>
                  <div className="tastybot-typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {!loading && (
            <div className="tastybot-chips-container">
              {suggestionChips.map((chip, index) => (
                <div 
                  key={index} 
                  className="tastybot-chip"
                  onClick={() => handleSendMessage(chip.query)}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          )}

          {/* Text Input Container */}
          <form 
            className="tastybot-input-container"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="tastybot-input"
              placeholder="Ask about pizzas, coupons, or order status..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="tastybot-send-btn" 
              disabled={loading || !inputText.trim()}
            >
              <i className="pi pi-send"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
