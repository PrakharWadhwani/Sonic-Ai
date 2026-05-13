'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useStore } from '@/hooks/use-store';
import { Sparkles } from 'lucide-react';

export function ChatPanel() {
  const { messages, isThinking, handleUserMessage } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100/80 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20"
          >
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">SonicAI</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] text-gray-400">Your personal headphone advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="px-6 py-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i} isLatest={i === messages.length - 1} />
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          <AnimatePresence>
            {isThinking && <ThinkingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Sticky Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100/80 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl">
        <ChatInput
          onSend={handleUserMessage}
          disabled={isThinking}
        />
      </div>
    </div>
  );
}
