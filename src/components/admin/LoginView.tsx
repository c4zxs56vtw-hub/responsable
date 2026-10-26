import React, { useState } from 'react';
import { EmployeeAccount } from '../../types/admin';

interface LoginViewProps {
  employees: EmployeeAccount[];
  onLoginSuccess: (
    targetWorkspace: 'ADMIN' | 'RESPONSABLE' | 'EMPLOYE',
    email: string
  ) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  employees,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@entreprise.com');
  const [password, setPassword] = useState('••••••••••••');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSubmitted, setResetSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const normalized = email.trim().toLowerCase();

    if (!normalized || !password.trim()) {
      setErrorMsg('Veuillez saisir votre adresse email professionnelle et votre mot de passe.');
      return;
    }

    if (
      normalized === 'admin@entreprise.com' ||
      normalized === 'henri.rochefort@entreprise.com'
    ) {
      onLoginSuccess('ADMIN', normalized);
      return;
    }

    const foundEmp = employees.find((emp) => emp.email.toLowerCase() === normalized);
    if (!foundEmp) {
      setErrorMsg(
        "Aucun compte actif ne correspond à cette adresse professionnelle. L'accès à EmployeeCare est exclusivement attribué par l'administrateur de l'entreprise."
      );
      return;
    }

    if (foundEmp.status === 'DESACTIVE') {
      setErrorMsg('Ce compte collaborateur a été désactivé par l’administration.');
      return;
    }

    if (foundEmp.roles.includes('RESPONSABLE')) {
      onLoginSuccess('RESPONSABLE', normalized);
    } else {
      onLoginSuccess('EMPLOYE', normalized);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#202824] flex flex-col justify-between p-6 font-['DM_Sans']">
      {/* En-tête institutionnel sobre */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#173B3F] text-white flex items-center justify-center font-['DM_Serif_Display'] text-lg">
            EC
          </div>
          <div>
            <span className="text-base font-bold text-[#173B3F] block leading-none">
              EmployeeCare
            </span>
            <span className="text-xs text-[#66736F]">
              Votre espace de dialogue
            </span>
          </div>
        </div>
        <span className="text-xs text-[#66736F]">
          Accès réservé aux collaborateurs habilités
        </span>
      </header>

      {/* Carte centrale de connexion (strictement sans inscription publique) */}
      <main className="my-auto max-w-md w-full mx-auto bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-8 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#173B3F]">
            Portail interne sécurisé
          </span>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824] mt-1">
            Connexion à votre espace
          </h1>
          <p className="text-xs text-[#66736F] mt-1.5 leading-relaxed">
            Saisissez vos identifiants professionnels pour accéder à votre espace Employé, Responsable ou Administrateur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block font-semibold text-[#202824] mb-1.5"
            >
              Adresse email professionnelle
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@entreprise.com"
              className="w-full px-3.5 py-2.5 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="font-semibold text-[#202824]"
              >
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(true);
                  setResetSubmitted(false);
                }}
                className="text-[#173B3F] hover:underline font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white font-semibold text-xs transition-colors mt-1"
          >
            Se connecter
          </button>
        </form>

        {/* Accès rapide de démonstration pour tester la redirection selon le rôle */}
        <div className="mt-6 pt-5 border-t border-[#E5E0D8]">
          <span className="text-[11px] font-semibold text-[#66736F] block mb-2">
            Comptes de démonstration (Redirection automatique selon le rôle) :
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => onLoginSuccess('ADMIN', 'admin@entreprise.com')}
              className="w-full text-left px-3 py-2 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8]/60 border border-[#E5E0D8] flex items-center justify-between"
            >
              <span className="font-semibold text-[#202824]">
                Henri Rochefort (Administrateur)
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#173B3F]">
                → Espace Admin
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                onLoginSuccess('RESPONSABLE', 'sophie.dubois@entreprise.com')
              }
              className="w-full text-left px-3 py-2 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8]/60 border border-[#E5E0D8] flex items-center justify-between"
            >
              <span className="font-semibold text-[#202824]">
                Sophie Dubois (Responsable IT)
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#173B3F]">
                → Espace Resp.
              </span>
            </button>
            <button
              type="button"
              onClick={() => onLoginSuccess('EMPLOYE', 'paul.martin@entreprise.com')}
              className="w-full text-left px-3 py-2 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8]/60 border border-[#E5E0D8] flex items-center justify-between"
            >
              <span className="font-semibold text-[#202824]">
                Paul Martin (Employé Comptabilité)
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#173B3F]">
                → Espace Employé
              </span>
            </button>
          </div>
        </div>

        {/* Mention explicite d'absence d'inscription publique */}
        <p className="mt-5 text-[11px] text-[#66736F] leading-relaxed">
          Les comptes sont créés exclusivement par l’administrateur de l’entreprise. Si vous venez de rejoindre l’organisation, veuillez utiliser le lien d’activation transmis sur votre messagerie professionnelle.
        </p>
      </main>

      <footer className="max-w-5xl w-full mx-auto py-3 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] text-[#66736F]">
        <span>EmployeeCare — Plateforme interne de gestion des préoccupations</span>
        <span>Direction Générale & Ressources Humaines</span>
      </footer>

      {/* Modale Mot de passe oublié */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Réinitialisation du mot de passe
              </h2>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ×
              </button>
            </div>
            {resetSubmitted ? (
              <div className="mt-4 space-y-4">
                <p className="text-[#202824] leading-relaxed">
                  Une demande de réinitialisation a été enregistrée pour <strong>{email}</strong>. Si ce compte est actif dans l’annuaire EmployeeCare, les instructions de renouvellement seront disponibles auprès de votre service.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSubmitted(true);
                }}
                className="mt-4 space-y-4"
              >
                <p className="text-[#66736F]">
                  Indiquez votre adresse email professionnelle pour demander le renouvellement de votre accès.
                </p>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                  >
                    Valider la demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
