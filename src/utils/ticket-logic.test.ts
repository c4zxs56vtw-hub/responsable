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
  department: 'Pôle Informatique & Infrastructure',
  codeDepartment: 'REF-IT-DIR-402',
  clearanceLevel: 'Niveau 3 — Habilité RH/DSI',
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
    targetDepartment: 'Pôle Informatique & Infrastructure',
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
    assignedTo: 'Sophie Dubois (Vous)',
    targetDepartment: 'Pôle Informatique & Infrastructure',
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
    targetDepartment: 'Pôle Informatique & Infrastructure',
    createdAt: '2026-10-23T08:00:00.000Z',
    createdTimeAgo: 'Hier',
    timeElapsed: '1j',
    updatedAt: '2026-10-23T14:00:00.000Z',
    timeline: [],
    messages: [],
    attachments: [],
  },
];

test('filterTickets by search query', () => {
  const result = filterTickets(dummyTickets, { search: 'switch' });
  assert.equal(result.length, 1);
  assert.equal(result[0].reference, '#EC-2024-0902');

  const refResult = filterTickets(dummyTickets, { search: '0891' });
  assert.equal(refResult.length, 1);
  assert.equal(refResult[0].requesterName, 'Paul Martin');
});

test('filterTickets by tab', () => {
  const unassigned = filterTickets(dummyTickets, { filterTab: 'unassigned' });
  assert.equal(unassigned.length, 1);
  assert.equal(unassigned[0].reference, '#EC-2024-0902');

  const urgent = filterTickets(dummyTickets, { filterTab: 'urgent' });
  assert.equal(urgent.length, 2);

  const inProgress = filterTickets(dummyTickets, { filterTab: 'in_progress' });
  assert.equal(inProgress.length, 1);
  assert.equal(inProgress[0].reference, '#EC-2024-0891');

  const resolved = filterTickets(dummyTickets, { filterTab: 'resolved' });
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].reference, '#EC-2026-004');
});

test('computeMetrics calculates active tickets and critical SLAs correctly', () => {
  const metrics = computeMetrics(dummyTickets);
  assert.equal(metrics.activeTickets, 2);
  assert.equal(metrics.criticalSlaCount, 1);
  assert.ok(metrics.criticalSlaItem?.includes('Panne du switch'));
  assert.equal(metrics.satisfactionRate, 98);
});

test('takeChargeTicket assigns manager and updates status to DIAGNOSTIC_EN_COURS', () => {
  const unassignedTicket = dummyTickets[0];
  const updated = takeChargeTicket(unassignedTicket, dummyUser);

  assert.equal(updated.status, 'DIAGNOSTIC_EN_COURS');
  assert.equal(updated.assignedTo, 'Sophie Dubois (Vous)');
  assert.equal(updated.timeline.length, 1);
  assert.ok(updated.timeline[0].title.includes('Pris en charge par Sophie Dubois'));
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
  assert.ok(resolved.timeline[0].title.includes('Résolution'));
});

test('confirmClosure updates status to CLOTURE', () => {
  const inProgressTicket = dummyTickets[1];
  const closed = confirmClosure(inProgressTicket, 'Paul Martin');
  assert.equal(closed.status, 'CLOTURE');
  assert.ok(closed.timeline[0].title.includes('Clôture validée'));
});

test('reopenTicket updates status to ROUVERT', () => {
  const inProgressTicket = dummyTickets[1];
  const reopened = reopenTicket(inProgressTicket, 'Micro-coupures revenues à 14h');
  assert.equal(reopened.status, 'ROUVERT');
  assert.ok(reopened.timeline[0].title.includes('Signalement rouvert'));
});

test('addMessage appends message and adds audit event', () => {
  const ticket = dummyTickets[1];
  const withMsg = addMessage(ticket, 'Test message direct', false, dummyUser);
  assert.equal(withMsg.messages.length, 1);
  assert.equal(withMsg.messages[0].content, 'Test message direct');
  assert.equal(withMsg.messages[0].isInternalNote, false);
  assert.ok(withMsg.timeline[0].title.includes('Message transmis'));
});
