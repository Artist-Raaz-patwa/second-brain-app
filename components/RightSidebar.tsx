import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../types';

interface RightSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
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
  const ShowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
  const HideIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

  return (
    <aside className={`
      fixed inset-y-0 right-0 z-30 w-full max-w-sm sm:max-w-xs
      md:relative md:w-auto md:max-w-none
      flex-shrink-0 bg-gray-50 dark:bg-black border-l border-gray-200 dark:border-white/10 
      flex flex-col transition-transform md:transition-all duration-300 ease-in-out
      ${isCollapsed ? 'translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 md:w-80'}
    `}>
      {isCollapsed ? (
        <div className="hidden md:flex items-center justify-center p-4 h-full">
          <button
            onClick={() => setIsCollapsed(false)}
            title="Show Assistant"
            className="h-12 w-12 flex items-center justify-center rounded-lg text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <ShowIcon />
          </button>
        </div>
      ) : (
        <>
          <header className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold tracking-tight whitespace-nowrap">AI Assistant</h2>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Hide Assistant"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <HideIcon />
            </button>
          </header>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 flex items-center justify-center"><BotIcon /></div>}
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-white/10 text-black dark:text-white'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex-shrink-0 flex items-center justify-center"><UserIcon /></div>}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 flex items-center justify-center"><BotIcon /></div>
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-black dark:text-white">
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-gray-500 dark:bg-white rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-gray-500 dark:bg-white rounded-full animate-pulse delay-75"></span>
                      <span className="w-2 h-2 bg-gray-500 dark:bg-white rounded-full animate-pulse delay-150"></span>
                    </div>
                  </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-white/10">
            {apiKeyMissing ? (
              <div className="text-center text-xs text-red-500 dark:text-red-400 p-2 rounded-md bg-red-50 dark:bg-red-500/10">
                AI Assistant not available. API Key is missing.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="flex-1 bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </aside>
  );
};

export default RightSidebar;