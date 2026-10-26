import { Ticket, OperationalMetrics, ResponsibleUser, Message, TimelineEvent } from '../types/ticket';

export function filterTickets(
  tickets: Ticket[],
  options: {
    search?: string;
    filterTab?: string;
    category?: string;
    priority?: string;
    status?: string;
    targetDepartment?: string;
  }
): Ticket[] {
  const { search = '', filterTab = 'all', category, priority, status, targetDepartment } = options;
  const query = search.trim().toLowerCase();

  return tickets.filter((ticket) => {
    // 1. Department scoping if specified
    if (targetDepartment && ticket.targetDepartment !== targetDepartment) {
      return false;
    }

    // 2. Search query matching
    if (query) {
      const matchRef = ticket.reference.toLowerCase().includes(query);
      const matchTitle = ticket.title.toLowerCase().includes(query);
      const matchDesc = ticket.description.toLowerCase().includes(query);
      const matchCat = ticket.category.toLowerCase().includes(query);
      const matchReq = (!ticket.isAnonymous && ticket.requesterName)
        ? ticket.requesterName.toLowerCase().includes(query)
        : false;
      const matchDept = ticket.requesterDepartment?.toLowerCase().includes(query) ?? false;
      const matchLoc = ticket.requesterLocation?.toLowerCase().includes(query) ?? false;
      
      if (!matchRef && !matchTitle && !matchDesc && !matchCat && !matchReq && !matchDept && !matchLoc) {
        return false;
      }
    }

    // 3. Workflow filter tabs
    if (filterTab === 'to_treat') {
      // À traiter: en attente ou rouvert
      if (ticket.status !== 'EN_ATTENTE' && ticket.status !== 'ROUVERT') {
        return false;
      }
    } else if (filterTab === 'in_progress') {
      // En cours: diagnostic ou attente validation
      if (ticket.status !== 'DIAGNOSTIC_EN_COURS' && ticket.status !== 'ATTENTE_VALIDATION') {
        return false;
      }
    } else if (filterTab === 'resolved') {
      // Résolus: résolu ou clôturé
      if (ticket.status !== 'RESOLU' && ticket.status !== 'CLOTURE') {
        return false;
      }
    } else if (filterTab === 'urgent') {
      // Urgents: priorité critique ou élevée
      if (ticket.priority !== 'CRITIQUE' && ticket.priority !== 'ELEVEE') {
        return false;
      }
    }

    // 4. Explicit category filter
    if (category && category !== 'ALL' && ticket.category !== category) {
      return false;
    }

    // 5. Explicit priority filter
    if (priority && priority !== 'ALL' && ticket.priority !== priority) {
      return false;
    }

    // 6. Explicit status filter
    if (status && status !== 'ALL' && ticket.status !== status) {
      return false;
    }

    return true;
  });
}

export function computeMetrics(tickets: Ticket[], targetDepartment?: string): OperationalMetrics {
  const scopedTickets = targetDepartment
    ? tickets.filter((t) => t.targetDepartment === targetDepartment)
    : tickets;

  const totalReceived = scopedTickets.length;
  const toTreat = scopedTickets.filter(
    (t) => t.status === 'EN_ATTENTE' || t.status === 'ROUVERT'
  ).length;
  const inProgress = scopedTickets.filter(
    (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolved = scopedTickets.filter(
    (t) => t.status === 'RESOLU' || t.status === 'CLOTURE'
  ).length;

  return {
    totalReceived,
    toTreat,
    inProgress,
    resolved,
    averageResolutionHours: 3.4,
  };
}

export function takeChargeTicket(ticket: Ticket, manager: ResponsibleUser): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const prevStatus = ticket.status;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: `Pris en charge par ${manager.name}`,
    description: `Attribution de la responsabilité opérationnelle au responsable de service.`,
    author: manager.name,
    authorRole: manager.role,
    type: 'take_charge',
    previousStatus: prevStatus,
    newStatus: 'DIAGNOSTIC_EN_COURS',
  };

  return {
    ...ticket,
    status: 'DIAGNOSTIC_EN_COURS',
    assignedTo: manager.name,
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
  const prevStatus = ticket.status;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Résolution opérationnelle proposée',
    description: `${solution} (Actions : ${actionsTaken})`,
    author: manager.name,
    authorRole: manager.role,
    type: 'resolution',
    previousStatus: prevStatus,
    newStatus: 'RESOLU',
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
  const prevStatus = ticket.status;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Clôture validée par le collaborateur',
    description: 'Le collaborateur a confirmé que le dysfonctionnement est résolu à son niveau.',
    author,
    type: 'closure',
    previousStatus: prevStatus,
    newStatus: 'CLOTURE',
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
  const prevStatus = ticket.status;

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: 'Signalement rouvert : Le problème persiste',
    description: reason || 'Le collaborateur indique que le problème persiste après test.',
    author: ticket.requesterName || 'Collaborateur',
    type: 'reopen',
    previousStatus: prevStatus,
    newStatus: 'ROUVERT',
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
    recipient: isInternalNote ? 'Équipe interne du service' : (ticket.requesterName || 'Collaborateur'),
    content,
    timestamp: timeStr,
    isInternalNote,
  };

  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    time: timeStr,
    timestamp: now.toISOString(),
    title: isInternalNote
      ? `Observation interne enregistrée`
      : `Message transmis à ${ticket.requesterName || 'Collaborateur'}`,
    description: content,
    author: sender.name,
    authorRole: sender.role,
    type: 'message',
  };

  return {
    ...ticket,
    messages: [...ticket.messages, newMessage],
    timeline: [newEvent, ...ticket.timeline],
    updatedAt: now.toISOString(),
  };
}
