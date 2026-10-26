import { Ticket, TicketStatus, OperationalMetrics, ResponsibleUser, Message, TimelineEvent } from '../types/ticket';

export function filterTickets(
  tickets: Ticket[],
  options: {
    search?: string;
    filterTab?: string;
    category?: string;
    priority?: string;
    status?: string;
  }
): Ticket[] {
  const { search = '', filterTab = 'all', category, priority, status } = options;
  const query = search.trim().toLowerCase();

  return tickets.filter((ticket) => {
    // Search query matching
    if (query) {
      const matchRef = ticket.reference.toLowerCase().includes(query);
      const matchTitle = ticket.title.toLowerCase().includes(query);
      const matchDesc = ticket.description.toLowerCase().includes(query);
      const matchReq = ticket.requesterName?.toLowerCase().includes(query) ?? false;
      const matchDept = ticket.requesterDepartment?.toLowerCase().includes(query) ?? false;
      const matchLoc = ticket.requesterLocation?.toLowerCase().includes(query) ?? false;
      if (!matchRef && !matchTitle && !matchDesc && !matchReq && !matchDept && !matchLoc) {
        return false;
      }
    }

    // Quick filter tabs matching
    if (filterTab === 'unassigned') {
      if (ticket.assignedTo && ticket.assignedTo.trim().length > 0) return false;
    } else if (filterTab === 'urgent') {
      if (ticket.priority !== 'CRITIQUE' && !ticket.isCriticalSla && ticket.priority !== 'ELEVEE') {
        return false;
      }
    } else if (filterTab === 'pending') {
      if (ticket.status !== 'EN_ATTENTE' && ticket.status !== 'ATTENTE_VALIDATION') {
        return false;
      }
    } else if (filterTab === 'in_progress') {
      if (ticket.status !== 'DIAGNOSTIC_EN_COURS' && ticket.status !== 'ROUVERT') {
        return false;
      }
    } else if (filterTab === 'resolved') {
      if (ticket.status !== 'RESOLU' && ticket.status !== 'CLOTURE') {
        return false;
      }
    }

    // Explicit category filter
    if (category && category !== 'ALL' && ticket.category !== category) {
      return false;
    }

    // Explicit priority filter
    if (priority && priority !== 'ALL' && ticket.priority !== priority) {
      return false;
    }

    // Explicit status filter
    if (status && status !== 'ALL' && ticket.status !== status) {
      return false;
    }

    return true;
  });
}

export function computeMetrics(tickets: Ticket[]): OperationalMetrics {
  const activeTickets = tickets.filter(
    (t) => t.status !== 'CLOTURE' && t.status !== 'RESOLU'
  ).length;

  const criticalSlaTickets = tickets.filter(
    (t) => (t.priority === 'CRITIQUE' || t.isCriticalSla) && t.status !== 'CLOTURE' && t.status !== 'RESOLU'
  );

  const criticalSlaCount = criticalSlaTickets.length;
  const criticalSlaItem = criticalSlaTickets.length > 0
    ? criticalSlaTickets[0].title.replace(/\(.*\)/, '').trim()
    : undefined;

  return {
    activeTickets,
    capacityRate: Math.min(100, Math.round((activeTickets / 11) * 100)),
    criticalSlaCount,
    criticalSlaItem,
    averageResolutionHours: 3.4,
    resolutionComparisonQuarter: '-18% vs moyenne trimestrielle',
    satisfactionRate: 98,
    satisfactionReviewsCount: 54,
  };
}

export function generateAuditHash(): string {
  const chars = '0123456789ABCDEF';
  let hash = '';
  for (let i = 0; i < 12; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `#${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
}

export function takeChargeTicket(ticket: Ticket, manager: ResponsibleUser): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: `Pris en charge par ${manager.name}`,
    description: `Attribution de la responsabilité opérationnelle. Évaluation de la priorité : ${ticket.priority}.`,
    author: manager.name,
    authorRole: manager.role,
    type: 'take_charge',
    hash: generateAuditHash(),
  };

  return {
    ...ticket,
    status: 'DIAGNOSTIC_EN_COURS',
    assignedTo: `${manager.name} (Vous)`,
    assignedToRole: manager.role,
    updatedAt: now.toISOString(),
    timeline: [newEvent, ...ticket.timeline],
  };
}

export function proposeResolution(
  ticket: Ticket,
  solution: string,
  actionsTaken: string,
  recommendations: string,
  manager: ResponsibleUser
): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Résolution opérationnelle proposée',
    description: `${solution} (Actions : ${actionsTaken})`,
    author: manager.name,
    authorRole: manager.role,
    type: 'resolution',
    hash: generateAuditHash(),
  };

  return {
    ...ticket,
    status: 'RESOLU',
    resolvedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolutionDetails: {
      solution,
      actionsTaken,
      recommendations: recommendations || undefined,
      resolvedBy: manager.name,
      resolvedAt: now.toISOString(),
    },
    timeline: [newEvent, ...ticket.timeline],
  };
}

export function confirmClosure(ticket: Ticket, employeeName?: string): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const author = employeeName || ticket.requesterName || 'Collaborateur';

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Clôture validée par le collaborateur',
    description: 'Le collaborateur a certifié que le dysfonctionnement est résolu à son niveau.',
    author,
    type: 'closure',
    hash: generateAuditHash(),
  };

  return {
    ...ticket,
    status: 'CLOTURE',
    updatedAt: now.toISOString(),
    timeline: [newEvent, ...ticket.timeline],
  };
}

export function reopenTicket(ticket: Ticket, reason: string): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Signalement rouvert : Persistance signalée',
    description: reason || 'Le collaborateur indique que le problème persiste après test.',
    author: ticket.requesterName || 'Collaborateur',
    type: 'take_charge',
    hash: generateAuditHash(),
  };

  return {
    ...ticket,
    status: 'ROUVERT',
    updatedAt: now.toISOString(),
    timeline: [newEvent, ...ticket.timeline],
  };
}

export function addMessage(
  ticket: Ticket,
  content: string,
  isInternalNote: boolean,
  sender: ResponsibleUser
): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    sender: sender.name,
    senderRole: 'RESPONSABLE',
    recipient: isInternalNote ? 'Collège Technique DSI' : (ticket.requesterName || 'Collaborateur'),
    content,
    timestamp: timeStr,
    isInternalNote,
  };

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: isInternalNote
      ? `Note technique confidentielle ajoutée`
      : `Message transmis à ${ticket.requesterName || 'Collaborateur'}`,
    description: content,
    author: sender.name,
    authorRole: sender.role,
    type: 'message',
    hash: generateAuditHash(),
  };

  return {
    ...ticket,
    messages: [...ticket.messages, newMessage],
    timeline: [newEvent, ...ticket.timeline],
    updatedAt: now.toISOString(),
  };
}
