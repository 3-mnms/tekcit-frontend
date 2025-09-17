// src/shared/ws/leave.ts
import SockJS from 'sockjs-client';
import { Client, type StompHeaders } from '@stomp/stompjs';

const WS_URL = 'http://localhost:10000/ws';

export type LeaveWaitingPayload = {
  festivalId: string;
  /** ISO string(KST라면 서버에서 변환), 없으면 생략 가능 */
  reservationDateIso?: string;
};

export type LeaveReservationPayload = {
  festivalId: string;
  reservationNumber?: string;
};

function fireAndForgetPublish(
  destination: string,
  body: object,
  token?: string
) {
  try {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL + (token ? `?token=Bearer ${token}` : '')),
      connectHeaders: token ? ({ Authorization: `Bearer ${token}` } satisfies StompHeaders) : undefined,
      debug: () => {},
      reconnectDelay: 0,
    });

    client.onConnect = () => {
      try {
        client.publish({ destination, body: JSON.stringify(body) });
      } finally {
        // 아주 짧게 텀을 주고 닫기
        setTimeout(() => {
          try { client.deactivate(); } catch {}
        }, 30);
      }
    };

    client.onStompError = () => { try { client.deactivate(); } catch {} };
    client.onWebSocketError = () => { try { client.deactivate(); } catch {} };

    client.activate();
  } catch {
    // no-op
  }
}

/** 현재 페이지에서 떠날 때 1회성 메시지 발행 */
export function sendLeaveMessage(
  kind: 'waiting' | 'reservation',
  payload: LeaveWaitingPayload | LeaveReservationPayload,
  opts?: { token?: string }
) {
  const path = kind === 'waiting'
    ? '/app/queue/waiting/leave'
    : '/app/queue/reservation/leave';
  fireAndForgetPublish(path, payload, opts?.token);
}
