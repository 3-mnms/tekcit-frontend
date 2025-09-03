// src/models/ticket/ticketTypes.ts
export type ReservationStatus = 'CONFIRMED' | 'CANCELED' | 'TEMP_RESERVED' | 'PAYMENT_IN_PROGRESS';

export type TicketResponseDTO = {
  id: number;
  reservationNumber: string;        
  performanceDate: string;        
  selectedTicketCount: number; 
  deliveryMethod: 'MOBILE' | 'PAPER';   
  reservationDate: string;        
  reservationStatus: ReservationStatus;
  posterFile: string;
  festivalId: string;
  fname: string;   
  fcltynm: string;  
};

export type TicketListItem = {
  id: number;
  date: string;      
  number: string;  
  title: string;    
  dateTime: string;    
  count: number;      
  statusLabel: string;   
  rawStatus: ReservationStatus;
  reservationNumber: string;
  posterFile: string;
  festivalId: string;
};

export type TicketType = 'MOBILE' | 'PAPER';

export type TicketDetailResponseDTO = {
  id: number;
  reservationNumber: string;   
  performanceDate: string;  
  deliveryMethod: TicketType;
  qrId: string[];
  address?: string | null;    
  posterFile: string;
  festivalId: string;
  fname: string;              
  fcltynm: string;           
};
