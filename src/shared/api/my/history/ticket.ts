// src/shared/api/ticket/ticketApi.ts
import { api } from '@/shared/config/axios';
import type { TicketResponseDTO, TicketDetailResponseDTO } from '@/models/my/ticket/ticketTypes';

export const getTickets = async (): Promise<TicketResponseDTO[]> => {
  const { data } = await api.get('/ticket');
  if (data && typeof data === 'object') {
    if ('success' in data && data.success === true && 'data' in data) {
      return data.data as TicketResponseDTO[];
    }
    if (Array.isArray(data)) return data as TicketResponseDTO[];
  }
  throw new Error('Invalid ticket list response');
};

export const getTicketDetail = async (reservationNumber: string): Promise<TicketDetailResponseDTO> => {
  const { data } = await api.get('/ticket/detail', { params: { reservationNumber } });
  // 공통 SuccessResponse 래퍼 고려
  if (data && typeof data === 'object') {
    if ('success' in data && data.success === true && 'data' in data) {
      return data.data as TicketDetailResponseDTO;
    }
    return data as TicketDetailResponseDTO;
  }
  throw new Error('Invalid ticket detail response');
};

export const getTransferTickets = async (): Promise<TicketResponseDTO[]> => {
  const { data } = await api.get('/transfer/transferor');
  if (data && typeof data === 'object') {
    if ('success' in data && data.success === true && 'data' in data) {
      return data.data as TicketResponseDTO[];
    }
    if (Array.isArray(data)) return data as TicketResponseDTO[];
  }
  throw new Error('Invalid ticket list response');
};