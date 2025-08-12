import { motion } from "framer-motion";
import { PaperPlaneTilt, Robot, User } from "phosphor-react";
import React, { useState, useRef, useEffect } from "react";

import { PageTransition } from "../components/Transitions/PageTransition";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { sendChatMessage } from "../services/api";

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Welcome to Codie AI Chat! Ask me anything about your code.",
      timestamp: new Date(),
      isUser: false,
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: messageText,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call Gemini API
      const response = await sendChatMessage({
        message: messageText,
        context: "This is a code analysis chat session."
      });

      const aiResponse: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: response.response,
        timestamp: new Date(),
        isUser: false,
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: "Sorry, I'm having trouble responding right now. Please check that your Gemini API key is configured and try again.",
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Header Section */}
        <div className="text-center fade-in">
          <nav aria-label="AI Chat" className="mb-2">
            <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
          </nav>
          <p className="text-muted-foreground">
            Chat with AI about your code and get instant help
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-96 flex flex-col card-elevate fade-in">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                style={{ '--i': index } as React.CSSProperties}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!message.isUser && (
                      <Robot className="text-lg mt-1 flex-shrink-0" />
                    )}
                    {message.isUser && (
                      <User className="text-lg mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.text}
                      </p>
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start fade-in"
              >
                <div className="bg-muted px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Robot className="text-lg" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your code..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                leftIcon={<PaperPlaneTilt />}
                loading={isLoading}
                className="btn-anim"
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
