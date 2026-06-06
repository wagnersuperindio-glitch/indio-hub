'use client'
import type { Agente } from '@/data/agentes'
import { ExternalLink, MessageCircle, ChevronRight } from 'lucide-react'

interface Props {
  agente: Agente
  onClick: () => void
  ativo: boolean
}

export default function AgentCard({ agente, onClick, ativo }: Props) {
  const statusColor = agente.status === 'ativo' ? '#22C55E' : agente.status === 'idle' ? '#F59E0B' : '#EF4444'
  const statusLabel = agente.status === 'ativo' ? 'Ativo' : agente.status === 'idle' ? 'Ocioso' : 'Manutenção'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group"
      style={{
        borderColor: ativo ? agente.cor : 'transparent',
        background: ativo ? agente.corClara : 'white',
        boxShadow: ativo ? `0 0 0 2px ${agente.cor}` : undefined,
      }}
    >
      {/* Faixa de cor lateral */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all"
        style={{ background: agente.cor, opacity: ativo ? 1 : 0.4 }} />

      <div className="pl-2">
        {/* Header do card */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: ativo ? 'white' : agente.corClara }}>
              {agente.emoji}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{agente.nome}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                <span className="text-xs text-gray-500">{statusLabel}</span>
              </div>
            </div>
          </div>
          <div className="text-gray-300 group-hover:text-gray-500 transition mt-1">
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Descrição */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {agente.descricao}
        </p>

        {/* Capacidades */}
        <div className="flex flex-wrap gap-1 mb-3">
          {agente.capacidades.slice(0, 3).map((cap, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: agente.corClara, color: agente.cor }}>
              {cap}
            </span>
          ))}
          {agente.capacidades.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 bg-gray-50">
              +{agente.capacidades.length - 3}
            </span>
          )}
        </div>

        {/* Ações rápidas preview */}
        <div className="flex flex-wrap gap-1">
          {agente.tipo === 'link' ? (
            <div className="flex items-center gap-1 text-xs font-medium" style={{ color: agente.cor }}>
              <ExternalLink size={11} /> Abrir sistema
            </div>
          ) : (
            agente.acoesRapidas.slice(0, 2).map((acao, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-gray-50 text-gray-600">
                <span>{acao.emoji}</span> {acao.label}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Badge de tipo */}
      <div className="absolute top-3 right-3">
        {agente.tipo === 'link' ? (
          <div className="p-1 rounded-md bg-gray-100">
            <ExternalLink size={12} className="text-gray-400" />
          </div>
        ) : agente.tipo === 'ambos' ? (
          <div className="p-1 rounded-md" style={{ background: agente.corClara }}>
            <MessageCircle size={12} style={{ color: agente.cor }} />
          </div>
        ) : (
          <div className="p-1 rounded-md" style={{ background: agente.corClara }}>
            <MessageCircle size={12} style={{ color: agente.cor }} />
          </div>
        )}
      </div>
    </button>
  )
}
