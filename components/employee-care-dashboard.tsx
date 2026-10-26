'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Headphones,
  LockKeyhole,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wifi,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface EmployeeReportExchange {
  id: string
  author: string
  date: string
  message: string
}

export interface EmployeeReportItem {
  id: string
  title: string
  category: string
  date: string
  dateValue: number
  status: string
  tone: 'progress' | 'resolved' | 'closed'
  icon: typeof Wifi
  description?: string
  confidentiality?: string
  exchanges?: EmployeeReportExchange[]
}

const initialReports: EmployeeReportItem[] = [
  {
    id: 'EC-2048',
    title: 'Connexion Internet instable',
    category: 'Informatique',
    date: '12 juin 2024',
    dateValue: 20240612,
    status: 'En cours de traitement',
    tone: 'progress',
    icon: Wifi,
    description:
      "La situation a été transmise à l'équipe concernée. Cet espace rassemble les mises à jour, les échanges et les prochaines étapes de traitement.",
    exchanges: [
      {
        id: 'msg-1',
        author: 'Équipe EmployeeCare',
        date: "aujourd'hui",
        message:
          'Bonjour, votre demande est bien prise en compte. Nous revenons vers vous dès que notre analyse est terminée.',
      },
    ],
  },
  {
    id: 'EC-2041',
    title: 'Climatisation du bureau 3B',
    category: 'Conditions de travail',
    date: '05 juin 2024',
    dateValue: 20240605,
    status: 'Résolu',
    tone: 'resolved',
    icon: CheckCircle2,
    description:
      "L'intervention technique sur le système de climatisation du bureau 3B a été effectuée et vérifiée par les services généraux.",
    exchanges: [
      {
        id: 'msg-2',
        author: 'Équipe EmployeeCare',
        date: '06 juin 2024',
        message:
          'Le réglage thermique a été rétabli. Vous pouvez confirmer la résolution si tout fonctionne normalement.',
      },
    ],
  },
  {
    id: 'EC-1987',
    title: 'Suggestion — espace de pause',
    category: 'Suggestions et améliorations',
    date: '28 mai 2024',
    dateValue: 20240528,
    status: 'Clôturé',
    tone: 'closed',
    icon: Sparkles,
    description:
      "Proposition d'aménagement de l'espace de pause au 2e étage transmise à la direction de l'environnement de travail.",
    exchanges: [
      {
        id: 'msg-3',
        author: 'Équipe EmployeeCare',
        date: '30 mai 2024',
        message: 'Merci pour votre suggestion, elle a été intégrée au plan trimestriel.',
      },
    ],
  },
]

export interface EmployeeCareDashboardProps {
  userName?: string
  userEmail?: string
  activeSection?: string
  onSectionChange?: (section: string) => void
  onReturnToResponsable?: () => void
  onLogout?: () => void
  onCreateSignalement?: (payload: {
    id: string
    title: string
    category: string
    description: string
    confidentiality: string
  }) => void
}

