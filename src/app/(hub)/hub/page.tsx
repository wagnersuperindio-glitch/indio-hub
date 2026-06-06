'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    const matchBusca = !busca || a.nome.toLowerCase().includes(busca.toLowerCase()) ||
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
    if (agente.tipo === 'link' && agente.url) {
      window.open(agente.url, '_blank')
    } else {
      setAgenteAtivo(agente)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F2F8' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3 border-b shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderColor: '#E65100' }}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-2xl">🪶</span>
          <div>
            <h1 className="text-lg font-black text-white leading-none">
              ÍNDIO <span style={{ color: '#FF8C42' }}>HUB</span>
            </h1>
            <p className="text-white/40 text-xs">Central de Agentes</p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="flex-1 max-w-md mx-auto relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar agente ou capacidade..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-white/80 text-sm font-medium">Grupo Índio</p>
            <p className="text-white/40 text-xs">{AGENTES.length} agentes ativos</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de categorias */}
        <aside className="w-52 flex-shrink-0 p-4 border-r bg-white hidden md:flex flex-col gap-1"
          style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <LayoutGrid size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorias</span>
          </div>

          <button
            onClick={() => setCategoriaFiltro('todos')}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: categoriaFiltro === 'todos' ? '#0D1B2A' : 'transparent',
              color: categoriaFiltro === 'todos' ? 'white' : '#6B7280',
            }}>
            <span className="flex items-center gap-2">🤖 Todos os agentes</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
              style={categoriaFiltro === 'todos' ? { background: 'rgba(255,255,255,0.2)', color: 'white' } : {}}>
              {AGENTES.length}
            </span>
          </button>

          {(Object.entries(CATEGORIAS) as [Categoria, typeof CATEGORIAS[Categoria]][]).map(([key, cat]) => {
            const count = AGENTES.filter(a => a.categoria === key).length
            const ativo = categoriaFiltro === key
            return (
              <button key={key}
                onClick={() => setCategoriaFiltro(key)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: ativo ? cat.cor + '15' : 'transparent',
                  color: ativo ? cat.cor : '#6B7280',
                  borderLeft: ativo ? `3px solid ${cat.cor}` : '3px solid transparent',
                }}>
                <span className="flex items-center gap-2">{cat.emoji} {cat.label}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: ativo ? cat.cor + '20' : '#F3F4F6', color: ativo ? cat.cor : '#9CA3AF' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </aside>

        {/* Grid de agentes */}
        <main className="flex-1 overflow-y-auto p-6">
          {busca || categoriaFiltro !== 'todos' ? null : (
            <div className="mb-6 p-4 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 100%)', borderLeft: '4px solid #E65100' }}>
              <h2 className="font-bold text-lg mb-1">
                🪶 Central de Agentes — Grupo Supermercados Índio
              </h2>
              <p className="text-white/60 text-sm">
                Clique em qualquer agente para interagir diretamente. Cada agente tem ações rápidas para as demandas mais comuns.
              </p>
            </div>
          )}

          {agenteFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">Nenhum agente encontrado para "{busca}"</p>
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

        {/* Chat Panel — slide in lateral */}
        {agenteAtivo && (
          <>
            {/* Overlay mobile */}
            <div className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setAgenteAtivo(null)} />

            <aside className="fixed md:relative right-0 top-0 md:top-auto h-full md:h-auto
              w-full max-w-md md:w-[420px] z-50 md:z-auto shadow-2xl md:shadow-none
              flex flex-col border-l animate-slide-in md:animate-none"
              style={{ borderColor: '#E2E8F0' }}>
              <ChatPanel
                agente={agenteAtivo}
                onClose={() => setAgenteAtivo(null)}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
