/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Ticket, ResponsibleUser } from './types/ticket';
import { CURRENT_MANAGER, INITIAL_TICKETS } from './data/mock-tickets';
import {
  filterTickets,
  computeMetrics,
  takeChargeTicket,
  proposeResolution,
  confirmClosure,
  reopenTicket,
  addMessage,
} from './utils/ticket-logic';

import { ResponsibleSidebar } from './components/ResponsibleSidebar';
import { ResponsibleHeader } from './components/ResponsibleHeader';
import { OperationalHeader } from './components/OperationalHeader';
import { DashboardMetrics } from './components/DashboardMetrics';
import { FilterBar } from './components/FilterBar';
import { TicketList } from './components/TicketList';
import { TicketDetailPanel } from './components/TicketDetailPanel';

import { ResolutionModal } from './components/ResolutionModal';
import { NewTicketModal } from './components/NewTicketModal';
import { TechnicianModal } from './components/TechnicianModal';
import { AuditExportModal } from './components/AuditExportModal';
import { EmployeePortalModal } from './components/EmployeePortalModal';
import { ViewsAstreinteModal } from './components/ViewsAstreinteModal';
import { SocialClimateView } from './components/SocialClimateView';
import { AuditLogView } from './components/AuditLogView';
import { TicketRegisterView } from './components/TicketRegisterView';

