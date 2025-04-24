import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseChatSocketOptions {
  token: string | null;
  chatId: string | null;
  onReceiveMessage?: (message: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  enabled?: boolean;
}

export function useChatSocket({
  token,
  chatId,
  onReceiveMessage,
  onUserJoined,
  onUserLeft,
  enabled = true
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const prevChatId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !token) return;
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        auth: { token },
        withCredentials: true,
      });
      socketRef.current.on('receive_message', payload => {
        onReceiveMessage?.(payload.message);
      });
      socketRef.current.on('user_joined', data => {
        onUserJoined?.(data);
      });
      socketRef.current.on('user_left', data => {
        onUserLeft?.(data);
      });
      socketRef.current.on('error', err => {
        console.error('Socket error:', err);
      });
    }
    if (chatId && prevChatId.current !== chatId) {
      if (prevChatId.current) {
        socketRef.current.emit('leave_chat', { chat_id: prevChatId.current });
      }
      socketRef.current.emit('join_chat', { chat_id: chatId });
      prevChatId.current = chatId;
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, chatId, enabled]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('send_message', { chat_id: chatId, content });
  }, [chatId]);

  return { sendMessage };
}
