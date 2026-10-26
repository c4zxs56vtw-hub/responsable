import React, { useState } from 'react';
import { Ticket, ResponsibleUser, TicketStatus } from '../types/ticket';

interface TicketDetailPanelProps {
  ticket: Ticket;
  currentUser: ResponsibleUser;
  onTakeCharge: (ticket: Ticket) => void;
  onOpenResolutionModal: (ticket: Ticket) => void;
  onOpenTechnicianModal: (ticket: Ticket) => void;
  onSendMessage: (ticket: Ticket, content: string, isInternalNote: boolean) => void;
  onConfirmClosure: (ticket: Ticket) => void;
  onReopen: (ticket: Ticket) => void;
  onRefreshTelemetry?: (ticket: Ticket) => void;
}

export const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  ticket,
  currentUser,
  onTakeCharge,
  onOpenResolutionModal,
  onOpenTechnicianModal,
  onSendMessage,
  onConfirmClosure,
  onReopen,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'attachments' | 'messages'>('details');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);
  const [pingSuccessMessage, setPingSuccessMessage] = useState<string | null>(null);
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(ticket, messageInput.trim(), isInternalNote);
    setMessageInput('');
  };

  const handleRunPingDiagnostic = () => {
    setIsSimulatingPing(true);
    setPingSuccessMessage(null);
    setTimeout(() => {
      setIsSimulatingPing(false);
      setPingSuccessMessage('Sonde active : Signal stabilisé temporairement, réflectométrie confirmée à 22m du panneau B2.');
    }, 1200);
  };

  const isEligibleToTakeCharge = 
    ticket.status === 'EN_ATTENTE' || 
    ticket.status === 'ATTENTE_VALIDATION' || 
    !ticket.assignedTo || 
    ticket.assignedTo.trim().length === 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Detailed Incident Record Card */}
      <div className="rounded-lg bg-white border border-[#E5E0D8] shadow-sm overflow-hidden flex flex-col">
        {/* Header Strip with Metadata */}
        <div className="p-5 bg-[#EDF6EF] border-b border-[#E5E0D8] flex flex-col gap-3">
          {/* Top row: Reference, status badge, created date, SLA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-[#002529] px-2 py-0.5 rounded bg-white border border-[#E5E0D8] shadow-xs">
                {ticket.reference}
              </span>

              {/* Status Badge */}
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase ${
                ticket.status === 'RESOLU'
                  ? 'bg-[#A2F4C6] text-[#002112]'
                  : ticket.status === 'CLOTURE'
                  ? 'bg-[#E7F0E9] text-[#414849]'
                  : ticket.status === 'ROUVERT'
                  ? 'bg-[#FFDAD6] text-[#93000A]'
                  : 'bg-[#A2F4C6] text-[#002112]'
              }`}>
                {ticket.status === 'DIAGNOSTIC_EN_COURS'
                  ? 'EN COURS DE DIAGNOSTIC'
                  : ticket.status === 'ATTENTE_VALIDATION'
                  ? 'EN ATTENTE VALIDATION'
                  : ticket.status === 'EN_ATTENTE'
                  ? 'À TRAITER'
                  : ticket.status === 'RESOLU'
                  ? 'RÉSOLU'
                  : ticket.status === 'CLOTURE'
                  ? 'CLÔTURÉ'
                  : 'ROUVERT'}
              </span>

              <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F]">
                Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} à {new Date(ticket.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* SLA Badge */}
            <div className="flex items-center gap-1 text-[#146C48]">
              <span className="material-symbols-outlined text-base">verified</span>
              <span className="font-['JetBrains_Mono'] text-[11px] font-semibold">
                {ticket.slaInfo}
              </span>
            </div>
          </div>

          {/* Title & Confidentiality indicators */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-['DM_Serif_Display'] text-xl lg:text-2xl text-[#002529] leading-snug">
              {ticket.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Confidentiality Level Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-[#E5E0D8] text-[#151D19] shadow-2xs">
                <span className="material-symbols-outlined text-sm text-[#146C48]">
                  {ticket.confidentiality === 'CONFIDENTIEL'
                    ? 'lock'
                    : ticket.confidentiality === 'ANONYME'
                    ? 'visibility_off'
                    : 'person_check'}
                </span>
                <span className="text-xs font-semibold">
                  {ticket.confidentiality === 'CONFIDENTIEL'
                    ? 'Signalement Confidentiel'
                    : ticket.confidentiality === 'ANONYME'
                    ? 'Signalement Anonyme'
                    : 'Signalement Nominatif'}
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#66736F]">
                  {ticket.confidentiality === 'CONFIDENTIEL'
                    ? '(Accès restreint Niveau 3)'
                    : ticket.confidentiality === 'ANONYME'
                    ? '(Identité masquée)'
                    : '(Échanges directs autorisés)'}
                </span>
              </div>

              {/* Elapsed Time */}
              <div className="flex items-center gap-1 text-[#66736F] text-xs">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Temps écoulé : {ticket.timeElapsed}</span>
              </div>
            </div>
          </div>

          {/* Tabs header */}
          <div className="flex items-center gap-1 border-t border-[#E5E0D8] pt-3 mt-1 overflow-x-auto scrollbar-none" role="tablist">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'details'
                  ? 'bg-white text-[#002529] shadow-xs border border-[#E5E0D8]'
                  : 'text-[#414849] hover:text-[#002529] hover:bg-white/50'
              }`}
            >
              Détails & Diagnostic
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-white text-[#002529] shadow-xs border border-[#E5E0D8]'
                  : 'text-[#414849] hover:text-[#002529] hover:bg-white/50'
              }`}
            >
              <span>Journal & Traçabilité</span>
              <span className="font-['JetBrains_Mono'] text-[10px] bg-[#E7F0E9] px-1 rounded">
                {ticket.timeline.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === 'attachments'
                  ? 'bg-white text-[#002529] shadow-xs border border-[#E5E0D8]'
                  : 'text-[#414849] hover:text-[#002529] hover:bg-white/50'
              }`}
            >
              <span>Pièces Jointes</span>
              <span className="font-['JetBrains_Mono'] text-[10px] bg-[#E7F0E9] px-1 rounded">
                {ticket.attachments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === 'messages'
                  ? 'bg-white text-[#002529] shadow-xs border border-[#E5E0D8]'
                  : 'text-[#414849] hover:text-[#002529] hover:bg-white/50'
              }`}
            >
              <span>Échanges & Notes</span>
              <span className="font-['JetBrains_Mono'] text-[10px] bg-[#E7F0E9] px-1 rounded">
                {ticket.messages.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* TAB 1: DETAILS & DIAGNOSTIC */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-4">
              {/* Requester & Workstation Profile Box */}
              <div className="p-3.5 rounded-lg bg-[#EDF6EF] border border-[#E5E0D8] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {ticket.isAnonymous ? (
                    <div className="w-11 h-11 rounded-full bg-[#DCE5DE] text-[#414849] flex items-center justify-center font-bold text-sm">
                      ?
                    </div>
                  ) : ticket.requesterAvatar ? (
                    <img
                      src={ticket.requesterAvatar}
                      alt={ticket.requesterName || 'Collaborateur'}
                      className="w-11 h-11 rounded-full object-cover border border-[#E5E0D8] shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#173B3F] text-white flex items-center justify-center font-bold text-sm">
                      {ticket.requesterName ? ticket.requesterName.substring(0, 2).toUpperCase() : 'EC'}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#151D19]">
                        {ticket.requesterName || 'Collaborateur anonyme'}
                      </span>
                      {ticket.requesterPhone && (
                        <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded bg-white text-[#414849] border border-[#E5E0D8]">
                          {ticket.requesterPhone}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#66736F]">
                      {ticket.requesterDepartment || 'Service non spécifié'}
                    </span>
                    <span className="text-xs text-[#002529] font-medium">
                      {ticket.requesterLocation || 'Emplacement standard'}
                    </span>
                  </div>
                </div>

                {/* Fast Contact Utility */}
                <div className="flex items-center gap-1.5 self-stretch md:self-auto justify-end">
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="p-2 rounded bg-white border border-[#E5E0D8] text-[#002529] hover:bg-[#F3FBF5] transition-all shadow-2xs flex items-center justify-center"
                    title="Envoyer un message au collaborateur"
                    aria-label="Ouvrir la conversation"
                  >
                    <span className="material-symbols-outlined text-base">forum</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="p-2 rounded bg-white border border-[#E5E0D8] text-[#002529] hover:bg-[#F3FBF5] transition-all shadow-2xs flex items-center justify-center"
                    title="Consulter l'historique complet"
                    aria-label="Voir l'historique"
                  >
                    <span className="material-symbols-outlined text-base">manage_search</span>
                  </button>
                </div>
              </div>

              {/* Original Problem Statement */}
              <div className="flex flex-col gap-1.5">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                  Description fournie par le collaborateur
                </span>
                <div className="p-3.5 rounded-lg bg-white border border-[#E5E0D8] text-[#151D19] text-xs leading-relaxed font-['DM_Sans'] shadow-2xs">
                  {ticket.description}
                </div>
              </div>

              {/* Technical Diagnostic Visual / Infrastructure Context */}
              {ticket.telemetry && (
                <div className="p-3.5 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                      Télémétrie Port & Baie de brassage
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-semibold">
                        {ticket.telemetry.switchName}
                      </span>
                      <button
                        onClick={handleRunPingDiagnostic}
                        disabled={isSimulatingPing}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#EDF6EF] text-[#002529] hover:bg-[#DCE5DE] border border-[#E5E0D8] flex items-center gap-1 font-mono"
                        title="Relancer le test de boucle"
                      >
                        <span className={`material-symbols-outlined text-xs ${isSimulatingPing ? 'animate-spin' : ''}`}>
                          sync
                        </span>
                        <span>{isSimulatingPing ? 'Diagnostic...' : 'Tester'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2 rounded bg-[#EDF6EF] flex flex-col">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#66736F]">
                        Atténuation dB
                      </span>
                      <span className={`text-xs font-bold ${
                        ticket.telemetry.attenuationAnomaly ? 'text-[#BA1A1A]' : 'text-[#146C48]'
                      }`}>
                        {ticket.telemetry.attenuationDb}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[#EDF6EF] flex flex-col">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#66736F]">
                        Paquets perdus
                      </span>
                      <span className={`text-xs font-bold ${
                        ticket.telemetry.packetLossAnomaly ? 'text-[#BA1A1A]' : 'text-[#146C48]'
                      }`}>
                        {ticket.telemetry.packetLoss}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-[#EDF6EF] flex flex-col">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#66736F]">
                        Débit négocié
                      </span>
                      <span className="text-xs font-bold text-[#151D19]">
                        {ticket.telemetry.negotiatedSpeed}
                      </span>
                    </div>
                  </div>

                  {pingSuccessMessage && (
                    <div className="p-2 rounded bg-[#A2F4C6]/30 border border-[#A2F4C6] text-[11px] text-[#002112] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#146C48]">check_circle</span>
                      <span>{pingSuccessMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resolution details if already resolved */}
              {ticket.resolutionDetails && (
                <div className="p-3.5 rounded-lg bg-[#A2F4C6]/20 border border-[#A2F4C6] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#002112] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#146C48]">task_alt</span>
                      <span>Résolution enregistrée</span>
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#146C48]">
                      Par {ticket.resolutionDetails.resolvedBy}
                    </span>
                  </div>
                  <p className="text-xs text-[#002112] font-semibold">
                    {ticket.resolutionDetails.solution}
                  </p>
                  <p className="text-[11px] text-[#414849]">
                    Actions réalisées : {ticket.resolutionDetails.actionsTaken}
                  </p>
                  {ticket.resolutionDetails.recommendations && (
                    <p className="text-[11px] text-[#66736F] italic">
                      Recommandations : {ticket.resolutionDetails.recommendations}
                    </p>
                  )}
                </div>
              )}

              {/* Treatment Stepper */}
              <div className="p-3.5 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs flex flex-col gap-2">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                  Suivi du cycle de vie du signalement
                </span>
                <div className="grid grid-cols-6 gap-1 text-center pt-1 text-[11px]">
                  {[
                    { label: 'Créé', done: true },
                    { label: 'Attribué', done: !!ticket.assignedTo },
                    { label: 'Prise en charge', done: ticket.status !== 'EN_ATTENTE' },
                    { label: 'Diagnostic', done: ticket.status === 'DIAGNOSTIC_EN_COURS' || ticket.status === 'RESOLU' || ticket.status === 'CLOTURE' },
                    { label: 'Résolution', done: ticket.status === 'RESOLU' || ticket.status === 'CLOTURE' },
                    { label: 'Clôturé', done: ticket.status === 'CLOTURE' },
                  ].map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step.done ? 'bg-[#146C48] text-white' : 'bg-[#E7F0E9] text-[#66736F]'
                      }`}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] truncate max-w-full ${step.done ? 'font-semibold text-[#002529]' : 'text-[#66736F]'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORIQUE & TRACABILITE */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                  Journal d'intervention & Traçabilité
                </span>
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-medium">
                  {ticket.timeline.length} événements enregistrés
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D8]">
                {ticket.timeline.map((event, idx) => {
                  let dotColor = 'bg-[#414849]';
                  if (event.type === 'take_charge') dotColor = 'bg-[#146C48]';
                  if (event.type === 'message') dotColor = 'bg-[#173B3F]';
                  if (event.type === 'resolution') dotColor = 'bg-[#146C48]';
                  if (event.type === 'reopen') dotColor = 'bg-[#BA1A1A]';

                  return (
                    <div key={event.id || idx} className="relative flex flex-col gap-0.5 text-xs">
                      <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                      <div className="flex items-center gap-2">
                        <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#002529]">
                          {event.time}
                        </span>
                        <span className="font-semibold text-[#151D19]">
                          {event.title}
                        </span>
                      </div>
                      <p className="text-[#66736F] text-xs leading-relaxed">
                        {event.description}
                      </p>
                      <span className="text-[10px] text-[#66736F] italic">
                        Par : {event.author} {event.authorRole ? `(${event.authorRole})` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PIECES JOINTES */}
          {activeTab === 'attachments' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                  Pièces Jointes & Preuves Techniques ({ticket.attachments.length})
                </span>
                <label className="cursor-pointer px-2.5 py-1 rounded bg-[#EDF6EF] text-[#002529] hover:bg-[#DCE5DE] border border-[#E5E0D8] text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Ajouter une pièce</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        ticket.attachments.push({
                          id: `att-${Date.now()}`,
                          name: file.name,
                          type: file.type || 'Fichier joint',
                          size: `${(file.size / 1024).toFixed(1)} KB`,
                          uploadedAt: "À l'instant",
                        });
                        setAttachmentNotice(`Fichier "${file.name}" attaché au signalement.`);
                        setTimeout(() => setAttachmentNotice(null), 3000);
                      }
                    }}
                  />
                </label>
              </div>

              {attachmentNotice && (
                <div className="p-2 bg-[#A2F4C6]/30 border border-[#A2F4C6] rounded text-xs text-[#002112] flex items-center gap-1.5 font-['DM_Sans']">
                  <span className="material-symbols-outlined text-sm text-[#146C48]">check_circle</span>
                  <span>{attachmentNotice}</span>
                </div>
              )}

              {ticket.attachments.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-[#E5E0D8] rounded-lg text-xs text-[#66736F]">
                  Aucun document ou journal n'a été joint à ce signalement.
                </div>
              ) : (
                <div className="space-y-2">
                  {ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-lg bg-white border border-[#E5E0D8] flex items-center justify-between text-xs hover:border-[#173B3F] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="material-symbols-outlined text-lg text-[#173B3F]">
                          description
                        </span>
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-[#151D19] truncate">
                            {att.name}
                          </span>
                          <span className="text-[10px] text-[#66736F]">
                            {att.type} • {att.size} • Ajouté le {att.uploadedAt}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentNotice(`Téléchargement de "${att.name}" démarré.`);
                          setTimeout(() => setAttachmentNotice(null), 2500);
                        }}
                        className="px-2.5 py-1 rounded bg-[#EDF6EF] hover:bg-[#DCE5DE] text-[#002529] font-medium text-xs flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Télécharger</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ECHANGES & NOTES */}
          {activeTab === 'messages' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
                  Fil de discussion et observations ({ticket.messages.length})
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#146C48] bg-[#EDF6EF] px-2 py-0.5 rounded font-semibold">
                  Canal d'échange actif
                </span>
              </div>

              {/* Message Feed */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {ticket.messages.length === 0 ? (
                  <p className="p-4 text-center text-xs text-[#66736F] bg-[#F7F5F0] rounded">
                    Aucun message échangé pour le moment. Vous pouvez rédiger une réponse ci-dessous.
                  </p>
                ) : (
                  ticket.messages.map((msg) => {
                    const isFromResponsible = msg.senderRole === 'RESPONSABLE';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                          msg.isInternalNote
                            ? 'bg-[#FFDCBF]/20 border-[#FFDCBF] text-[#522D00]'
                            : isFromResponsible
                            ? 'bg-[#EDF6EF] border-[#E5E0D8] text-[#151D19]'
                            : 'bg-white border-[#E5E0D8] text-[#151D19]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">
                            {msg.isInternalNote && (
                              <span className="font-mono text-[9px] bg-[#A86412] text-white px-1 rounded uppercase">
                                Note interne DSI
                              </span>
                            )}
                            <span>{msg.sender}</span>
                          </span>
                          <span className="font-['JetBrains_Mono'] text-[10px] text-[#66736F]">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Operational Response Textbox (Always visible or in tabs) */}
          <div className="pt-2 flex flex-col gap-2 border-t border-[#E5E0D8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#EDF6EF] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    !isInternalNote
                      ? 'bg-white text-[#002529] shadow-xs'
                      : 'text-[#66736F] hover:text-[#151D19]'
                  }`}
                >
                  Message direct à {ticket.requesterName || 'Collaborateur'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    isInternalNote
                      ? 'bg-white text-[#002529] shadow-xs'
                      : 'text-[#66736F] hover:text-[#151D19]'
                  }`}
                >
                  Note interne confidentielle
                </button>
              </div>

              <span className="font-['JetBrains_Mono'] text-[10px] text-[#146C48] hidden sm:inline">
                Échange sécurisé de service
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                rows={2}
                placeholder={
                  isInternalNote
                    ? 'Consigner des éléments techniques réservés aux techniciens DSI...'
                    : `Rédiger une réponse à l'attention de ${ticket.requesterName || 'Paul Martin'}...`
                }
                className="w-full p-3 pr-24 bg-white border border-[#E5E0D8] rounded-lg text-xs font-['DM_Sans'] text-[#151D19] focus:outline-none focus:border-[#173B3F] focus:ring-1 focus:ring-[#173B3F] resize-none placeholder:text-[#66736F]"
              />
              <div className="absolute bottom-2.5 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const sample = isInternalNote 
                      ? 'Diagnostic physique : câble jarretière validé, suspecteur port switch 14.' 
                      : 'Bonjour, un technicien réseau intervient sur votre bureau d’ici 30 minutes.';
                    setMessageInput(sample);
                  }}
                  className="p-1 rounded text-[#66736F] hover:text-[#151D19]"
                  title="Insérer un modèle de réponse rapide"
                >
                  <span className="material-symbols-outlined text-base">text_snippet</span>
                </button>
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-3 py-1 rounded bg-[#173B3F] hover:bg-[#002529] text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-xs">send</span>
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Progression Action Bar */}
          <div className="p-3 rounded-lg bg-[#EDF6EF] border border-[#E5E0D8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#173B3F]">
                fast_forward
              </span>
              <span className="text-xs font-bold text-[#151D19]">
                Actions de progression :
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Prendre en charge button (if not taken charge) */}
              {isEligibleToTakeCharge && (
                <button
                  type="button"
                  onClick={() => onTakeCharge(ticket)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#173B3F] text-white hover:bg-[#002529] font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Prendre en charge</span>
                </button>
              )}

              {/* Planifier technicien */}
              <button
                type="button"
                onClick={() => onOpenTechnicianModal(ticket)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-white hover:bg-[#F3FBF5] border border-[#E5E0D8] text-[#151D19] font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm text-[#146C48]">
                  handyman
                </span>
                <span>Planifier technicien</span>
              </button>

              {/* Demander précision */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('messages');
                  setIsInternalNote(false);
                  setMessageInput("Bonjour, pourriez-vous nous préciser si le problème se produit également lors de l'accès aux autres applications métier ?");
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-white hover:bg-[#F3FBF5] border border-[#E5E0D8] text-[#151D19] font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm text-[#66736F]">
                  help_outline
                </span>
                <span>Demander précision</span>
              </button>

              {/* Marquer comme résolu / Proposer une résolution */}
              {ticket.status !== 'RESOLU' && ticket.status !== 'CLOTURE' ? (
                <button
                  type="button"
                  onClick={() => onOpenResolutionModal(ticket)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#146C48] text-white font-semibold text-xs hover:bg-[#005234] shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  <span>Marquer comme résolu</span>
                </button>
              ) : ticket.status === 'RESOLU' ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onConfirmClosure(ticket)}
                    className="px-2.5 py-1.5 rounded bg-[#146C48] text-white font-semibold text-xs hover:bg-[#005234] shadow-xs flex items-center gap-1"
                    title="Simuler la validation finale de l'employé"
                  >
                    <span className="material-symbols-outlined text-sm">done_all</span>
                    <span>Confirmer clôture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReopen(ticket)}
                    className="px-2.5 py-1.5 rounded bg-white border border-[#BA1A1A] text-[#BA1A1A] font-semibold text-xs hover:bg-[#FFDAD6]/30 flex items-center gap-1"
                    title="Le problème persiste, rouvrir le dossier"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    <span>Rouvrir</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
