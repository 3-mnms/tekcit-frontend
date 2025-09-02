// models/waiting/tanstack-query/useWaitingSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type WaitingSocketOptions = {
  /** e.g. import.meta.env.VITE_WS_ENDPOINT || '/ws' */
  wsEndpoint: string;
  /** 서버 publish topic. 예: `/topic/waiting/${festivalId}/${reservationDate}/${userId}` */
  topic: string;
  /** 서버 @MessageMapping 처리 경로(초기 구독 트리거) */
  appSubscribeDestination?: string; // default: '/app/subscribe/waiting'
  /** 구독 파라미터 */
  festivalId: string;
  reservationDate: string; // ISO string
  /** 인증 헤더 필요 시 */
  connectHeaders?: Record<string, string>;
  /** 메시지 수신 */
  onMessage?: (msg: IMessage) => void;
  /** 콘솔 디버그 로그 */
  debug?: boolean;
};

export const useWaitingSocket = (opt: WaitingSocketOptions) => {
  const {
    wsEndpoint,
    topic,
    appSubscribeDestination = '/app/subscribe/waiting',
    festivalId,
    reservationDate,
    connectHeaders,
    onMessage,
    debug,
  } = opt;

  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsEndpoint),
      connectHeaders,
      debug: debug ? (str) => console.log('[STOMP]', str) : undefined,
      onConnect: () => setConnected(true),
      onStompError: (frame) => {
        console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
  }, [wsEndpoint, connectHeaders, debug]);

  const disconnect = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;
    try {
      client.deactivate();
    } finally {
      clientRef.current = null;
      setConnected(false);
      setSubscribed(false);
    }
  }, []);

  const subscribe = useCallback(() => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

    // 1) 서버 측 MessageMapping에 최초 구독 트리거 보내기
    client.publish({
      destination: appSubscribeDestination,
      headers: { festivalId, reservationDate },
    });

    // 2) 서버 publish topic 구독
    const sub = client.subscribe(topic, (message) => onMessage?.(message));
    setSubscribed(true);

    return () => sub.unsubscribe();
  }, [festivalId, reservationDate, appSubscribeDestination, topic, onMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (!connected) return;
    const unsub = subscribe();
    return () => unsub?.();
  }, [connected, subscribe]);

  return { connected, subscribed, disconnect };
};

// (선택) 토픽 유틸: 서버 규칙에 맞춰 필요한 경우 사용하세요.
export const buildWaitingTopic = (
  base: string, // e.g. '/topic/waiting'
  festivalId: string,
  reservationDateISO: string,
  userId?: string
) => (userId ? `${base}/${festivalId}/${reservationDateISO}/${userId}` 
             : `${base}/${festivalId}/${reservationDateISO}`);
