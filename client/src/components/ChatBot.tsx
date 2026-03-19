import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, X, MessageCircle } from 'lucide-react';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ConversationFlow {
  id: string;
  triggers: string[];
  response: string;
  nextFlows?: string[];
  isLeadCapture?: boolean;
  leadFields?: string[];
}

interface ChatBotProps {
  flows: Record<string, ConversationFlow>;
  language: string;
  onLeadCapture?: (lead: Record<string, string>) => void;
  title?: string;
  subtitle?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  flows,
  language,
  onLeadCapture,
  title = "Manna Bot",
  subtitle = "How can we help you today?"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentFlowId, setCurrentFlowId] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [capturedData, setCapturedData] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeFlow = flows['welcome'];
      if (welcomeFlow) {
        addBotMessage(welcomeFlow.response);
        setCurrentFlowId('welcome');
      }
    }
  }, [isOpen]);

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const findNextFlow = (userInput: string): string | null => {
    const lowerInput = userInput.toLowerCase().trim();
    
    for (const [flowId, flow] of Object.entries(flows)) {
      if (flow.triggers.some(trigger => 
        lowerInput.includes(trigger.toLowerCase()) || 
        trigger.toLowerCase().includes(lowerInput)
      )) {
        return flowId;
      }
    }
    return null;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const nextFlowId = findNextFlow(userMessage);
      
      if (nextFlowId) {
        const nextFlow = flows[nextFlowId];
        
        // Handle lead capture
        if (nextFlow.isLeadCapture && nextFlow.leadFields) {
          setCapturedData(prev => ({
            ...prev,
            [nextFlow.leadFields![0]]: userMessage
          }));
        }
        
        addBotMessage(nextFlow.response);
        setCurrentFlowId(nextFlowId);
      } else {
        // Fallback response
        addBotMessage("I didn't quite understand that. Could you try again or select one of the options above?");
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-green-100">{subtitle}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Start a conversation...</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
                className="bg-green-500 hover:bg-green-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
