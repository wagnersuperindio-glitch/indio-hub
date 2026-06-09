'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AGENTES, CATEGORIAS, type Agente, type Categoria } from '@/data/agentes'
import AgentCard from '@/components/hub/AgentCard'
import ChatPanel from '@/components/hub/ChatPanel'
import { LogOut, Search, LayoutGrid, Bot, Zap, CheckCircle2, Clock, Mail, FolderOpen } from 'lucide-react'

// ─── AUTOMAÇÕES ATIVAS ────────────────────────────────────────
const AUTOMACOES = [
  {
    id: 'relatorio-diario',
    nome: 'Relatório Diário de Lojas',
    emoji: '📊',
    descricao: 'KPIs das 10 lojas, semáforo de performance, alertas de margem crítica e CMV.',
    horario: 'Todo dia · 07:31',
    proximaRun: 'Amanhã 07:31',
    destinatarios: ['Wagner', 'David', 'Carolina', 'Nicolas'],
    salvaNaPasta: 'RELATORIOS DIARIOS/YYYY-MM-DD.html',
    status: 'ativo',
    cor: '#1565C0',
    corClara: '#E3F2FD',
  },
  {
    id: 'pricing-diario',
    nome: 'Pricing Diário — Margens',
    emoji: '💰',
    descricao: 'Margens por loja e categoria. Às segundas inclui consolidado semanal; no dia 1 inclui fechamento mensal.',
    horario: 'Todo dia · 07:40',
    proximaRun: 'Amanhã 07:40',
    destinatarios: ['Wagner', 'David', 'Nicolas'],
    salvaNaPasta: 'RELATORIOS DIARIOS/YYYY-MM-DD-pricing.html',
    status: 'ativo',
    cor: '#2E7D32',
    corClara: '#E8F5E9',
  },
  {
    id: 'perdas-semanal',
    nome: 'Relatório de Perdas Semanal',
    emoji: '🛡️',
    descricao: 'Quebras por loja e setor vs benchmark. Causa-raiz e plano de ação automático.',
    horario: 'Terça-feira · 08:08',
    proximaRun: '16/Jun 08:08',
    destinatarios: ['Wagner', 'David', 'Carolina', 'Nicolas'],
    salvaNaPasta: 'RELATORIOS DIARIOS/YYYY-MM-DD-perdas.html',
    status: 'ativo',
    cor: '#B71C1C',
    corClara: '#FFEBEE',
  },
  {
    id: 'concorrentes',
    nome: 'Inteligência Competitiva',
    emoji: '🔎',
    descricao: 'Monitoramento de preços e encartes dos concorrentes via Instagram. Marques, Codebal, Eldorado, Santos, Macromix.',
    horario: 'Terça e Sexta · 07:34',
    proximaRun: '12/Jun 07:34',
    destinatarios: ['Wagner', 'David', 'Nicolas'],
    salvaNaPasta: 'RELATORIOS DIARIOS/YYYY-MM-DD-concorrentes.html + .xlsx',
    status: 'ativo',
    cor: '#004D40',
    corClara: '#E0F2F1',
  },
  {
    id: 'relatorio-semanal-excel',
    nome: 'Relatório Semanal Excel',
    emoji: '📋',
    descricao: '6 abas de KPIs consolidados + envio para Notion. Inclui financeiro, fiscal tributário e pricing.',
    horario: 'Segunda-feira · 07:31',
    proximaRun: 'Próxima Segunda 07:31',
    destinatarios: ['Wagner', 'David', 'Nicolas', 'Financeiro', 'Fiscal', 'Carolina', 'Pricing'],
    salvaNaPasta: 'Relatorio_Lojas_YYYY_MM.xlsx',
    status: 'ativo',
    cor: '#E65100',
    corClara: '#FFF3E0',
  },
]

