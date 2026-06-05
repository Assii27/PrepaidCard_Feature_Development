export type CardStatus = 'DRAFT' | 'INACTIVE' | 'ACTIVE' | 'BLOCKED' | 'EXPIRED';

export interface Card {
  id: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  pin: string;
  balance: number;
  status: CardStatus;
  customerId: string;
  customerName: string;
  customerKycStatus: 'PENDING' | 'APPROVED' | 'FAILED';
  pinGenerated: boolean;
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  merchant: string;
  type: 'POS' | 'ATM' | 'E-COMMERCE';
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'FAILED';
  failureReason?: string;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  source: 'CLIENT' | 'API_GATEWAY' | 'CMS' | 'AUTH_SERVICE' | 'HSM' | 'DATABASE' | 'KAFKA' | 'SMS_SERVICE' | 'CLEARING_SERVICE' | 'REPORTS_SERVICE' | 'SETTLEMENT';
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  payload?: any;
}

export interface LifecyclePhase {
  id: number;
  title: string;
  techKeywords: string[];
  description: string;
  apiEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    payload?: string;
    response?: string;
  }[];
  dbTables: {
    tableName: string;
    columns: { name: string; type: string; desc: string }[];
  }[];
  interviewSnippet: string;
  commonQuestions: { q: string; a: string }[];
}
