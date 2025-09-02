// src/models/waiting/tanstack-query/useWaitingSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
// ⚠️ Vite + sockjs-client에서 global 참조 이슈가 있어 dist 경로 권장
import SockJS from 'sockjs-client/dist/sockjs.js';

export type WaitingSocketOptions = {
  /** 예: import.meta.env.VITE_WS_ENDPOINT || '/ws' */
  wsEndpoint: string;
  /** 서버 publish topic. 예: `/topic/waiting/${festivalId}/${reservationDate}/${userId?}` */
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
  /** 자동 재접속 간격(ms). 0 또는 undefined이면 비활성화 */
  reconnectDelay?: number;
  /**
   * SockJS 사용 여부 (기본 true)
   * - Spring에서 withSockJS() 사용 시 true
   * - 순수 WebSocket(brokerURL)만 사용할 땐 false로 두고 wsEndpoint에 ws://... 입력
   */
  useSockJS?: boolean;
};

/**
 * Vite 환경에서 sockjs-client가 window.global을 기대할 수 있으니
 * 필요 시 엔트리에서 `(window as any).global = window` 한 줄을 추가해도 됨.
 */
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
    reconnectDelay = 5000,
    useSockJS = true,
  } = opt;

  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current?.active) return;

    const client = new Client({
      // SockJS 사용 시
      ...(useSockJS
        ? {
            webSocketFactory: () => new SockJS(wsEndpoint),
          }
        : {
            // 순수 WebSocket 사용 시 (예: ws://host:port/ws)
            brokerURL: wsEndpoint,
          }),
      connectHeaders,
      debug: debug ? (str) => console.log('[STOMP]', str) : undefined,
      reconnectDelay: reconnectDelay && reconnectDelay > 0 ? reconnectDelay : 0,
      onConnect: () => setConnected(true),
      onStompError: (frame) => {
        console.error('[STOMP ERROR]', frame.headers['message'], frame.body);
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
  }, [wsEndpoint, connectHeaders, debug, reconnectDelay, useSockJS]);

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

    // 1) 서버 측 MessageMapping에 최초 구독 트리거 보내기 (헤더로 식별값 전달)
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
) => (userId ? `${base}/${festivalId}/${reservationDateISO}/${userId}` : `${base}/${festivalId}/${reservationDateISO}`);
