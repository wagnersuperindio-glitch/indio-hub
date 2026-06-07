'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AGENTES, CATEGORIAS, type Agente, type Categoria } from '@/data/agentes'
import AgentCard from '@/components/hub/AgentCard'
import ChatPanel from '@/components/hub/ChatPanel'
import { LogOut, Search, LayoutGrid } from 'lucide-react'

export default function HubPage() {
  const router = useRouter()
  const [agenteAtivo, setAgenteAtivo] = useState<Agente | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos')
  const [busca, setBusca] = useState('')

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
    // Agentes com painel externo vão direto para o sistema
    if (agente.url && (agente.tipo === 'link' || agente.tipo === 'ambos')) {
      window.open(agente.url, '_blank')
      return
    }
    // Demais abrem o painel lateral
    setAgenteAtivo(agente)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-4 py-2 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderBottom: '3px solid #E65100' }}>

        {/* Logo + Mascote */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-10 h-10">
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
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar agente ou capacidade..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Info + Logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-white/80 text-sm font-semibold leading-none">Grupo Índio</p>
            <p className="text-white/40 text-xs">{AGENTES.length} agentes</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-sm">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR CATEGORIAS ────────────────────────────────── */}
        <aside className="w-48 flex-shrink-0 p-3 border-r bg-white hidden md:flex flex-col gap-1"
          style={{ borderColor: '#E2E8F0' }}>

          {/* Mascote na sidebar */}
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

        {/* ── GRID DE AGENTES ───────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5">

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
                    Clique num agente para ver as ações disponíveis. Agentes com painel próprio abrem direto no sistema.
                  </p>
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
        </main>

        {/* ── PAINEL LATERAL (apenas agentes sem URL própria) ────── */}
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
