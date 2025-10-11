import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance, useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  Minimize2,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// API functions
const sendChatMessage = async (message) => {
  const { data } = await axiosInstance.post('/chatbot/message', { message });
  return data.data;
};

const getSuggestions = async () => {
  const { data } = await axiosInstance.get('/chatbot/suggestions');
  return data.data;
};

const clearChatHistory = async () => {
  const { data } = await axiosInstance.delete('/chatbot/history');
  return data;
};

// Markdown Message Component
function MarkdownMessage({ content, role, timestamp, isError }) {
  return (
    <div
      className={cn(
        'max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
        role === 'user'
          ? 'bg-blue-600 text-white'
          : isError
          ? 'bg-red-50 text-red-900 border border-red-200'
          : 'bg-white text-gray-900 border border-gray-200'
      )}
    >
      {role === 'user' ? (
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
      ) : (
        <div className="markdown-content text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Headings
              h1: ({ node, ...props }) => (
                <h1 className="text-lg font-bold mb-2 text-blue-700 mt-3 first:mt-0" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-base font-semibold mb-2 text-blue-600 mt-3 first:mt-0" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-sm font-semibold mb-1.5 text-gray-800 mt-2 first:mt-0" {...props} />
              ),
              
              // Paragraphs
              p: ({ node, ...props }) => (
                <p className="mb-2 leading-relaxed text-gray-800 last:mb-0" {...props} />
              ),
              
              // Strong/Bold
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-gray-900" {...props} />
              ),
              
              // Emphasis/Italic
              em: ({ node, ...props }) => (
                <em className="italic text-gray-700" {...props} />
              ),
              
              // Lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-gray-800 leading-relaxed" {...props} />
              ),
              
              // Code
              code: ({ node, inline, className, children, ...props }) => {
                return inline ? (
                  <code
                    className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-red-600 border border-gray-200"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className={cn(
                      'block bg-gray-900 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono',
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              
              // Pre (code blocks)
              pre: ({ node, ...props }) => (
                <pre className="my-2 overflow-hidden rounded-lg" {...props} />
              ),
              
              // Blockquotes
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-3 py-1 italic text-gray-600 my-2 bg-blue-50 rounded-r"
                  {...props}
                />
              ),
              
              // Links
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              
              // Tables
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-2">
                  <table className="min-w-full border-collapse border border-gray-300 text-xs" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 bg-gray-100 px-3 py-1.5 font-semibold text-left" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-3 py-1.5" {...props} />
              ),
              
              // Horizontal Rule
              hr: ({ node, ...props }) => (
                <hr className="my-3 border-gray-300" {...props} />
              ),
              
              // Images (if any)
              img: ({ node, ...props }) => (
                <img className="max-w-full h-auto rounded-lg my-2" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
      <p
        className={cn(
          'text-xs mt-1.5',
          role === 'user' ? 'text-blue-100' : 'text-gray-400'
        )}
      >
        {formatDistanceToNow(new Date(timestamp), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
}

export default function ChatBot() {
  const { userInfo } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! 👋 I'm **SAMANVAY AI Assistant**.

I can help you with:
- Project management and tracking
- Agency assignments and recommendations
- Fund utilization and PFMS data
- Alert management and workflows
- Platform navigation and features

How can I assist you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Don't render if not authenticated
  if (!userInfo) {
    return null;
  }

  // Fetch suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['chatSuggestions'],
    queryFn: getSuggestions,
    enabled: isOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp,
        },
      ]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '**Error**: Sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.',
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    },
  });

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => {
      setMessages([
        {
          role: 'assistant',
          content: `**Chat history cleared successfully.**

How can I help you today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
  });

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || sendMessageMutation.isPending) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');

    await sendMessageMutation.mutateAsync(messageText);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      clearHistoryMutation.mutate();
    }
  };

  // Floating Button - Always visible when not open
  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 9999,
        }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 relative overflow-hidden group"
          size="icon"
          style={{
            background:
              'linear-gradient(to bottom, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* White circle background for icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white/95 flex items-center justify-center shadow-inner">
              <MessageCircle
                className="h-5 w-5 text-blue-600"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Pulse animation */}
          <span
            className="absolute inset-0 rounded-full bg-white/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Full Screen Overlay */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
      >
        <Card
          className="flex flex-col bg-white"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            bottom: '0.5rem',
            left: '0.5rem',
            height: 'auto',
          }}
        >
          {/* Header - Clean and Professional */}
          <CardHeader className="flex-shrink-0 border-b p-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-semibold text-white truncate">
                    SAMANVAY AI Assistant
                  </CardTitle>
                  <p className="text-xs text-blue-100 truncate">
                    Online • Powered by Groq AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-blue-500"
                  onClick={handleClearHistory}
                  disabled={clearHistoryMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <MarkdownMessage
                      content={msg.content}
                      role={msg.role}
                      timestamp={msg.timestamp}
                      isError={msg.isError}
                    />
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Suggestions */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="flex-shrink-0 px-4 pb-3 bg-white border-t">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <span>💡</span> Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs font-normal text-gray-700 border-gray-300 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t p-4 bg-white">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about SAMANVAY..."
                disabled={sendMessageMutation.isPending}
                className="flex-1 text-sm border-gray-300 focus-visible:ring-blue-500"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="icon"
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop: Bottom Right Card */}
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          bottom: isMinimized ? '5rem' : '5rem',
          right: '1.5rem',
          zIndex: 9999,
        }}
      >
        <Card
          className={cn(
            'flex flex-col shadow-2xl transition-all bg-white border-2 border-gray-200',
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          )}
        >
          {/* Header */}
          <CardHeader
            className={cn(
              'flex-shrink-0 border-b p-4 bg-gradient-to-r from-blue-600 to-blue-700',
              isMinimized && 'cursor-pointer'
            )}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base font-semibold text-white truncate">
                    SAMANVAY AI Assistant
                  </CardTitle>
                  <p className="text-xs text-blue-100 truncate">
                    Online • Powered by Groq AI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isMinimized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearHistory();
                    }}
                    disabled={clearHistoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <MarkdownMessage
                          content={msg.content}
                          role={msg.role}
                          timestamp={msg.timestamp}
                          isError={msg.isError}
                        />
                      </div>
                    ))}
                    {sendMessageMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-500">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Suggestions */}
              {messages.length <= 1 && suggestions.length > 0 && (
                <div className="flex-shrink-0 px-4 pb-3 bg-white border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <span>💡</span> Suggested questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 4).map((suggestion, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs font-normal text-gray-700 border-gray-300 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex-shrink-0 border-t p-4 bg-white">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about SAMANVAY..."
                    disabled={sendMessageMutation.isPending}
                    className="flex-1 border-gray-300 focus-visible:ring-blue-500"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={
                      !inputMessage.trim() || sendMessageMutation.isPending
                    }
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}