export type TicketStatus = 
  | 'EN_ATTENTE' 
  | 'DIAGNOSTIC_EN_COURS' 
  | 'ATTENTE_VALIDATION' 
  | 'RESOLU' 
  | 'CLOTURE' 
  | 'ROUVERT';

export type TicketPriority = 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'BASSE';

export type ConfidentialityLevel = 
  | 'NOMINATIF' 
  | 'CONFIDENTIEL' 
  | 'ANONYME';

export type TicketCategory = 
  | 'Réseau et Internet'
  | 'Matériel informatique'
  | 'Logiciels et Systèmes'
  | 'Ressources Humaines'
  | 'Conditions de Travail'
  | 'Médiation & Relations';

export interface TimelineEvent {
  id: string;
  time: string;
  timestamp: string;
  title: string;
  description: string;
  author: string;
  authorRole?: string;
  type: 'creation' | 'assignment' | 'take_charge' | 'message' | 'resolution' | 'closure' | 'telemetry';
  hash?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: 'COLLABORATEUR' | 'RESPONSABLE' | 'SYSTEM';
  recipient?: string;
  content: string;
  timestamp: string;
  isInternalNote: boolean;
  attachments?: Attachment[];
}

export interface TelemetryData {
  switchName: string;
  status: 'online' | 'warning' | 'offline';
  port: string;
  attenuationDb: string;
  attenuationAnomaly: boolean;
  packetLoss: string;
  packetLossAnomaly: boolean;
  negotiatedSpeed: string;
  expectedSpeed: string;
}

export interface Ticket {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  confidentiality: ConfidentialityLevel;
  slaInfo: string;
  slaMinutesRemaining?: number;
  isCriticalSla?: boolean;
  
  // Requester
  requesterName?: string;
  requesterRole?: string;
  requesterDepartment?: string;
  requesterLocation?: string;
  requesterPhone?: string;
  requesterAvatar?: string;
  isAnonymous?: boolean;
  
  // Assignment
  assignedTo?: string;
  assignedToRole?: string;
  targetDepartment: string; // e.g. "Pôle Informatique & Infrastructure"
  
  // Dates
  createdAt: string;
  createdTimeAgo: string;
  timeElapsed: string;
  updatedAt: string;
  resolvedAt?: string;
  
  // Details
  telemetry?: TelemetryData;
  timeline: TimelineEvent[];
  messages: Message[];
  attachments: Attachment[];
  
  // Resolution details
  resolutionDetails?: {
    solution: string;
    actionsTaken: string;
    recommendations?: string;
    resolvedBy: string;
    resolvedAt: string;
  };
}

export interface ResponsibleUser {
  id: string;
  name: string;
  role: string;
  department: string;
  codeDepartment: string;
  clearanceLevel: string;
  avatar: string;
}

export interface OperationalMetrics {
  activeTickets: number;
  capacityRate: number;
  criticalSlaCount: number;
  criticalSlaItem?: string;
  averageResolutionHours: number;
  resolutionComparisonQuarter: string;
  satisfactionRate: number;
  satisfactionReviewsCount: number;
}
