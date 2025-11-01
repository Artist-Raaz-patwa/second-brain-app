import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../../types';

const ChatModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
      const errorMessage: ChatMessage = { role: 'model', text: 'The AI Assistant is not available because the API Key is not configured.' };
      setMessages((prev) => [...prev, errorMessage]);
      setInput('');
      return;
    }
    setApiKeyMissing(false);

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: 'You are a helpful productivity assistant integrated into the SecondBrain app. Keep your responses concise and helpful.',
          },
        });
      }
      
      const response = await chatRef.current.sendMessage({ message: userMessage.text });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const BotIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1.5 6h3v-2h-3v2zm3-3h-3V9h3v2z"/></svg>;
  const UserIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto w-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-white/10 text-black dark:text-white'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.role === 'user' && <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex-shrink-0 flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 flex items-center justify-center"><BotIcon /></div>
              <div className="max-w-xl px-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/10 text-black dark:text-white">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-gray-500 dark:bg-white rounded-full animate-pulse"></span>
                  <span className="w-2.5 h-2.5 bg-gray-500 dark:bg-white rounded-full animate-pulse [animation-delay:0.2s]"></span>
                  <span className="w-2.5 h-2.5 bg-gray-500 dark:bg-white rounded-full animate-pulse [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        {apiKeyMissing ? (
            <div className="text-center text-sm text-red-500 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-500/10">
                AI Assistant is not available. An API Key needs to be configured by the administrator.
            </div>
        ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Send
            </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ChatModule;