export default function App() {
  const [currentUser] = useState<ResponsibleUser>(CURRENT_MANAGER);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('ticket-ec-2024-0891');
  const [currentView, setCurrentView] = useState<string>('vue-responsable');

  // Mobile navigation and view state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileDetailViewOpen, setMobileDetailViewOpen] = useState(false);

  // Search & quick filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Modal dialog states
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);
  const [isAuditExportModalOpen, setIsAuditExportModalOpen] = useState(false);
  const [isEmployeePortalOpen, setIsEmployeePortalOpen] = useState(false);
  const [isAstreinteModalOpen, setIsAstreinteModalOpen] = useState(false);
  const [targetTicketForModal, setTargetTicketForModal] = useState<Ticket | null>(null);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return filterTickets(tickets, {
      search: searchQuery,
      filterTab: activeFilterTab,
    });
  }, [tickets, searchQuery, activeFilterTab]);

  // Operational KPI metrics
  const metrics = useMemo(() => {
    return computeMetrics(tickets);
  }, [tickets]);

  // Currently selected ticket
  const selectedTicket = useMemo(() => {
    const found = tickets.find((t) => t.id === selectedTicketId);
    if (found) return found;
    return filteredTickets[0] || tickets[0] || null;
  }, [tickets, selectedTicketId, filteredTickets]);

  // Action handlers
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setMobileDetailViewOpen(true);
  };

  const handleTakeCharge = (ticketToCharge: Ticket, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = takeChargeTicket(ticketToCharge, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicketId(updated.id);
    setMobileDetailViewOpen(true);
  };

  const handleOpenResolutionModal = (ticket: Ticket) => {
    setTargetTicketForModal(ticket);
    setIsResolutionModalOpen(true);
  };

  const handleProposeResolutionSubmit = (
    ticket: Ticket,
    solution: string,
    actionsTaken: string,
    recommendations: string
  ) => {
    const updated = proposeResolution(ticket, solution, actionsTaken, recommendations, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleConfirmClosure = (ticket: Ticket) => {
    const updated = confirmClosure(ticket, ticket.requesterName);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleReopen = (ticket: Ticket) => {
    const updated = reopenTicket(ticket, 'Le collaborateur indique une récurrence des micro-coupures réseau.');
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleOpenTechnicianModal = (ticket: Ticket) => {
    setTargetTicketForModal(ticket);
    setIsTechnicianModalOpen(true);
  };

  const handleScheduleTechnician = (
    ticket: Ticket,
    technician: string,
    dateSlot: string,
    note: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated: Ticket = {
      ...ticket,
      status: 'DIAGNOSTIC_EN_COURS',
      assignedTo: `${technician.split('(')[0].trim()} (Sous supervision ${currentUser.name})`,
      timeline: [
        {
          id: `tl-tech-${Date.now()}`,
          time: timeStr,
          timestamp: now.toISOString(),
          title: `Intervention technicien planifiée : ${technician.split('(')[0].trim()}`,
          description: `Créneau : ${dateSlot}. Consignes : ${note}`,
          author: currentUser.name,
          type: 'take_charge',
          hash: '#TECH-2401-IT',
        },
        ...ticket.timeline,
      ],
      updatedAt: now.toISOString(),
    };
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleSendMessage = (ticket: Ticket, content: string, isInternalNote: boolean) => {
    const updated = addMessage(ticket, content, isInternalNote, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    setMobileDetailViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#151D19] flex">
      {/* 1. Left Navigation Sidebar */}
      <ResponsibleSidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setMobileDetailViewOpen(false);
        }}
        currentUser={currentUser}
        onOpenEmployeeSpace={() => setIsEmployeePortalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header */}
        <ResponsibleHeader
          currentUser={currentUser}
          unreadCount={2}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* 3. Main Workspace Container */}
        <main className="p-4 lg:p-8 flex-1 flex flex-col gap-5 lg:gap-6 max-w-[1600px] w-full mx-auto">
          {/* VIEW: TABLEAU DE BORD (MAIN SUPERVISION DASHBOARD) */}
          {currentView === 'vue-responsable' && (
            <>
              {/* Operational Header with scope and quick buttons */}
              <OperationalHeader
                onOpenAstreinte={() => setIsAstreinteModalOpen(true)}
                onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
                departmentName={currentUser.department}
                departmentCode={currentUser.codeDepartment}
                managerName={currentUser.name.split(' ')[0]}
              />

              {/* 4 Operational KPI Cards */}
              <DashboardMetrics
                metrics={metrics}
                activeFilterTab={activeFilterTab}
                onSelectFilter={(tab) => {
                  setActiveFilterTab(tab);
                  setMobileDetailViewOpen(false);
                }}
              />

              {/* Fast Frictionless Search & Filter Bar */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilterTab={activeFilterTab}
                onSelectFilterTab={(tab) => {
                  setActiveFilterTab(tab);
                  setMobileDetailViewOpen(false);
                }}
                tickets={tickets}
              />

              {/* Mobile Back to List button if viewing details on mobile */}
              {mobileDetailViewOpen && (
                <div className="lg:hidden">
                  <button
                    onClick={() => setMobileDetailViewOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-white border border-[#E5E0D8] text-xs font-bold text-[#002529] shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Retour à la file de triage des signalements</span>
                  </button>
                </div>
              )}

              {/* Master-Detail Split Work Surface (45% left / 55% right on desktop, toggled on mobile) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Triage List (5/12 cols) - hidden on mobile when detail is open */}
                <div className={`lg:col-span-5 ${mobileDetailViewOpen ? 'hidden lg:block' : 'block'}`}>
                  <TicketList
                    tickets={filteredTickets}
                    selectedTicketId={selectedTicket?.id || ''}
                    onSelectTicket={handleSelectTicket}
                    onTakeCharge={handleTakeCharge}
                    currentUser={currentUser}
                    onViewAllArchive={() => setCurrentView('registre-des-signalements')}
                  />
                </div>

                {/* Right Column: Detailed Incident Record Panel (7/12 cols) - hidden on mobile when viewing list */}
                <div className={`lg:col-span-7 ${!mobileDetailViewOpen ? 'hidden lg:block' : 'block'}`}>
                  {selectedTicket ? (
                    <TicketDetailPanel
                      ticket={selectedTicket}
                      currentUser={currentUser}
                      onTakeCharge={handleTakeCharge}
                      onOpenResolutionModal={handleOpenResolutionModal}
                      onOpenTechnicianModal={handleOpenTechnicianModal}
                      onSendMessage={handleSendMessage}
                      onConfirmClosure={handleConfirmClosure}
                      onReopen={handleReopen}
                    />
                  ) : (
                    <div className="p-12 text-center bg-white border border-[#E5E0D8] rounded-lg">
                      <p className="text-sm font-semibold text-[#151D19]">
                        Sélectionnez un signalement dans la file de gauche
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* VIEW: REGISTRE & TRIAGE */}
          {currentView === 'registre-des-signalements' && (
            <TicketRegisterView
              tickets={tickets}
              currentUser={currentUser}
              onSelectTicket={(t) => {
                setSelectedTicketId(t.id);
                setCurrentView('vue-responsable');
                setMobileDetailViewOpen(true);
              }}
              onTakeCharge={handleTakeCharge}
              onBackToDashboard={() => setCurrentView('vue-responsable')}
            />
          )}

          {/* VIEW: CLIMAT SOCIAL & ALERTES */}
          {currentView === 'analyse-climat-social' && (
            <SocialClimateView
              tickets={tickets}
              onBackToDashboard={() => setCurrentView('vue-responsable')}
              onSelectTicket={(t) => {
                setSelectedTicketId(t.id);
                setCurrentView('vue-responsable');
                setMobileDetailViewOpen(true);
              }}
            />
          )}

          {/* VIEW: JOURNAL D'AUDIT & RGPD */}
          {currentView === 'registre-audit-conformite' && (
            <AuditLogView
              tickets={tickets}
              onBackToDashboard={() => setCurrentView('vue-responsable')}
              onOpenAuditExport={() => setIsAuditExportModalOpen(true)}
            />
          )}

          {/* 4. Operational & Audit Compliance Foot-Panel */}
          <footer className="mt-4 p-4 rounded-lg bg-[#EDF6EF] border border-[#E5E0D8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#DCE5DE] flex items-center justify-center text-[#002529]">
                <span className="material-symbols-outlined text-xl">policy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#151D19]">
                  Registre de consignation & conformité RGPD/CNIL
                </span>
                <span className="text-[11px] text-[#414849]">
                  Toutes les actions prises dans cette console sont journalisées et opposables en comité paritaire.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-[#414849]">
                <span className="w-2 h-2 rounded-full bg-[#146C48] animate-pulse"></span>
                <span>Audit Trail Hash ID: #8F9A-24D1-IT</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditExportModalOpen(true)}
                className="px-3 py-1.5 rounded bg-white hover:bg-[#F3FBF5] border border-[#E5E0D8] text-[#151D19] text-xs font-semibold transition-colors shadow-2xs"
              >
                Exporter le registre (PDF scellé)
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* MODALS */}
      <ResolutionModal
        isOpen={isResolutionModalOpen}
        ticket={targetTicketForModal || selectedTicket}
        onClose={() => setIsResolutionModalOpen(false)}
        onSubmit={handleProposeResolutionSubmit}
      />

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onAddTicket={handleAddTicket}
        currentUser={currentUser}
      />

      <TechnicianModal
        isOpen={isTechnicianModalOpen}
        ticket={targetTicketForModal || selectedTicket}
        onClose={() => setIsTechnicianModalOpen(false)}
        onSchedule={handleScheduleTechnician}
        currentUser={currentUser}
      />

      <AuditExportModal
        isOpen={isAuditExportModalOpen}
        onClose={() => setIsAuditExportModalOpen(false)}
        tickets={tickets}
      />

      <EmployeePortalModal
        isOpen={isEmployeePortalOpen}
        onClose={() => setIsEmployeePortalOpen(false)}
        currentUser={currentUser}
      />

      <ViewsAstreinteModal
        isOpen={isAstreinteModalOpen}
        onClose={() => setIsAstreinteModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