export function EmployeeCareDashboard({
  userName = 'Paul Martin',
  userEmail,
  activeSection,
  onSectionChange,
  onReturnToResponsable,
  onLogout,
  onCreateSignalement,
}: EmployeeCareDashboardProps = {}) {
  const [internalNav, setInternalNav] = useState('Accueil')
  const activeNav = activeSection ?? internalNav
  const [reportsList, setReportsList] = useState<EmployeeReportItem[]>(initialReports)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showReportForm, setShowReportForm] = useState(activeSection === 'Créer un signalement')
  const [submitted, setSubmitted] = useState(false)
  const [reportSearch, setReportSearch] = useState('')
  const [reportStatus, setReportStatus] = useState('Tous les statuts')
  const [reportCategory, setReportCategory] = useState('Toutes les catégories')
  const [reportSort, setReportSort] = useState('recent')
  const [reportPage, setReportPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reportType, setReportType] = useState('ordinaire')
  const [newCategory, setNewCategory] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (activeSection === 'Créer un signalement') {
      setShowReportForm(true)
    } else if (activeSection && activeSection !== 'Détail du signalement') {
      setShowReportForm(false)
    }
  }, [activeSection])

  const setActiveNav = (next: string) => {
    setInternalNav(next)
    if (next === 'Créer un signalement') {
      setShowReportForm(true)
    } else if (next !== 'Détail du signalement') {
      setShowReportForm(false)
    }
    if (onSectionChange) {
      onSectionChange(next)
    }
  }

  const firstName = useMemo(() => {
    const first = userName.trim().split(/\s+/)[0]
    return first || 'Paul'
  }, [userName])

  const initials = useMemo(() => {
    const parts = userName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase() || 'PM'
  }, [userName])

  const visibleReports = useMemo(() => {
    const query = reportSearch.trim().toLowerCase()
    return reportsList
      .filter((report) => {
        const matchesSearch = !query || `${report.title} ${report.id} ${report.category}`.toLowerCase().includes(query)
        const matchesStatus = reportStatus === 'Tous les statuts' || report.status === reportStatus
        const matchesCategory = reportCategory === 'Toutes les catégories' || report.category === reportCategory
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => reportSort === 'oldest' ? a.dateValue - b.dateValue : b.dateValue - a.dateValue)
  }, [reportsList, reportSearch, reportSort, reportStatus, reportCategory])

  const openReportForm = () => {
    setSelectedReport(null)
    setSubmitted(false)
    setNewCategory('')
    setNewTitle('')
    setNewDescription('')
    setReportType('ordinaire')
    setShowReportForm(true)
    setActiveNav('Créer un signalement')
  }

  const openReportDetail = (id: string) => {
    setSelectedReport(id)
    setShowReportForm(false)
    setReplyText('')
    setActiveNav('Détail du signalement')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextNumber = 2049 + reportsList.length
    const newId = `EC-${nextNumber}`
    const now = new Date()
    const formattedDate = now.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const dateValue =
      now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const categoryLabel = newCategory || 'Conditions de travail'
    const titleLabel = newTitle.trim() || 'Nouveau signalement'
    const descLabel =
      newDescription.trim() ||
      "La situation a été transmise à l'équipe concernée. Cet espace rassemble les mises à jour, les échanges et les prochaines étapes de traitement."

    const createdReport: EmployeeReportItem = {
      id: newId,
      title: titleLabel,
      category: categoryLabel,
      date: formattedDate,
      dateValue,
      status: 'En cours de traitement',
      tone: 'progress',
      icon: categoryLabel === 'Informatique' ? Wifi : categoryLabel === 'Suggestions et améliorations' ? Sparkles : Clock3,
      description: descLabel,
      confidentiality: reportType,
      exchanges: [
        {
          id: `msg-${Date.now()}`,
          author: 'Équipe EmployeeCare',
          date: "aujourd'hui",
          message:
            'Bonjour, votre signalement a bien été enregistré. Un responsable va prendre en charge votre dossier.',
        },
      ],
    }

    setReportsList((prev) => [createdReport, ...prev])
    if (onCreateSignalement) {
      onCreateSignalement({
        id: newId,
        title: titleLabel,
        category: categoryLabel,
        description: descLabel,
        confidentiality: reportType,
      })
    }
    setSubmitted(true)
  }

  const handleSendExchange = (reportId: string) => {
    const trimmed = replyText.trim()
    if (!trimmed) return
    setReportsList((prev) =>
      prev.map((item) =>
        item.id === reportId
          ? {
              ...item,
              exchanges: [
                ...(item.exchanges ?? []),
                {
                  id: `msg-${Date.now()}`,
                  author: userName,
                  date: "à l'instant",
                  message: trimmed,
                },
              ],
            }
          : item
      )
    )
    setReplyText('')
  }

  const handleConfirmReportResolution = (reportId: string) => {
    setReportsList((prev) =>
      prev.map((item) =>
        item.id === reportId
          ? {
              ...item,
              status: 'Clôturé',
              tone: 'closed',
            }
          : item
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#202824]">
      <header className="border-b border-[#dfe3dd] bg-[#f7f5f0]/95">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-10">
            <a href="#top" onClick={(e) => { e.preventDefault(); setActiveNav('Accueil') }} className="flex items-center gap-3" aria-label="EmployeeCare, accueil">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#173b3f] text-[#f7f5f0]">
                <ShieldCheck aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <span className="font-sans text-[17px] font-semibold tracking-[-0.03em]">EmployeeCare</span>
            </a>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
              {['Accueil', 'Mes signalements', 'Ressources'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveNav(item)}
                  className={`rounded-md px-4 py-2 text-[13px] font-medium transition-colors ${activeNav === item ? 'bg-[#e5e9e3] text-[#173b3f]' : 'text-[#66736f] hover:text-[#173b3f]'}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {onReturnToResponsable && (
              <button
                type="button"
                onClick={onReturnToResponsable}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-[#cbd8ce] bg-white px-3 py-1.5 text-xs font-semibold text-[#173b3f] hover:bg-[#e5e9e3] transition-colors mr-1"
              >
                ← Espace Responsable
              </button>
            )}
            <div className="relative">
              <button
                aria-label="Voir les notifications"
                aria-expanded={showNotifications}
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
                className="flex size-10 items-center justify-center rounded-full text-[#66736f] transition-colors hover:bg-[#e8ebe6] hover:text-[#173b3f]"
              >
                <Bell className="size-[18px]" strokeWidth={1.8} />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#a86412]" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-20 w-72 border border-[#dfe3dd] bg-white p-4 shadow-[0_16px_40px_rgba(32,40,36,0.12)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#66736f]">Notifications</p>
                  <p className="mt-3 text-sm leading-5 text-[#202824]">Votre signalement EC-2048 a été pris en charge par Sophie Dubois.</p>
                  <p className="mt-2 text-xs text-[#66736f]">Il y a 2 heures</p>
                </div>
              )}
            </div>
            <div className="hidden h-7 w-px bg-[#dfe3dd] md:block" />
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
                aria-expanded={showProfileMenu}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left hover:bg-[#e8ebe6] transition-colors"
                aria-label={`Ouvrir le profil de ${userName}`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#dce8e1] text-xs font-semibold text-[#173b3f]">{initials}</span>
                <span className="pr-1 text-[13px] font-medium">{userName}</span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-20 w-64 border border-[#dfe3dd] bg-white p-4 shadow-[0_16px_40px_rgba(32,40,36,0.12)]">
                  <p className="text-xs font-semibold text-[#173b3f]">{userName}</p>
                  {userEmail && <p className="mt-0.5 text-[11px] text-[#66736f] truncate">{userEmail}</p>}
                  <div className="mt-3 pt-3 border-t border-[#dfe3dd] flex flex-col gap-1.5">
                    {onReturnToResponsable && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false)
                          onReturnToResponsable()
                        }}
                        className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-[#173b3f] hover:bg-[#f7f5f0] transition-colors"
                      >
                        Retourner à l&apos;espace Responsable
                      </button>
                    )}
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false)
                          onLogout()
                        }}
                        className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-[#b42332] hover:bg-[#fdecec] transition-colors"
                      >
                        Se déconnecter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden sm:inline-flex items-center rounded-md border border-[#dfe3dd] bg-white px-3 py-1.5 text-xs font-medium text-[#202824] hover:bg-[#e8ebe6] transition-colors"
              >
                Se déconnecter
              </button>
            )}
            <button className="flex size-10 items-center justify-center rounded-md md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Ouvrir le menu">
              {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav className="flex flex-col gap-1 border-t border-[#dfe3dd] px-5 py-3 md:hidden" aria-label="Navigation mobile">
            {['Accueil', 'Mes signalements', 'Ressources'].map((item) => (
              <button key={item} onClick={() => { setActiveNav(item); setMobileMenu(false) }} className="px-3 py-3 text-left text-sm font-medium text-[#173b3f]">
                {item}
              </button>
            ))}
            {onReturnToResponsable && (
              <button type="button" onClick={() => { setMobileMenu(false); onReturnToResponsable() }} className="px-3 py-3 text-left text-sm font-semibold text-[#287a55] border-t border-[#dfe3dd]">
                ← Espace Responsable
              </button>
            )}
            {onLogout && (
              <button type="button" onClick={() => { setMobileMenu(false); onLogout() }} className="px-3 py-3 text-left text-sm font-semibold text-[#b42332] border-t border-[#dfe3dd]">
                Se déconnecter
              </button>
            )}
          </nav>
        )}
      </header>

      <main id="top" className="mx-auto max-w-[1200px] px-5 pb-16 pt-10 md:px-10 md:pt-16">
        {activeNav === 'Accueil' && !showReportForm && <section className="grid items-end gap-10 border-b border-[#dfe3dd] pb-12 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]"><span className="size-1.5 rounded-full bg-[#287a55]" />Espace personnel</p>
            <h1 className="max-w-[620px] font-serif text-[clamp(2.45rem,5.2vw,4.5rem)] leading-[0.98] tracking-[-0.06em] text-[#173b3f]">Bonjour {firstName},<br /><em className="font-normal text-[#287a55]">que pouvons-nous</em><br />faire pour vous ?</h1>
            <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-[#66736f]">Signalez une situation, suivez vos demandes et retrouvez les réponses de votre entreprise au même endroit.</p>
          </div>
          <div className="relative overflow-hidden border-2 border-[#287a55] bg-[#e4eee7] p-7 shadow-[0_12px_28px_rgba(40,122,85,0.10)] lg:mb-1">
            <div className="absolute -right-8 -top-8 size-28 rounded-full border border-[#b6cdbd]" />
            <div className="absolute -right-3 -top-3 size-14 rounded-full border border-[#b6cdbd]" />
            <div className="relative flex items-start justify-between">
              <button
                type="button"
                onClick={openReportForm}
                aria-label="Créer un nouveau signalement"
                title="Créer un signalement"
                className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#287a55] text-white transition-all hover:scale-105 hover:bg-[#216647] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173b3f] focus-visible:ring-offset-2"
              >
                <Plus className="size-5" />
              </button>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#287a55]">Nouveau</span>
            </div>
            <h2 className="relative mt-12 text-[21px] font-semibold tracking-[-0.03em] text-[#173b3f]">Un problème à signaler ?</h2>
            <p className="relative mt-2 max-w-[260px] text-[13px] leading-5 text-[#587064]">Quelques minutes suffisent pour nous aider à comprendre et agir.</p>
            <Button type="button" onClick={openReportForm} className="relative mt-5 rounded-md bg-[#173b3f] px-4 text-sm text-white hover:bg-[#24575a]">Créer un signalement <ArrowUpRight data-icon="inline-end" /></Button>
          </div>
        </section>}

        {(showReportForm || activeNav === 'Créer un signalement') && <section className="min-h-[calc(100vh-76px)] border-b border-[#dfe3dd] py-10 md:py-14">
          <div className="mx-auto max-w-4xl">
            <button type="button" onClick={() => { setShowReportForm(false); setActiveNav('Accueil') }} className="mb-8 text-[12px] font-semibold text-[#287a55] hover:text-[#173b3f]">← Retour à l&apos;accueil</button>
            {submitted ? <div className="border border-[#cbd8ce] bg-[#e4eee7] p-8">
              <CheckCircle2 className="size-7 text-[#287a55]" />
              <h1 className="mt-5 font-serif text-[38px] tracking-[-0.05em] text-[#173b3f]">Signalement envoyé</h1>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-[#587064]">Votre demande a bien été enregistrée sous la référence <strong>{reportsList[0]?.id}</strong>. Vous pourrez suivre son avancement dans « Mes signalements ».</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={() => { setShowReportForm(false); setActiveNav('Mes signalements') }} className="rounded-md bg-[#173b3f] text-white hover:bg-[#24575a]">Voir mes signalements</Button>
                <Button type="button" variant="outline" onClick={() => { setShowReportForm(false); setActiveNav('Accueil') }} className="rounded-md border-[#cbd8ce] text-[#173b3f]">Retour à l&apos;accueil</Button>
              </div>
            </div> : <form onSubmit={handleSubmit} className="border border-[#dfe3dd] bg-white p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Nouveau signalement</p>
              <h1 className="mt-3 font-serif text-[40px] tracking-[-0.05em] text-[#173b3f]">Que souhaitez-vous signaler ?</h1>
              <p className="mt-3 text-[14px] leading-6 text-[#66736f]">Choisissez le niveau d&apos;accès adapté à votre situation, puis décrivez les faits avec précision.</p>
              <fieldset className="mt-8"><legend className="text-[13px] font-semibold text-[#173b3f]">Comment souhaitez-vous être identifié ?</legend><div className="mt-3 grid gap-3 md:grid-cols-3"><label className="cursor-pointer border border-[#cbd8ce] bg-[#f7f5f0] p-4 has-[:checked]:border-[#287a55] has-[:checked]:bg-[#e4eee7]"><input required type="radio" name="report-type" value="ordinaire" checked={reportType === 'ordinaire'} onChange={() => setReportType('ordinaire')} className="sr-only" /><span className="font-semibold text-[#173b3f]">Ordinaire</span><span className="mt-1 block text-xs leading-5 text-[#66736f]">Votre identité accompagne le dossier pour faciliter le suivi.</span></label><label className="cursor-pointer border border-[#cbd8ce] bg-[#f7f5f0] p-4 has-[:checked]:border-[#287a55] has-[:checked]:bg-[#e4eee7]"><input type="radio" name="report-type" value="confidentiel" checked={reportType === 'confidentiel'} onChange={() => setReportType('confidentiel')} className="sr-only" /><span className="font-semibold text-[#173b3f]">Confidentiel</span><span className="mt-1 block text-xs leading-5 text-[#66736f]">Votre identité est visible uniquement par les personnes habilitées.</span></label><label className="cursor-pointer border border-[#cbd8ce] bg-[#f7f5f0] p-4 has-[:checked]:border-[#287a55] has-[:checked]:bg-[#e4eee7]"><input type="radio" name="report-type" value="anonyme" checked={reportType === 'anonyme'} onChange={() => setReportType('anonyme')} className="sr-only" /><span className="font-semibold text-[#173b3f]">Anonyme</span><span className="mt-1 block text-xs leading-5 text-[#66736f]">Aucune identité n&apos;est demandée dans ce formulaire.</span></label></div><p className="mt-3 text-xs leading-5 text-[#66736f]">Ces options décrivent le traitement prévu dans cette interface. Un véritable anonymat nécessite une protection technique côté serveur et une politique d&apos;accès dédiée.</p></fieldset>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-[13px] font-semibold text-[#173b3f]">Catégorie<select required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-11 rounded-md border border-[#cbd8ce] bg-[#f7f5f0] px-3 font-normal text-[#202824] outline-none focus:border-[#287a55]"><option value="">Sélectionner une catégorie</option><option value="Conditions de travail">Conditions de travail</option><option value="Informatique">Informatique</option><option value="Relations au travail">Relations au travail</option><option value="Harcèlement ou discrimination">Harcèlement ou discrimination</option><option value="Suggestions et améliorations">Suggestions et améliorations</option></select></label>
                <div className="border border-[#cbd8ce] bg-[#f7f5f0] p-4 text-[13px] text-[#587064]"><p className="font-semibold text-[#173b3f]">Traitement choisi : {reportType === 'ordinaire' ? 'ordinaire' : reportType === 'confidentiel' ? 'confidentiel' : 'anonyme'}</p><p className="mt-1 leading-5">Le niveau d&apos;accès est défini par votre choix ci-dessus. Cette démonstration ne promet pas de protection technique qui n&apos;est pas encore configurée.</p></div>
              </div>
              <label className="mt-5 grid gap-2 text-[13px] font-semibold text-[#173b3f]">Objet<input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex. Une situation qui nécessite votre attention" className="h-11 rounded-md border border-[#cbd8ce] bg-[#f7f5f0] px-3 font-normal text-[#202824] outline-none placeholder:text-[#8a9590] focus:border-[#287a55]" /></label>
              <label className="mt-5 grid gap-2 text-[13px] font-semibold text-[#173b3f]">Décrivez la situation<textarea required rows={5} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Que s&apos;est-il passé ? Quand et où ?" className="resize-none rounded-md border border-[#cbd8ce] bg-[#f7f5f0] px-3 py-3 font-normal leading-6 text-[#202824] outline-none placeholder:text-[#8a9590] focus:border-[#287a55]" /></label>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" onClick={() => { setShowReportForm(false); setActiveNav('Accueil') }} variant="outline" className="rounded-md border-[#cbd8ce] text-[#173b3f]">Annuler</Button><Button type="submit" className="rounded-md bg-[#173b3f] text-white hover:bg-[#24575a]">Envoyer le signalement <ArrowUpRight data-icon="inline-end" /></Button></div>
            </form>}
          </div>
        </section>}

        {activeNav === 'Accueil' && !showReportForm && <section className="grid gap-12 py-12 lg:grid-cols-[1fr_330px]">
          <div>
            <div className="mb-6 flex items-end justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Votre activité</p><h2 className="mt-2 font-serif text-[32px] tracking-[-0.04em] text-[#173b3f]">Vos signalements</h2></div><button type="button" onClick={() => setActiveNav('Mes signalements')} className="hidden items-center gap-2 text-[13px] font-semibold text-[#287a55] hover:text-[#173b3f] sm:flex">Voir tout <ChevronRight className="size-4" /></button></div>
            <div className="divide-y divide-[#dfe3dd] border-y border-[#dfe3dd]">{reportsList.map((report) => { const Icon = report.icon; return <button type="button" key={report.id} onClick={() => openReportDetail(report.id)} className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-[#eef1ec] sm:gap-5"><span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${report.tone === 'progress' ? 'bg-[#f5e8cf] text-[#a86412]' : report.tone === 'resolved' ? 'bg-[#dcebe1] text-[#287a55]' : 'bg-[#e8ebe6] text-[#66736f]'}`}><Icon className="size-[17px]" strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="truncate text-[14px] font-semibold text-[#202824]">{report.title}</span><span className="text-[11px] font-medium text-[#8a9590]">{report.id}</span></span><span className="mt-1 block text-[12px] text-[#66736f]">{report.category} <span className="mx-1 text-[#b7c0ba]">·</span> {report.date}</span></span><span className={`hidden text-right text-[12px] font-medium sm:block ${report.tone === 'progress' ? 'text-[#a86412]' : report.tone === 'resolved' ? 'text-[#287a55]' : 'text-[#66736f]'}`}>{report.status}</span><ChevronRight className="size-4 shrink-0 text-[#a0aaa4] transition-transform group-hover:translate-x-1" /></button> })}</div>
            <button type="button" onClick={() => setActiveNav('Mes signalements')} className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-[#287a55] sm:hidden">Voir tous les signalements <ChevronRight className="size-4" /></button>
          </div>

          <aside className="border-l border-[#dfe3dd] pl-0 lg:pl-9"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">À savoir</p><div className="mt-5 flex gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#287a55]" strokeWidth={1.8} /><div><h3 className="text-[15px] font-semibold text-[#173b3f]">Vos informations sont protégées</h3><p className="mt-2 text-[13px] leading-6 text-[#66736f]">Votre signalement est visible uniquement par les personnes habilitées à le traiter. Vous choisissez le niveau de confidentialité adapté à votre situation.</p><button type="button" onClick={() => setActiveNav('Ressources')} className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-[#287a55] hover:text-[#173b3f]">Comprendre la confidentialité <ArrowUpRight className="size-3.5" /></button></div></div><div className="mt-10 border-t border-[#dfe3dd] pt-6"><div className="flex items-center gap-3"><Headphones className="size-5 text-[#173b3f]" strokeWidth={1.8} /><span className="text-[14px] font-semibold text-[#173b3f]">Besoin d'aide ?</span></div><p className="mt-2 text-[13px] leading-6 text-[#66736f]">Consultez les ressources internes ou contactez votre référent.</p><button type="button" onClick={() => setActiveNav('Ressources')} className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#287a55] hover:text-[#173b3f]">Accéder aux ressources <ChevronRight className="size-3.5" /></button></div></aside>
        </section>}

        {activeNav === 'Mes signalements' && !showReportForm && <section className="border-y border-[#dfe3dd] py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Votre activité</p><h1 className="mt-3 font-serif text-[42px] tracking-[-0.05em] text-[#173b3f]">Mes signalements</h1><p className="mt-4 max-w-xl text-[15px] leading-7 text-[#66736f]">Retrouvez ici l&apos;historique de vos demandes et leur état d&apos;avancement.</p></div>
            <Button type="button" onClick={openReportForm} className="w-fit rounded-md bg-[#173b3f] text-white hover:bg-[#24575a]"><Plus data-icon="inline-start" /> Nouveau signalement</Button>
          </div>
          <div className="mt-8 grid gap-3 border-y border-[#dfe3dd] py-4 md:grid-cols-[1fr_190px_190px_180px]">
            <label className="relative"><span className="sr-only">Rechercher un signalement</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a9590]" /><input value={reportSearch} onChange={(event) => setReportSearch(event.target.value)} placeholder="Rechercher par mot-clé ou identifiant" className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white pl-9 pr-3 text-sm text-[#202824] outline-none placeholder:text-[#8a9590] focus:border-[#287a55]" /></label>
            <label><span className="sr-only">Filtrer par statut</span><select value={reportStatus} onChange={(event) => setReportStatus(event.target.value)} className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#202824] outline-none focus:border-[#287a55]"><option>Tous les statuts</option><option>En cours de traitement</option><option>Résolu</option><option>Clôturé</option></select></label>
            <label><span className="sr-only">Filtrer par catégorie</span><select value={reportCategory} onChange={(event) => { setReportCategory(event.target.value); setReportPage(1) }} className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#202824] outline-none focus:border-[#287a55]"><option>Toutes les catégories</option><option>Informatique</option><option>Conditions de travail</option><option>Relations au travail</option><option>Harcèlement ou discrimination</option><option>Suggestions et améliorations</option></select></label>
            <label><span className="sr-only">Trier les signalements</span><select value={reportSort} onChange={(event) => setReportSort(event.target.value)} className="h-10 w-full rounded-md border border-[#cbd8ce] bg-white px-3 text-sm text-[#202824] outline-none focus:border-[#287a55]"><option value="recent">Date : plus récente</option><option value="oldest">Date : plus ancienne</option></select></label>
          </div>
          <div className="divide-y divide-[#dfe3dd] border-b border-[#dfe3dd]">{visibleReports.length > 0 ? visibleReports.map((report) => { const Icon = report.icon; return <button type="button" key={report.id} onClick={() => openReportDetail(report.id)} className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-[#eef1ec] sm:gap-5"><span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${report.tone === 'progress' ? 'bg-[#f5e8cf] text-[#a86412]' : report.tone === 'resolved' ? 'bg-[#dcebe1] text-[#287a55]' : 'bg-[#e8ebe6] text-[#66736f]'}`}><Icon className="size-[17px]" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="truncate font-semibold text-[#202824]">{report.title}</span><span className="text-[11px] font-medium text-[#8a9590]">{report.id}</span></span><span className="mt-1 block text-xs text-[#66736f]">{report.category} <span className="mx-1 text-[#b7c0ba]">·</span> {report.date}</span></span><span className={`hidden text-right text-xs font-medium sm:block ${report.tone === 'progress' ? 'text-[#a86412]' : report.tone === 'resolved' ? 'text-[#287a55]' : 'text-[#66736f]'}`}>{report.status}</span><ChevronRight className="size-4 shrink-0 text-[#a0aaa4] transition-transform group-hover:translate-x-1" /></button> }) : <div className="py-12 text-center"><Search className="mx-auto size-6 text-[#8a9590]" /><p className="mt-3 text-sm font-semibold text-[#173b3f]">Aucun signalement trouvé</p><p className="mt-1 text-sm text-[#66736f]">Modifiez votre recherche ou vos filtres.</p></div>}</div>
          <p className="mt-4 text-xs text-[#8a9590]">{visibleReports.length} signalement{visibleReports.length > 1 ? 's' : ''} affiché{visibleReports.length > 1 ? 's' : ''}</p>
        </section>}
        {activeNav === 'Détail du signalement' && selectedReport && (() => { const report = reportsList.find((item) => item.id === selectedReport) ?? reportsList[0]; return <section className="border-y border-[#dfe3dd] py-12"><button type="button" onClick={() => setActiveNav('Mes signalements')} className="mb-8 text-[12px] font-semibold text-[#287a55] hover:text-[#173b3f]">← Retour à mes signalements</button><div className="grid gap-10 lg:grid-cols-[1fr_320px]"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Suivi du signalement · {report.id}</p><h1 className="mt-3 max-w-2xl font-serif text-[42px] leading-tight tracking-[-0.05em] text-[#173b3f]">{report.title}</h1><p className="mt-4 text-[14px] text-[#66736f]">{report.category} · Créé le {report.date}</p><div className="mt-10 border-y border-[#dfe3dd] py-7"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Description</p><p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#202824]">{report.description || "La situation a été transmise à l'équipe concernée. Cet espace rassemble les mises à jour, les échanges et les prochaines étapes de traitement."}</p></div><div className="mt-10"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Évolution du traitement</p><div className="mt-5 border-l border-[#b8c9bd] pl-6"><div className="relative pb-7"><span className="absolute -left-[31px] top-1 size-2.5 rounded-full bg-[#287a55]" /><p className="text-sm font-semibold text-[#173b3f]">Signalement reçu</p><p className="mt-1 text-xs text-[#66736f]">{report.date} · Votre demande a été enregistrée.</p></div><div className="relative pb-7"><span className="absolute -left-[31px] top-1 size-2.5 rounded-full bg-[#287a55]" /><p className="text-sm font-semibold text-[#173b3f]">Pris en charge</p><p className="mt-1 text-xs text-[#66736f]">Un référent analyse actuellement votre demande.</p></div><div className="relative"><span className="absolute -left-[31px] top-1 size-2.5 rounded-full border-2 border-[#a86412] bg-[#f7f5f0]" /><p className="text-sm font-semibold text-[#a86412]">{report.status}</p><p className="mt-1 text-xs text-[#66736f]">Une nouvelle mise à jour vous sera communiquée ici.</p></div></div></div><div className="mt-10 border-t border-[#dfe3dd] pt-7"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Échanges</p><div className="mt-4 space-y-3">{(report.exchanges ?? []).map((ex) => (<div key={ex.id} className="border border-[#dfe3dd] bg-white p-5"><p className="text-sm leading-6 text-[#202824]">{ex.message}</p><p className="mt-3 text-xs text-[#8a9590]">{ex.author} · {ex.date}</p></div>))}</div><textarea rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Écrire un message au responsable" className="mt-3 w-full resize-none border border-[#cbd8ce] bg-[#f7f5f0] px-3 py-3 text-sm outline-none focus:border-[#287a55]" /><Button type="button" onClick={() => handleSendExchange(report.id)} className="mt-3 rounded-md bg-[#173b3f] text-white hover:bg-[#24575a]">Envoyer un message</Button></div></div><aside className="h-fit border-l border-[#dfe3dd] pl-0 lg:pl-8"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Statut actuel</p><p className="mt-4 text-lg font-semibold text-[#a86412]">{report.status}</p><div className="mt-8 border-t border-[#dfe3dd] pt-6"><p className="text-sm font-semibold text-[#173b3f]">Prochaine étape</p><p className="mt-2 text-sm leading-6 text-[#66736f]">Le responsable poursuit l&apos;instruction et vous notifiera de la prochaine décision.</p></div>{report.status === 'Résolu' && <Button type="button" onClick={() => handleConfirmReportResolution(report.id)} className="mt-7 w-full rounded-md bg-[#287a55] text-white hover:bg-[#226646]">Confirmer la résolution</Button>}</aside></div></section> })()}
        {activeNav === 'Ressources' && !showReportForm && <section className="border-y border-[#dfe3dd] py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#66736f]">Centre d&apos;aide</p>
          <h1 className="mt-3 font-serif text-[42px] tracking-[-0.05em] text-[#173b3f]">Ressources</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#66736f]">Les informations utiles pour comprendre vos droits, signaler une situation et être accompagné.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="border border-[#dfe3dd] bg-white p-6"><FileText className="size-5 text-[#287a55]" /><h2 className="mt-5 font-semibold text-[#173b3f]">Guide du signalement</h2><p className="mt-2 text-sm leading-6 text-[#66736f]">Les étapes et les bonnes pratiques pour faire un signalement.</p></div><div className="border border-[#dfe3dd] bg-white p-6"><LockKeyhole className="size-5 text-[#287a55]" /><h2 className="mt-5 font-semibold text-[#173b3f]">Confidentialité</h2><p className="mt-2 text-sm leading-6 text-[#66736f]">Comprendre qui peut accéder à vos informations.</p></div><div className="border border-[#dfe3dd] bg-white p-6"><Headphones className="size-5 text-[#287a55]" /><h2 className="mt-5 font-semibold text-[#173b3f]">Besoin d&apos;aide ?</h2><p className="mt-2 text-sm leading-6 text-[#66736f]">Contactez votre référent ou consultez le centre d&apos;aide.</p></div></div>
        </section>}
        <footer className="flex flex-col gap-3 border-t border-[#dfe3dd] pt-6 text-[11px] text-[#8a9590] sm:flex-row sm:items-center sm:justify-between"><span>EmployeeCare · Espace employé</span><div className="flex gap-5"><a href="#confidentialite" onClick={(e) => { e.preventDefault(); setActiveNav('Ressources') }} className="hover:text-[#173b3f]">Confidentialité</a><a href="#aide" onClick={(e) => { e.preventDefault(); setActiveNav('Ressources') }} className="hover:text-[#173b3f]">Centre d'aide</a><span className="flex items-center gap-1"><CircleHelp className="size-3.5" /> Besoin d'assistance</span></div></footer>
      </main>
    </div>
  )
}
