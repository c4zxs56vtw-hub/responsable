import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTickets,
  computeMetrics,
  takeChargeTicket,
  proposeResolution,
  confirmClosure,
  reopenTicket,
  addMessage,
} from './ticket-logic';
import { Ticket, ResponsibleUser } from '../types/ticket';

const dummyUser: ResponsibleUser = {
  id: 'usr-1',
  name: 'Sophie Dubois',
  role: 'Responsable Informatique',
  department: 'Pôle Informatique et Infrastructure',
  codeDepartment: 'REF-IT-DIR-402',
  clearanceLevel: 'Habilité Système & Réseau',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
};

const dummyTickets: Ticket[] = [
  {
    id: 't-1',
    reference: '#EC-2024-0902',
    title: 'Panne du switch réseau principal étage 3',
    description: 'Perte totale d’accès aux serveurs de fichiers locaux et passerelle VoIP.',
    category: 'Réseau et Internet',
    priority: 'CRITIQUE',
    status: 'EN_ATTENTE',
    confidentiality: 'NOMINATIF',
    slaInfo: 'Critique • SLA 45m',
    isCriticalSla: true,
    assignedTo: '',
    targetDepartment: 'Pôle Informatique et Infrastructure',
    createdAt: '2026-10-24T10:00:00.000Z',
    createdTimeAgo: 'Il y a 22 min',
    timeElapsed: '22m',
    updatedAt: '2026-10-24T10:00:00.000Z',
    timeline: [],
    messages: [],
    attachments: [],
  },
  {
    id: 't-2',
    reference: '#EC-2024-0891',
    title: 'Connexion instable et déconnexions (Compta Bureau 204)',
    description: 'Coupures répétées lors des transferts de bilans sous SAP.',
    category: 'Réseau et Internet',
    priority: 'ELEVEE',
    status: 'DIAGNOSTIC_EN_COURS',
    confidentiality: 'NOMINATIF',
    slaInfo: 'SLA Standard (4h max)',
    requesterName: 'Paul Martin',
    requesterDepartment: 'Comptabilité Générale',
    requesterLocation: 'Bâtiment B — Bureau 204',
    assignedTo: 'Sophie Dubois',
    targetDepartment: 'Pôle Informatique et Infrastructure',
    createdAt: '2026-10-24T10:14:00.000Z',
    createdTimeAgo: 'Depuis 2h',
    timeElapsed: '2h 18m',
    updatedAt: '2026-10-24T10:30:00.000Z',
    timeline: [],
    messages: [],
    attachments: [],
  },
  {
    id: 't-3',
    reference: '#EC-2026-004',
    title: 'Difficulté d’accès au logiciel de gestion',
    description: 'Problème de licence ERP',
    category: 'Logiciels et Systèmes',
    priority: 'MOYENNE',
    status: 'RESOLU',
    confidentiality: 'NOMINATIF',
    slaInfo: 'Résolu',
    assignedTo: 'Marc L.',
    targetDepartment: 'Pôle Informatique et Infrastructure',
    createdAt: '2026-10-23T08:00:00.000Z',
    createdTimeAgo: 'Hier',
    timeElapsed: '1j',
    updatedAt: '2026-10-23T14:00:00.000Z',
    timeline: [],
    messages: [],
    attachments: [],
  },
  {
    id: 't-4',
    reference: '#EC-2026-008',
    title: 'Ordinateur qui ne démarre plus',
    description: 'Écran noir persistant',
    category: 'Matériel informatique',
    priority: 'MOYENNE',
    status: 'ROUVERT',
    confidentiality: 'NOMINATIF',
    slaInfo: 'Rouvert',
    assignedTo: 'Sophie Dubois',
    targetDepartment: 'Pôle Informatique et Infrastructure',
    createdAt: '2026-10-24T08:00:00.000Z',
    createdTimeAgo: 'Il y a 3h',
    timeElapsed: '3h',
    updatedAt: '2026-10-24T11:00:00.000Z',
    timeline: [],
    messages: [],
    attachments: [],
  },
];

test('computeMetrics calculates exact 4 indicators (received, toTreat, inProgress, resolved)', () => {
  const metrics = computeMetrics(dummyTickets);
  assert.equal(metrics.totalReceived, 4);
  assert.equal(metrics.toTreat, 2); // t-1 (EN_ATTENTE) + t-4 (ROUVERT)
  assert.equal(metrics.inProgress, 1); // t-2 (DIAGNOSTIC_EN_COURS)
  assert.equal(metrics.resolved, 1); // t-3 (RESOLU)
});

test('filterTickets by workflow tabs (to_treat, in_progress, resolved)', () => {
  const toTreat = filterTickets(dummyTickets, { filterTab: 'to_treat' });
  assert.equal(toTreat.length, 2);
  assert.ok(toTreat.some((t) => t.id === 't-1'));
  assert.ok(toTreat.some((t) => t.id === 't-4'));

  const inProgress = filterTickets(dummyTickets, { filterTab: 'in_progress' });
  assert.equal(inProgress.length, 1);
  assert.equal(inProgress[0].id, 't-2');

  const resolved = filterTickets(dummyTickets, { filterTab: 'resolved' });
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].id, 't-3');
});

test('takeChargeTicket assigns manager and updates status to DIAGNOSTIC_EN_COURS', () => {
  const unassignedTicket = dummyTickets[0];
  const updated = takeChargeTicket(unassignedTicket, dummyUser);

  assert.equal(updated.status, 'DIAGNOSTIC_EN_COURS');
  assert.equal(updated.assignedTo, 'Sophie Dubois');
  assert.equal(updated.timeline.length, 1);
  assert.equal(updated.timeline[0].previousStatus, 'EN_ATTENTE');
  assert.equal(updated.timeline[0].newStatus, 'DIAGNOSTIC_EN_COURS');
});

test('proposeResolution updates status to RESOLU and logs resolution details', () => {
  const inProgressTicket = dummyTickets[1];
  const resolved = proposeResolution(
    inProgressTicket,
    'Remplacement de la prise murale RJ45 effectué',
    'Panneau de brassage repassé au testeur de câble',
    'Prévoir audit préventif de l’étage B',
    dummyUser
  );

  assert.equal(resolved.status, 'RESOLU');
  assert.equal(resolved.resolutionDetails?.solution, 'Remplacement de la prise murale RJ45 effectué');
  assert.equal(resolved.timeline[0].newStatus, 'RESOLU');
});

test('confirmClosure updates status to CLOTURE', () => {
  const inProgressTicket = dummyTickets[1];
  const closed = confirmClosure(inProgressTicket, 'Paul Martin');
  assert.equal(closed.status, 'CLOTURE');
  assert.equal(closed.timeline[0].newStatus, 'CLOTURE');
});

test('reopenTicket updates status to ROUVERT', () => {
  const inProgressTicket = dummyTickets[1];
  const reopened = reopenTicket(inProgressTicket, 'Micro-coupures revenues à 14h');
  assert.equal(reopened.status, 'ROUVERT');
  assert.equal(reopened.timeline[0].newStatus, 'ROUVERT');
});
