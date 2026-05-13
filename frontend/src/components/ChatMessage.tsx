'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';
import { Message } from '@/store/app-store';

interface ChatMessageProps {
  message: Message;
  index: number;
  isLatest?: boolean;
}

export function ChatMessage({ message, index, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [displayedText, setDisplayedText] = useState(
    isUser || !isLatest ? message.content : ''
  );
  const [isStreaming, setIsStreaming] = useState(!isUser && isLatest);
  const streamRef = useRef<NodeJS.Timeout | null>(null);

  // Streaming text effect for AI messages
  useEffect(() => {
    if (!isUser && isLatest && displayedText.length < message.content.length) {
      const chars = message.content;
      let i = displayedText.length;
      const speed = Math.max(8, 20 - Math.floor(chars.length / 50)); // Adaptive speed

      streamRef.current = setInterval(() => {
        i += Math.floor(Math.random() * 3) + 1; // Random chunk size for natural feel
        if (i >= chars.length) {
          i = chars.length;
          setIsStreaming(false);
          if (streamRef.current) clearInterval(streamRef.current);
        }
        setDisplayedText(chars.slice(0, i));
      }, speed);

      return () => {
        if (streamRef.current) clearInterval(streamRef.current);
      };
    } else if (!isUser && !isLatest) {
      setDisplayedText(message.content);
      setIsStreaming(false);
    }
  }, [message.content, isLatest, isUser]);

  // Format time client-side only to avoid hydration mismatch
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    setTimeStr(
      message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }, [message.timestamp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex gap-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.05 + 0.1 }}
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1',
          isUser
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white'
            : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </motion.div>

      {/* Message bubble */}
      <div className={cn(
        'max-w-[80%] space-y-1',
        isUser ? 'items-end' : 'items-start'
      )}>
        <span className={cn(
          'text-xs font-medium',
          isUser ? 'text-gray-400 text-right block' : 'text-violet-500'
        )}>
          {isUser ? 'You' : 'SonicAI'}
        </span>
        <motion.div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-gray-900 dark:bg-violet-600 text-white rounded-tr-md'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-md shadow-sm backdrop-blur-sm'
          )}
        >
          <MessageContent content={displayedText} />
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle rounded-full"
            />
          )}
        </motion.div>
        {timeStr && (
          <span className="text-[10px] text-gray-300 dark:text-gray-600 px-1">{timeStr}</span>
        )}
      </div>
    </motion.div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Parse bold, bullet points, and line breaks
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        // Handle line breaks and bullet points
        return part.split('\n').map((line, j) => (
          <span key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line.startsWith('• ') ? (
              <span className="flex items-start gap-1.5 mt-1">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>{line.slice(2)}</span>
              </span>
            ) : (
              line
            )}
          </span>
        ));
      })}
    </span>
  );
}
