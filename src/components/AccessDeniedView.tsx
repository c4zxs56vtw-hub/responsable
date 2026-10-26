import React from 'react';
import { AuthSession, getDefaultPathForRoles } from '../utils/auth-logic';

interface AccessDeniedViewProps {
  session: AuthSession;
  attemptedPath: string;
  onReturnToAllowedSpace: (targetPath: string) => void;
  onLogout: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  session,
  attemptedPath,
  onReturnToAllowedSpace,
  onLogout,
}) => {
  const defaultPath = getDefaultPathForRoles(session.roles);
  const targetLabel =
    defaultPath === '/admin'
      ? "Retourner à l'espace Administrateur"
      : defaultPath === '/responsable'
      ? "Retourner à l'espace Responsable"
      : "Retourner à mon espace Employé";

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#202824] flex flex-col justify-between p-6 lg:p-12 font-['DM_Sans']">
      {/* En-tête sobre */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between border-b border-[#E5E0D8] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#173B3F] text-[#F7F5F0] flex items-center justify-center font-['DM_Serif_Display'] text-lg">
            EC
          </div>
          <div>
            <span className="font-bold text-base text-[#173B3F] tracking-tight block leading-none">
              EmployeeCare
            </span>
            <span className="text-xs text-[#66736F] block mt-0.5">
              Contrôle d&apos;accès et sécurité
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#66736F]">
          <span className="hidden sm:inline">
            Connecté en tant que <strong className="text-[#202824]">{session.fullName}</strong>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded border border-[#E5E0D8] bg-white text-[#202824] font-semibold hover:bg-[#E5E0D8]/50 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Contenu central */}
      <main className="max-w-xl w-full mx-auto my-auto py-12">
        <div className="bg-white border border-[#E5E0D8] rounded p-8 lg:p-10 shadow-2xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FDECEC] text-[#B42332] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              gpp_maybe
            </span>
            <span>Restriction de périmètre</span>
          </div>

          <h1 className="font-['DM_Serif_Display'] text-3xl lg:text-4xl text-[#173B3F] font-normal leading-tight">
            Accès non autorisé
          </h1>

          <p className="text-sm text-[#66736F] leading-relaxed mt-4">
            Votre compte (<strong className="text-[#202824]">{session.email}</strong>) ne dispose
            pas des habilitations nécessaires pour accéder à la ressource demandée{' '}
            <code className="font-['JetBrains_Mono'] text-xs bg-[#F7F5F0] px-1.5 py-0.5 rounded border border-[#E5E0D8] text-[#173B3F]">
              {attemptedPath}
            </code>
            .
          </p>

          <div className="mt-6 p-4 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-xs text-[#66736F] space-y-1">
            <p className="font-semibold text-[#202824]">
              Profil actif : {session.fullName} ({session.roleLabel})
            </p>
            <p>
              Les autorisations d&apos;accès aux espaces Employé, Responsable et Administrateur sont
              strictement cloisonnées selon votre rôle professionnel.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onReturnToAllowedSpace(defaultPath)}
              className="px-5 py-3 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-sm font-semibold transition-colors text-center"
            >
              {targetLabel}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-3 rounded border border-[#E5E0D8] bg-[#F7F5F0] hover:bg-[#E5E0D8] text-[#202824] text-sm font-semibold transition-colors text-center"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="max-w-5xl w-full mx-auto border-t border-[#E5E0D8] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#66736F] gap-2">
        <span>EmployeeCare — Votre espace de dialogue</span>
        <span>Protection des accès et confidentialité des échanges</span>
      </footer>
    </div>
  );
};
