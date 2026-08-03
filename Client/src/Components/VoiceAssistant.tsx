import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('How can I help you today?');
  const [pulseColor, setPulseColor] = useState('#52c41a');

  const recognitionRef = useRef<any>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setSupported(true);
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setPulseColor('#ef4444'); // Red pulse when recording
        setStatusMessage('Listening...');
        setTranscript('');
        setInterimTranscript('');
      };

      rec.onend = () => {
        setIsListening(false);
        setPulseColor('#52c41a'); // Back to green
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setPulseColor('#52c41a');
        if (event.error === 'not-allowed') {
          setStatusMessage('Microphone access denied.');
        } else {
          setStatusMessage('Oops! I couldn\'t hear you.');
        }
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          handleVoiceCommand(final);
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleAssistant = () => {
    if (!isOpen) {
      setIsOpen(true);
      setStatusMessage('How can I help you today?');
      setTranscript('');
      setInterimTranscript('');
      // Delay listening slightly to allow overlay animation
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      stopListening();
      setIsOpen(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    if ((window as any).showToast) {
      (window as any).showToast(severity, summary, detail);
    } else {
      alert(`${summary}: ${detail}`);
    }
  };

  // Process voice commands
  const handleVoiceCommand = async (command: string) => {
    const lower = command.toLowerCase().trim();
    setStatusMessage(`Processing: "${command}"...`);

    // 1. Navigation Commands
    if (
      lower.includes('go to cart') || 
      lower.includes('open cart') || 
      lower.includes('show cart') || 
      lower.includes('view cart')
    ) {
      setStatusMessage('Navigating to Cart...');
      setTimeout(() => {
        navigate('/user/cart');
        setIsOpen(false);
      }, 1000);
      return;
    }

    if (
      lower.includes('checkout') || 
      lower.includes('go to checkout') || 
      lower.includes('open checkout') || 
      lower.includes('place order')
    ) {
      setStatusMessage('Navigating to Checkout...');
      setTimeout(() => {
        navigate('/user/checkout');
        setIsOpen(false);
      }, 1000);
      return;
    }

    if (
      lower.includes('go home') || 
      lower.includes('go to home') || 
      lower.includes('show home') || 
      lower.includes('open home') || 
      lower.includes('tastyhub home')
    ) {
      setStatusMessage('Navigating Home...');
      setTimeout(() => {
        navigate('/user/home');
        setIsOpen(false);
      }, 1000);
      return;
    }

    if (lower.includes('go to contact') || lower.includes('open contact') || lower.includes('contact page')) {
      setStatusMessage('Navigating to Contact Page...');
      setTimeout(() => {
        navigate('/user/contact');
        setIsOpen(false);
      }, 1000);
      return;
    }

    if (lower.includes('go to profile') || lower.includes('open profile') || lower.includes('my profile')) {
      setStatusMessage('Navigating to Profile Page...');
      setTimeout(() => {
        navigate('/user/profilepage');
        setIsOpen(false);
      }, 1000);
      return;
    }

    if (lower.includes('go to menu') || lower.includes('open menu') || lower.includes('show menu') || lower.includes('view menu') || lower.includes('store')) {
      setStatusMessage('Navigating to Menu...');
      setTimeout(() => {
        navigate('/user/menu-items');
        setIsOpen(false);
      }, 1000);
      return;
    }

    // 2. Add to Cart Command
    const cartRegex = /(?:add|put|order)\s+(.+?)\s+(?:to|in)\s+(?:the\s+|my\s+)?cart/i;
    const match = lower.match(cartRegex);
    let foodItem = '';

    if (match && match[1]) {
      foodItem = match[1].trim();
    } else if (lower.startsWith('add ') || lower.startsWith('put ')) {
      // Fallback: starts with "add " or "put "
      foodItem = lower
        .replace(/^add\s+/i, '')
        .replace(/^put\s+/i, '')
        .replace(/\bto\s+(the\s+|my\s+)?cart\b/i, '')
        .replace(/\bin\s+(the\s+|my\s+)?cart\b/i, '')
        .trim();
    }

    // Remove articles
    if (foodItem) {
      foodItem = foodItem.replace(/^(a|an|the|some)\s+/i, '').trim();
    }

    if (foodItem && (lower.includes('add') || lower.includes('put') || lower.includes('cart'))) {
      if (!auth?.isAuthenticated) {
        setStatusMessage('Please login to add items to your cart.');
        showToast('warn', 'Authentication Required', 'Please log in to add items to your cart.');
        setTimeout(() => {
          navigate('/user/auth');
          setIsOpen(false);
        }, 1500);
        return;
      }

      try {
        setStatusMessage(`Searching for "${foodItem}" in kitchen...`);
        const res = await axios.get(`${backendUrl}/api/products/getallproducts`);
        const products = res.data?.data || [];

        // Find match in title/name
        const matchedProduct = products.find((p: any) => {
          const title = (p.title || p.name || '').toLowerCase();
          return title.includes(foodItem) || foodItem.includes(title);
        });

        if (matchedProduct) {
          setStatusMessage(`Adding "${matchedProduct.title || matchedProduct.name}" to cart...`);

          const cartItem = {
            name: matchedProduct.title || matchedProduct.name,
            image: matchedProduct.image,
            category: matchedProduct.category || 'Food',
            description: matchedProduct.description || '',
            quantity: 1,
            original_price: matchedProduct.price,
            discount_price: matchedProduct.discountPrice ?? matchedProduct.price,
          };

          const token = auth?.token || localStorage.getItem('token');
          await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });

          setStatusMessage(`Added ${cartItem.name} to cart!`);
          showToast('success', 'Cart Updated', `Successfully added ${cartItem.name} to your cart.`);
          
          if ((window as any).updateCartCount) {
            (window as any).updateCartCount();
          }

          setTimeout(() => {
            setIsOpen(false);
          }, 1500);
        } else {
          setStatusMessage(`Could not find "${foodItem}" in our menu.`);
          showToast('error', 'Item Not Found', `We couldn't find any items matching "${foodItem}"`);
        }
      } catch (err) {
        console.error('Error adding via voice command:', err);
        setStatusMessage('Error adding item to cart.');
        showToast('error', 'Add to Cart Failed', 'Something went wrong. Please try again.');
      }
      return;
    }

    // 3. Search Commands (or general query fallback)
    let searchQuery = lower;
    if (searchQuery.startsWith('search for ')) {
      searchQuery = searchQuery.replace('search for ', '');
    } else if (searchQuery.startsWith('search ')) {
      searchQuery = searchQuery.replace('search ', '');
    } else if (searchQuery.startsWith('find ')) {
      searchQuery = searchQuery.replace('find ', '');
    }
    searchQuery = searchQuery.trim();

    if (searchQuery) {
      setStatusMessage(`Searching for "${searchQuery}"...`);
      setTimeout(() => {
        navigate(`/user/home?search=${encodeURIComponent(searchQuery)}`);
        setIsOpen(false);
      }, 1000);
    } else {
      setStatusMessage('Sorry, I did not catch that. Try saying "Search Biryani" or "Add Pizza to cart".');
    }
  };

  if (!supported) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div 
        onClick={toggleAssistant}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#52c41a',
          boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s',
        }}
        className="voice-assistant-fab"
        title="TastyHub Voice Assistant"
      >
        <i className="pi pi-microphone" style={{ fontSize: '24px', color: 'white' }} />
        
        {/* Pulse ripple ring */}
        <span 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `3px solid ${pulseColor}`,
            animation: 'assistantPulse 2s infinite',
            pointerEvents: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Siri-style Assistant Glassmorphism Panel */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '105px',
            right: '30px',
            width: '340px',
            backgroundColor: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 9998,
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            animation: 'assistantSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: isListening ? '#ef4444' : '#52c41a',
                  boxShadow: isListening ? '0 0 8px #ef4444' : '0 0 8px #52c41a'
                }} 
              />
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a1a1aa' }}>
                TastyHub Voice AI
              </span>
            </div>
            <i 
              className="pi pi-times" 
              onClick={toggleAssistant} 
              style={{ cursor: 'pointer', color: '#a1a1aa', fontSize: '14px' }} 
            />
          </div>

          {/* Status message */}
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#e4e4e7', lineHeight: '1.4' }}>
            {statusMessage}
          </div>

          {/* Transcript Panel */}
          {(transcript || interimTranscript) && (
            <div 
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: '12px', 
                padding: '12px 16px', 
                fontSize: '14px', 
                lineHeight: '1.5',
                minHeight: '44px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {transcript && <span style={{ color: '#52c41a', fontWeight: 600 }}>{transcript}</span>}
              {interimTranscript && <span style={{ color: '#a1a1aa', fontStyle: 'italic' }}> {interimTranscript}</span>}
            </div>
          )}

          {/* Visual Waveform Bouncing Waves */}
          {isListening && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', height: '30px', margin: '8px 0' }}>
              <div className="wave-bar bar-1" />
              <div className="wave-bar bar-2" />
              <div className="wave-bar bar-3" />
              <div className="wave-bar bar-4" />
              <div className="wave-bar bar-5" />
            </div>
          )}

          {/* Action Helper Hints */}
          <div 
            style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              paddingTop: '12px',
              fontSize: '12px',
              color: '#71717a',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span style={{ fontWeight: 600, color: '#a1a1aa' }}>💡 Try saying:</span>
            <span>• "Add Royal Biryani to cart"</span>
            <span>• "Search for veggie double cheese pizza"</span>
            <span>• "Go to cart" or "Checkout"</span>
          </div>

          {/* Microphone control button inside card */}
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              backgroundColor: isListening ? '#ef4444' : '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            <i className={isListening ? "pi pi-microphone-slash" : "pi pi-microphone"} />
            {isListening ? 'Stop Listening' : 'Speak Again'}
          </button>
        </div>
      )}

      {/* Global Voice Assistant Styles */}
      <style>{`
        @keyframes assistantPulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        
        @keyframes assistantSlideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .voice-assistant-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 28px rgba(82, 196, 26, 0.45);
        }

        /* Waveform Animation */
        .wave-bar {
          width: 4px;
          height: 10px;
          background-color: #52c41a;
          border-radius: 2px;
          animation: wavePulse 1.2s ease-in-out infinite;
        }

        .bar-1 { animation-delay: 0.1s; }
        .bar-2 { animation-delay: 0.3s; height: 18px; background-color: #389e0d; }
        .bar-3 { animation-delay: 0.5s; height: 24px; background-color: #ef4444; }
        .bar-4 { animation-delay: 0.2s; height: 16px; background-color: #389e0d; }
        .bar-5 { animation-delay: 0.4s; }

        @keyframes wavePulse {
          0%, 100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </>
  );
};

export default VoiceAssistant;
