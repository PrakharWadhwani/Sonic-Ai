'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

export function ChatInput({ onSend, disabled, suggestions = [] }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  const defaultSuggestions = [
    "I need headphones for long flights and Zoom meetings",
    "Best gaming headset under $300?",
    "I want earbuds for running with good ANC",
    "Compare the top 3 noise cancelling headphones",
  ];

  const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="space-y-3">
      {/* Quick Suggestions */}
      {input.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {activeSuggestions.map((suggestion, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSend(suggestion);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all duration-200 cursor-pointer"
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Input bar */}
      <motion.div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl border backdrop-blur-xl transition-all duration-300',
          'bg-white/80 dark:bg-gray-800/80',
          disabled ? 'border-gray-100 dark:border-gray-800 opacity-70' : 'border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/20 dark:shadow-black/20 hover:shadow-xl hover:shadow-gray-200/30 dark:hover:shadow-black/30',
          input.length > 0 && 'border-violet-200 dark:border-violet-500/30 shadow-violet-100/30 dark:shadow-violet-500/10'
        )}
      >
        <div className="flex items-center pl-4 pb-3 pt-3">
          <Sparkles className={cn(
            'w-4 h-4 transition-colors',
            input.length > 0 ? 'text-violet-400' : 'text-gray-300 dark:text-gray-600'
          )} />
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me about headphones..."
          rows={1}
          className="flex-1 py-3 pr-2 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
        />

        <div className="flex items-center gap-1 pr-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={cn(
              'p-2 rounded-xl transition-all duration-200',
              input.trim()
                ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
