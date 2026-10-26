import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AUTH_MESSAGES, validateLoginInput } from '../../utils/auth-logic';

interface LoginViewProps {
  companyName?: string;
  initialNotice?: string | null;
  onAuthenticate: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; errorMessage?: string }> | { success: boolean; errorMessage?: string };
}

const DEV_TEST_ACCOUNTS = [
  {
    label: 'Paul Martin',
    email: 'paul.martin@entreprise.com',
    password: 'Employe2026!',
    roleBadge: 'EMPLOYÉ',
  },
  {
    label: 'Sophie Dubois',
    email: 'sophie.dubois@entreprise.com',
    password: 'Resp2026!',
    roleBadge: 'RESPONSABLE',
  },
  {
    label: 'Henri Rochefort',
    email: 'admin@entreprise.com',
    password: 'Admin2026!',
    roleBadge: 'ADMIN',
  },
  {
    label: 'Hélène Garnier',
    email: 'helene.garnier@entreprise.com',
    password: 'Employe2026!',
    roleBadge: 'DÉSACTIVÉ',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({
  initialNotice = null,
  onAuthenticate,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialNotice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password recovery modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    const validation = validateLoginInput(email, password);
    if (!validation.valid) {
      setErrorMessage(validation.errorMessage || AUTH_MESSAGES.EMPTY_FIELDS);
      return;
    }

    setIsSubmitting(true);
    try {
      // Brief visual feedback to prevent double clicks and simulate network roundtrip cleanly
      await new Promise((resolve) => setTimeout(resolve, 180));
      const result = await onAuthenticate(email, password);
      if (!result.success) {
        setErrorMessage(result.errorMessage || AUTH_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch {
      setErrorMessage(AUTH_MESSAGES.SERVER_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecoveryError(null);
    const trimmed = recoveryEmail.trim();
    if (!trimmed) {
      setRecoveryError('Veuillez renseigner votre adresse email professionnelle.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setRecoveryError(AUTH_MESSAGES.INVALID_EMAIL);
      return;
    }
    setRecoverySubmitted(true);
  };

  const handlePrefillDevAccount = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#202824] font-['DM_Sans'] flex flex-col lg:grid lg:grid-cols-12">
      {/* PARTIE GAUCHE — Présentation éditoriale (Desktop) & En-tête condensé (Mobile) */}
      <section
        aria-label="Présentation EmployeeCare"
        className="lg:col-span-6 xl:col-span-6 bg-[#173B3F] text-[#F7F5F0] px-6 py-8 sm:px-10 lg:px-16 lg:py-14 flex flex-col justify-between relative overflow-hidden"
      >
        {/* Lignes architecturales subtiles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-[#F7F5F0]/10 hidden lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -bottom-12 w-64 h-64 rounded-full border border-[#F7F5F0]/10 hidden lg:block"
        />

        {/* Logo EmployeeCare */}
        <div className="relative z-10 flex items-center gap-3.5">
          <span className="flex w-10 h-10 items-center justify-center rounded-[10px] bg-[#F7F5F0] text-[#173B3F] shadow-2xs">
            <ShieldCheck aria-hidden="true" className="w-5 h-5" strokeWidth={2} />
          </span>
          <div className="flex flex-col">
            <span className="font-['DM_Sans'] text-lg font-semibold tracking-tight text-[#F7F5F0] leading-none">
              EmployeeCare
            </span>
            <span className="text-[11px] text-[#F7F5F0]/75 tracking-wide mt-1">
              Votre espace de dialogue
            </span>
          </div>
        </div>

        {/* Grand titre éditorial & texte de présentation */}
        <div className="relative z-10 my-6 lg:my-auto max-w-xl">
          <p className="hidden lg:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F7F5F0]/75 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#287A55]" />
            <span>Espace de dialogue professionnel</span>
          </p>

          <h1 className="font-['DM_Serif_Display'] text-3xl sm:text-4xl lg:text-[52px] font-normal text-[#F7F5F0] leading-[1.08] tracking-tight">
            Un espace pour être entendu.
          </h1>

          <p className="mt-3 lg:mt-6 text-sm sm:text-base lg:text-[17px] text-[#F7F5F0]/85 leading-relaxed font-normal">
            EmployeeCare facilite le dialogue entre les collaborateurs et leur entreprise.
            Signalez vos préoccupations, suivez leur traitement et retrouvez vos réponses dans un
            espace sécurisé.
          </p>

          {/* Repères éditoriaux sobres sur ordinateur */}
          <div className="hidden lg:grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-[#F7F5F0]/15 text-xs text-[#F7F5F0]/80">
            <div>
              <p className="font-semibold text-[#F7F5F0] text-sm">Écoute structurée</p>
              <p className="mt-1 leading-relaxed">
                Orientation vers le référent habilité selon la nature de votre demande.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#F7F5F0] text-sm">Suivi transparent</p>
              <p className="mt-1 leading-relaxed">
                Visibilité à chaque étape de prise en charge et de résolution.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#F7F5F0] text-sm">Confidentialité</p>
              <p className="mt-1 leading-relaxed">
                Accès strictement cloisonné selon les responsabilités professionnelles.
              </p>
            </div>
          </div>
        </div>

        {/* Pied de colonne gauche sur ordinateur */}
        <div className="hidden lg:flex relative z-10 items-center justify-between text-xs text-[#F7F5F0]/65 pt-6 border-t border-[#F7F5F0]/10">
          <span>Accès réservé aux collaborateurs habilités</span>
          <span>Environnement sécurisé</span>
        </div>
      </section>

      {/* PARTIE DROITE — Formulaire de connexion unique */}
      <main className="lg:col-span-6 xl:col-span-6 flex-1 flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-16 xl:px-24 bg-[#F7F5F0]">
        <div className="w-full max-w-[440px] mx-auto">
          <div className="bg-white border border-[#E5E0D8] rounded-md p-6 sm:p-8 lg:p-10 shadow-2xs">
            <div className="mb-7">
              <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl text-[#173B3F] font-normal tracking-tight">
                Bienvenue sur EmployeeCare
              </h2>
              <p className="mt-2 text-sm text-[#66736F]">
                Connectez-vous à votre espace professionnel.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-3.5 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] text-xs sm:text-[13px] font-medium flex items-start gap-2.5 leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-base shrink-0 mt-0.5"
                >
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Champ Adresse email professionnelle */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[13px] font-semibold text-[#202824] mb-2"
                >
                  Adresse email professionnelle
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="nom@entreprise.com"
                  disabled={isSubmitting}
                  className="w-full h-12 px-3.5 rounded border border-[#D5CFC4] bg-[#F7F5F0]/60 text-sm text-[#202824] placeholder:text-[#66736F]/60 focus:bg-white focus:outline-none focus:border-[#173B3F] focus:ring-1 focus:ring-[#173B3F] transition-colors"
                />
              </div>

              {/* Champ Mot de passe avec bascule Afficher/Masquer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-semibold text-[#202824]"
                  >
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      setRecoverySubmitted(false);
                      setRecoveryError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-medium text-[#287A55] hover:text-[#173B3F] transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    disabled={isSubmitting}
                    className="w-full h-12 pl-3.5 pr-11 rounded border border-[#D5CFC4] bg-[#F7F5F0]/60 text-sm text-[#202824] placeholder:text-[#66736F]/60 focus:bg-white focus:outline-none focus:border-[#173B3F] focus:ring-1 focus:ring-[#173B3F] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    }
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-[#66736F] hover:text-[#173B3F] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton principal : Se connecter */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded bg-[#173B3F] hover:bg-[#102B2E] disabled:opacity-65 text-[#F7F5F0] text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full border-2 border-[#F7F5F0]/30 border-t-[#F7F5F0] animate-spin"
                      />
                      <span>Vérification en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </div>
            </form>

            {/* Texte discret sous le formulaire (Aucune inscription publique) */}
            <div className="mt-6 pt-5 border-t border-[#E5E0D8] text-center">
              <p className="text-xs text-[#66736F] leading-relaxed">
                Vous ne possédez pas de compte ? Contactez l&apos;administrateur de votre
                entreprise.
              </p>
            </div>
          </div>

          {/* Aide au test isolée pour le mode développement (Section 10) */}
          {import.meta.env.DEV && (
            <div className="mt-5 p-4 rounded border border-[#E5E0D8] bg-white/75 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#173B3F]">
                  Comptes de démonstration (Mode Développement)
                </span>
                <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#F7F5F0] text-[#66736F] border border-[#E5E0D8]">
                  Pré-remplissage
                </span>
              </div>
              <p className="text-[11px] text-[#66736F] mb-2.5">
                Sélectionnez un compte pour renseigner le formulaire, puis cliquez sur{' '}
                <strong className="text-[#202824]">Se connecter</strong> :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DEV_TEST_ACCOUNTS.map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    onClick={() => handlePrefillDevAccount(acct.email, acct.password)}
                    className={`text-left px-2.5 py-2 rounded border transition-colors flex items-center justify-between gap-2 ${
                      email.toLowerCase() === acct.email.toLowerCase()
                        ? 'border-[#173B3F] bg-[#F7F5F0] text-[#173B3F] font-semibold'
                        : 'border-[#E5E0D8] bg-white hover:bg-[#F7F5F0] text-[#202824]'
                    }`}
                  >
                    <span className="truncate text-[11px]">{acct.label}</span>
                    <span className="font-['JetBrains_Mono'] text-[9px] px-1 py-0.5 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[#66736F] shrink-0">
                      {acct.roleBadge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modale de récupération de mot de passe (« Mot de passe oublié ? ») */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div className="bg-white border border-[#E5E0D8] rounded-md max-w-md w-full p-6 sm:p-7 shadow-xl font-['DM_Sans']">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3
                  id="forgot-password-title"
                  className="font-['DM_Serif_Display'] text-2xl text-[#173B3F] font-normal"
                >
                  Réinitialisation du mot de passe
                </h3>
                <p className="text-xs text-[#66736F] mt-1">
                  Parcours sécurisé de récupération de compte professionnel
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-[#66736F] hover:text-[#202824] p-1"
                aria-label="Fermer la fenêtre"
              >
                ✕
              </button>
            </div>

            {recoverySubmitted ? (
              <div className="space-y-4">
                <div className="p-4 rounded bg-[#EDF6EF] border border-[#287A55]/30 text-[#173B3F] text-xs leading-relaxed">
                  <p className="font-semibold text-[#287A55] mb-1">Demande enregistrée</p>
                  <p>
                    Si l&apos;adresse <strong>{recoveryEmail}</strong> correspond à un compte actif
                    de l&apos;entreprise, un lien temporaire de réinitialisation vous sera transmis
                    par email sous quelques minutes.
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded bg-[#173B3F] text-white text-xs font-semibold hover:bg-[#102B2E] transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} noValidate className="space-y-4">
                <p className="text-xs text-[#66736F] leading-relaxed">
                  Saisissez votre adresse email professionnelle. Vous recevrez les instructions
                  sécurisées pour définir un nouveau mot de passe.
                </p>

                {recoveryError && (
                  <div className="p-2.5 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] text-xs font-medium">
                    {recoveryError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-semibold text-[#202824] mb-1.5"
                  >
                    Adresse email professionnelle
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    className="w-full h-11 px-3 rounded border border-[#D5CFC4] bg-[#F7F5F0]/60 text-sm text-[#202824] focus:bg-white focus:outline-none focus:border-[#173B3F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded border border-[#E5E0D8] text-xs font-semibold text-[#202824] hover:bg-[#F7F5F0]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors"
                  >
                    Envoyer le lien sécurisé
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
