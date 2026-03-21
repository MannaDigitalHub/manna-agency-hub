import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, X, MessageCircle, Sparkles, RotateCcw } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotProps {
  title?: string;
  subtitle?: string;
}

// Generate a persistent session ID per browser tab
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('manna-bot-session');
  if (!sessionId) {
    sessionId = `manna-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('manna-bot-session', sessionId);
  }
  return sessionId;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  title = "Manna Bot",
  subtitle = "AI Powered — 14 Languages"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [sessionId] = useState(getSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC mutation for sending messages
  const sendMessage = trpc.aiChat.sendMessage.useMutation();
  const clearHistory = trpc.aiChat.clearHistory.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Send welcome greeting when chat first opens
  const sendGreeting = useCallback(async () => {
    if (hasGreeted) return;
    setHasGreeted(true);
    setIsLoading(true);

    try {
      const result = await sendMessage.mutateAsync({
        sessionId,
        message: 'Hi',
      });

      if (result.success) {
        setMessages([{
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: result.message,
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages([{
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Hi there! 👋 Welcome to Manna Digital Hub. I'm your AI assistant — how can I help your business today?",
        timestamp: new Date(),
      }]);
    }
    setIsLoading(false);
  }, [hasGreeted, sessionId, sendMessage]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      sendGreeting();
    }
  }, [isOpen, hasGreeted, sendGreeting]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();

    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await sendMessage.mutateAsync({
        sessionId,
        message: userMessage,
      });

      if (result.success) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: result.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: `bot-error-${Date.now()}`,
        type: 'bot',
        content: "Sorry, I'm having a moment. Please try again or reach out directly on WhatsApp: +27 73 406 1526",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleReset = async () => {
    try {
      await clearHistory.mutateAsync({ sessionId });
    } catch {
      // Ignore errors
    }
    setMessages([]);
    setHasGreeted(false);
    sessionStorage.removeItem('manna-bot-session');
  };

  // Quick action buttons for common queries
  const quickActions = [
    { label: "What services do you offer?", emoji: "🤖" },
    { label: "Show me pricing", emoji: "💰" },
    { label: "Book a free call", emoji: "📞" },
    { label: "How does it work?", emoji: "⚡" },
  ];

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    // Auto-submit
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    setInputValue('');

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    sendMessage.mutateAsync({ sessionId, message: text }).then(result => {
      if (result.success) {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: result.message,
          timestamp: new Date(),
        }]);
      }
      setIsLoading(false);
    }).catch(() => {
      setMessages(prev => [...prev, {
        id: `bot-error-${Date.now()}`,
        type: 'bot',
        content: "Sorry, please try again or WhatsApp us: +27 73 406 1526",
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    });
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 group z-40"
          aria-label="Open Manna Bot"
        >
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
            {/* Button */}
            <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 glow-green">
              <MessageCircle className="w-6 h-6" />
            </div>
            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-emerald-600" />
            </div>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-white text-gray-800 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Manna Bot
            <div className="absolute top-full right-4 w-2 h-2 bg-white transform rotate-45 -mt-1" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] sm:w-[420px] h-[620px] flex flex-col shadow-2xl z-50 rounded-2xl overflow-hidden border-0"
          style={{ background: 'oklch(0.14 0.015 260)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold backdrop-blur-sm">
                  M
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-300 rounded-full border-2 border-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base">{title}</h3>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  <p className="text-xs text-emerald-100">{subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Start new conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'oklch(0.12 0.015 260)' }}>
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-sm">Starting conversation...</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {message.type === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <span className="text-xs font-bold text-emerald-400">M</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-br-sm'
                        : 'bg-white/8 text-slate-200 border border-white/5 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span className={`text-[10px] mt-1.5 block ${message.type === 'user' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <span className="text-xs font-bold text-emerald-400">M</span>
                </div>
                <div className="bg-white/8 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions (show after first bot message, when few messages) */}
            {messages.length === 1 && messages[0].type === 'bot' && !isLoading && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-slate-500 px-1">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.label)}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 rounded-full transition-all duration-200"
                    >
                      {action.emoji} {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 shrink-0" style={{ background: 'oklch(0.14 0.015 260)', borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-11"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl h-11 w-11 shrink-0 disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Sparkles className="w-3 h-3 text-emerald-500/50" />
              <span className="text-[10px] text-slate-600">Powered by Manna AI</span>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
