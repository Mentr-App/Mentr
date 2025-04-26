import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseChatSocketOptions {
  token: string | null;
  chatId: string | null;
  onReceiveMessage?: (message: any) => void;
  onEditReceived?: (message: any) => void;
  onDeleteReceived?: (message: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  enabled?: boolean;
}

export function useChatSocket({
  token,
  chatId,
  onReceiveMessage,
  onEditReceived,
  onDeleteReceived,
  onUserJoined,
  onUserLeft,
  enabled = true
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const prevChatId = useRef<string | null>(null);

  // Connect/disconnect socket
  useEffect(() => {
    if (!enabled || !token) return;
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:8000', {
        transports: ['websocket'],
        auth: { token },
        withCredentials: true,
      });
      socketRef.current.on('receive_message', payload => {
        console.log('Received message from socket:', payload);
        onReceiveMessage?.(payload.message);
      });
      socketRef.current.on('user_joined', data => {
        onUserJoined?.(data);
      });
      socketRef.current.on('user_left', data => {
        onUserLeft?.(data);
      });
      socketRef.current.on('receive_edit_message', payload => {
        console.log("Message edited from socket:", payload);
        onEditReceived?.(payload.message)
      });
      socketRef.current.on('receive_delete_message', payload => {
        console.log("Message deleted from socket:", payload);
        onDeleteReceived?.(payload.message_id)
      })
      socketRef.current.on('error', err => {
        console.error('Socket error:', err);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, enabled]);

  // Handle joining/leaving rooms when chatId changes
  useEffect(() => {
    if (!socketRef.current) return;
    // Leave previous room if needed
    if (prevChatId.current && prevChatId.current !== chatId) {
      socketRef.current.emit('leave_chat', { chat_id: prevChatId.current, token });
    }
    // Join new room if valid chatId
    if (chatId) {
      socketRef.current.emit('join_chat', { chat_id: chatId, token });
    }
    prevChatId.current = chatId;
  }, [chatId, token]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('send_message', { chat_id: chatId, content, token });
  }, [chatId, token]);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socketRef.current || !chatId || !messageId || !content) return;
    console.log(`Emitting edit_message for messageId: ${messageId}`);
    socketRef.current.emit('edit_message', { chat_id: chatId, message_id: messageId, content, token });
  }, [chatId, token])

  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current || !chatId || !messageId) return;
    console.log(`Emitting delete_message for messageId: ${messageId}`);
    socketRef.current.emit('delete_message', { chat_id: chatId, message_id: messageId, token });
  }, [chatId, token])

  return { sendMessage, editMessage, deleteMessage };
}
