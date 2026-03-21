"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import StrikerAnalytics from "./analytics/StrikerAnalytics";
import MidfielderAnalytics from "./analytics/MidfielderAnalytics";
import DefenderAnalytics from "./analytics/DefenderAnalytics";
import GoalkeeperAnalytics from "./analytics/GoalkeeperAnalytics";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Player {
  id: string;
  name: string;
  position: string | null;
  age: number | null;
  team: string;
  goals: number;
  assists: number;
  matches: number;
  nationality: string | null;
  imageUrl?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'players' | 'analytics';
  players?: Player[];
  playerName?: string;
  analyticsType?: 'striker' | 'midfielder' | 'defender' | 'goalkeeper';
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function AIChat({ isOpen, onClose, initialQuery }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(text?: string) {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        type: data.type || 'text',
        players: data.players,
        playerName: data.playerName,
        analyticsType: data.analyticsType
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Background with backdrop blur */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/background/background3.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          </div>

          {/* Chat Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`${dmSans.variable} font-sans relative w-full max-w-4xl h-[80vh] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">Boxy: Your AI Recruiting Assistant</h2>
                <p className="text-sm text-white/60 mt-1">Ask me to find the perfect player for your team!</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-white/40 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-lg mb-2">How can I help you find players today?</p>
                  <p className="text-white/40 text-sm">Try: "Find me a fast striker with good finishing"</p>
                </div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#5B8DB8] text-white">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-[90%] w-full">
                      {message.content && (
                        <div className="bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl px-4 py-3 mb-3">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}

                      {/* Render player cards */}
                      {message.type === 'players' && message.players && message.players.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                          {message.players.map((player) => (
                            <Link
                              key={player.id}
                              href={`/player/${player.id}`}
                              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {/* Player Image */}
                                {player.imageUrl ? (
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
                                    <Image
                                      src={player.imageUrl}
                                      alt={player.name}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-white/10 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg font-bold">
                                      {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                  </div>
                                )}

                                {/* Player Info */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <h4 className="font-bold text-white text-lg">{player.name}</h4>
                                      <p className="text-white/60 text-sm">{player.team}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-white/80 text-sm font-semibold">{player.position || 'N/A'}</div>
                                      <div className="text-white/60 text-xs">{player.age}y</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-4">
                                    <div>
                                      <div className="text-white/60 text-xs">Goals</div>
                                      <div className="text-white font-bold">{player.goals || 0}</div>
                                    </div>
                                    <div>
                                      <div className="text-white/60 text-xs">Assists</div>
                                      <div className="text-white font-bold">{player.assists || 0}</div>
                                    </div>
                                    <div>
                                      <div className="text-white/60 text-xs">Matches</div>
                                      <div className="text-white font-bold">{player.matches || 0}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Render analytics */}
                      {message.type === 'analytics' && message.analyticsType && (
                        <div className="bg-white rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">{message.playerName} Analytics</h3>
                          {message.analyticsType === 'striker' && <StrikerAnalytics />}
                          {message.analyticsType === 'midfielder' && <MidfielderAnalytics />}
                          {message.analyticsType === 'defender' && <DefenderAnalytics />}
                          {message.analyticsType === 'goalkeeper' && <GoalkeeperAnalytics />}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-white/60">Searching...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="Describe your ideal player..."
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 text-white placeholder-white/40 outline-none focus:border-[#5B8DB8] transition-colors"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-6 py-3 bg-[#5B8DB8] text-white rounded-xl font-semibold hover:bg-[#4a7a9f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