export default function HubPage() {
  const router = useRouter()
  const [agenteAtivo, setAgenteAtivo] = useState<Agente | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [view, setView] = useState<'agentes' | 'automacoes'>('agentes')

  const agenteFiltrados = AGENTES.filter(a => {
    const matchCategoria = categoriaFiltro === 'todos' || a.categoria === categoriaFiltro
    const matchBusca = !busca ||
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      a.capacidades.some(c => c.toLowerCase().includes(busca.toLowerCase()))
    return matchCategoria && matchBusca
  })

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  function abrirAgente(agente: Agente) {
    if (agente.url && (agente.tipo === 'link' || agente.tipo === 'ambos')) {
      window.open(agente.url, '_blank')
      return
    }
    setAgenteAtivo(agente)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-4 py-2 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderBottom: '3px solid #E65100' }}>

        {/* Logo + Mascote */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-12 h-12 drop-shadow-lg">
            <Image src="/mascote-novo.png" alt="Mascote Índio" fill className="object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-24 hidden sm:block">
              <Image src="/logo.png" alt="Supermercados Índio" fill className="object-contain object-left" />
            </div>
            <div className="sm:hidden">
              <span className="text-lg font-black text-white">ÍNDIO</span>
            </div>
            <div className="h-6 w-px bg-white/20 mx-1" />
            <div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest leading-none">HUB</p>
              <p className="text-white/40 text-xs leading-none">Central de Agentes</p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="flex-1 max-w-md mx-auto relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={busca}
            onChange={e => { setBusca(e.target.value); setView('agentes') }}
            placeholder="Buscar agente ou capacidade..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Tabs view + Info + Logout */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/15 hidden sm:flex">
            <button onClick={() => setView('agentes')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition"
              style={{ background: view === 'agentes' ? '#E65100' : 'transparent', color: view === 'agentes' ? 'white' : 'rgba(255,255,255,0.5)' }}>
              <Bot size={13} /> Agentes
            </button>
            <button onClick={() => setView('automacoes')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition"
              style={{ background: view === 'automacoes' ? '#E65100' : 'transparent', color: view === 'automacoes' ? 'white' : 'rgba(255,255,255,0.5)' }}>
              <Zap size={13} /> Automações
            </button>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-white/80 text-sm font-semibold leading-none">Grupo Índio</p>
            <p className="text-white/40 text-xs">{AGENTES.length} agentes · {AUTOMACOES.length} automações</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-sm">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR CATEGORIAS (só na view de agentes) ─────── */}
        {view === 'agentes' && (
          <aside className="w-48 flex-shrink-0 p-3 border-r bg-white hidden md:flex flex-col gap-1"
            style={{ borderColor: '#E2E8F0' }}>

            <div className="flex justify-center py-3 mb-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <div className="relative w-16 h-16">
                <Image src="/mascote-novo.png" alt="Mascote" fill className="object-contain" />
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <LayoutGrid size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias</span>
            </div>

            <button
              onClick={() => setCategoriaFiltro('todos')}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: categoriaFiltro === 'todos' ? '#0D1B2A' : 'transparent',
                color: categoriaFiltro === 'todos' ? 'white' : '#6B7280',
              }}>
              <span>🤖 Todos</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={categoriaFiltro === 'todos'
                  ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                  : { background: '#F3F4F6', color: '#9CA3AF' }}>
                {AGENTES.length}
              </span>
            </button>

            {(Object.entries(CATEGORIAS) as [Categoria, typeof CATEGORIAS[Categoria]][]).map(([key, cat]) => {
              const count = AGENTES.filter(a => a.categoria === key).length
              const ativo = categoriaFiltro === key
              return (
                <button key={key}
                  onClick={() => setCategoriaFiltro(key)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: ativo ? cat.cor + '15' : 'transparent',
                    color: ativo ? cat.cor : '#6B7280',
                    borderLeft: ativo ? `3px solid ${cat.cor}` : '3px solid transparent',
                  }}>
                  <span>{cat.emoji} {cat.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: ativo ? cat.cor + '20' : '#F3F4F6',
                      color: ativo ? cat.cor : '#9CA3AF'
                    }}>
                    {count}
                  </span>
                </button>
              )
            })}

            {/* Logo no rodapé da sidebar */}
            <div className="mt-auto pt-3 border-t" style={{ borderColor: '#F1F5F9' }}>
              <div className="relative h-8 w-full">
                <Image src="/logo.png" alt="Índio" fill className="object-contain object-center" />
              </div>
              <p className="text-center text-xs text-gray-300 mt-1">❤ Juntos Somos Mais Fortes</p>
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5">

          {/* ── VIEW: AGENTES ─────────────────────────────────── */}
          {view === 'agentes' && (
            <>
              {/* Banner topo */}
              {!busca && categoriaFiltro === 'todos' && (
                <div className="mb-5 rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderLeft: '5px solid #E65100' }}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image src="/mascote-novo.png" alt="Mascote" fill className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-black text-white text-lg leading-tight">
                        🪶 Central de Agentes — <span style={{ color: '#FF8C42' }}>Grupo Supermercados Índio</span>
                      </h2>
                      <p className="text-white/50 text-sm mt-0.5">
                        Clique num agente para abrir o chat. Agentes com painel próprio abrem direto no sistema.
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden lg:flex gap-4 flex-shrink-0">
                      {[
                        { v: AGENTES.length, l: 'Agentes' },
                        { v: AUTOMACOES.length, l: 'Automações' },
                        { v: '10', l: 'Lojas' },
                        { v: '7', l: 'Dias/semana' },
                      ].map(s => (
                        <div key={s.l} className="text-center">
                          <div className="text-2xl font-black" style={{ color: '#FF8C42' }}>{s.v}</div>
                          <div className="text-white/40 text-xs">{s.l}</div>
                        </div>
                      ))}
                    </div>

                    <div className="relative h-10 w-28 flex-shrink-0 hidden sm:block">
                      <Image src="/logo.png" alt="Índio" fill className="object-contain object-right" />
                    </div>
                  </div>
                </div>
              )}

              {agenteFiltrados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-medium">Nenhum agente encontrado para &quot;{busca}&quot;</p>
                  <button onClick={() => { setBusca(''); setCategoriaFiltro('todos') }}
                    className="mt-3 text-sm underline">Limpar filtros</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {agenteFiltrados.map(agente => (
                    <AgentCard
                      key={agente.id}
                      agente={agente}
                      ativo={agenteAtivo?.id === agente.id}
                      onClick={() => abrirAgente(agente)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── VIEW: AUTOMAÇÕES ──────────────────────────────── */}
          {view === 'automacoes' && (
            <div className="max-w-4xl mx-auto">

              {/* Banner automações */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderLeft: '5px solid #E65100' }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'rgba(230,81,0,0.2)' }}>
                    ⚡
                  </div>
                  <div className="flex-1">
                    <h2 className="font-black text-white text-lg">Automações Ativas — Grupo Índio</h2>
                    <p className="text-white/50 text-sm mt-0.5">
                      {AUTOMACOES.length} tarefas agendadas · Execução autônoma autorizada pelo CEO Wagner Antonelli
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">Todas ativas</span>
                  </div>
                </div>
              </div>

              {/* Cards de automação */}
              <div className="space-y-4">
                {AUTOMACOES.map(auto => (
                  <div key={auto.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border"
                    style={{ borderColor: '#E2E8F0', borderLeft: `4px solid ${auto.cor}` }}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">

                        {/* Emoji */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: auto.corClara }}>
                          {auto.emoji}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">{auto.nome}</h3>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: '#DCFCE7', color: '#16A34A' }}>
                              <CheckCircle2 size={10} /> Ativo
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{auto.descricao}</p>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {/* Horário */}
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} style={{ color: auto.cor }} />
                              <span className="font-medium" style={{ color: auto.cor }}>{auto.horario}</span>
                            </div>

                            {/* Próxima execução */}
                            <div className="flex items-center gap-1.5">
                              <Zap size={13} className="text-gray-400" />
                              <span>Próxima: <b className="text-gray-700">{auto.proximaRun}</b></span>
                            </div>

                            {/* Pasta */}
                            <div className="flex items-center gap-1.5">
                              <FolderOpen size={13} className="text-gray-400" />
                              <span className="font-mono text-gray-400">{auto.salvaNaPasta}</span>
                            </div>
                          </div>
                        </div>

                        {/* Destinatários */}
                        <div className="flex-shrink-0 hidden sm:block">
                          <div className="flex items-center gap-1 mb-1">
                            <Mail size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Destinatários</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[160px] justify-end">
                            {auto.destinatarios.map(d => (
                              <span key={d} className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: auto.corClara, color: auto.cor }}>
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rodapé de autorização */}
              <div className="mt-6 p-4 rounded-2xl text-center"
                style={{ background: 'rgba(230,81,0,0.06)', border: '1px dashed rgba(230,81,0,0.3)' }}>
                <p className="text-sm text-gray-500">
                  ✅ <b className="text-gray-700">Autorização permanente concedida</b> pelo CEO Wagner Antonelli ·
                  Execução autônoma sem necessidade de confirmação ·
                  <span className="text-orange-500 font-medium"> Revogação a qualquer momento</span>
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ── PAINEL LATERAL DE CHAT ────────────────────────── */}
        {agenteAtivo && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setAgenteAtivo(null)} />
            <aside className="fixed md:relative right-0 top-0 md:top-auto h-full md:h-auto
              w-full max-w-md md:w-[420px] z-50 md:z-auto shadow-2xl md:shadow-none
              flex flex-col border-l animate-slide-in md:animate-none"
              style={{ borderColor: '#E2E8F0' }}>
              <ChatPanel agente={agenteAtivo} onClose={() => setAgenteAtivo(null)} />
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
