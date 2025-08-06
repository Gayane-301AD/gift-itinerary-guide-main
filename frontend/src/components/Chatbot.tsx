import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import apiClient from "@/lib/api";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when component mounts
  useEffect(() => {
    if (user && !conversationId) {
      initializeConversation();
    }
  }, [user]);

  const initializeConversation = async () => {
    try {
      const response = await apiClient.getConversations();
      if (response.data && response.data.length > 0) {
        setConversationId(response.data[0].id);
        // Load existing messages
        const messagesResponse = await apiClient.getConversationMessages(response.data[0].id);
        if (messagesResponse.data) {
          setMessages(messagesResponse.data.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          })));
        }
      } else {
        // Create new conversation
        const createResponse = await apiClient.createConversation({
          title: "Gift Recommendation Chat"
        });
        if (createResponse.data) {
          setConversationId(createResponse.data.id);
        }
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiClient.sendMessage(input, conversationId, language);
      
      if (response.data) {
        const assistantMessage: Message = {
          id: response.data.id || Date.now().toString(),
          role: 'assistant',
          content: response.data.response || response.data.content || response.data.message || "I'm here to help you find the perfect gift!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.error) {
        // Handle specific error cases
        let errorContent = "Sorry, I'm having trouble connecting right now. Please try again later.";
        
        if (response.error.includes('Daily AI query limit reached')) {
          errorContent = "You've reached your daily AI query limit. Consider upgrading to Pro for unlimited queries!";
        } else if (response.error.includes('AI service is not properly configured')) {
          errorContent = "The AI service is temporarily unavailable. Please contact support for assistance.";
        } else if (response.error.includes('GEMMA_API_KEY')) {
          errorContent = "AI service is not available. Please contact support.";
        }
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        // Fallback response if API doesn't return expected format
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm here to help you find the perfect gift! Tell me about the occasion, budget, and recipient preferences.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide more specific error handling
      let errorContent = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorContent = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorContent = "The request timed out. Please try again.";
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] p-0">
          <div className="h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('chatbot.welcome')}</h3>
              <p className="text-muted-foreground mb-6">{t('chatbot.signInPrompt')}</p>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                {t('chatbot.signInButton')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <div className="h-[600px] flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t('chatbot.welcome')}</h2>
              <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {messages.length > 0 && `${messages.length} messages`}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center pt-24 pb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">{t('chatbot.welcome')}</h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                  {t('chatbot.welcomeMessage')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-sm font-medium text-foreground mb-1">{t('chatbot.occasionTitle')}</div>
                    <div className="text-xs text-muted-foreground">{t('chatbot.occasionDescription')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-sm font-medium text-foreground mb-1">{t('chatbot.budgetTitle')}</div>
                    <div className="text-xs text-muted-foreground">{t('chatbot.budgetDescription')}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="text-sm font-medium text-foreground mb-1">{t('chatbot.recipientTitle')}</div>
                    <div className="text-xs text-muted-foreground">{t('chatbot.recipientDescription')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className="text-xs text-muted-foreground mb-1 px-1">
                        {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                      </div>
                      <div
                        className={`inline-block p-4 rounded-2xl shadow-sm border ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-500/20'
                            : 'bg-background border-border/50 text-foreground'
                        } ${message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      >
                        <div className={`prose prose-sm max-w-none ${
                          message.role === 'user' ? 'prose-invert' : 'prose-neutral dark:prose-invert'
                        }`}>
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="group">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 px-1">AI Assistant</div>
                      <div className="inline-block p-4 rounded-2xl rounded-bl-md bg-background border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
          <div className="text-xs text-muted-foreground text-center mt-2">
            {t('chatbot.disclaimer')}
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
  );
};

export default Chatbot;