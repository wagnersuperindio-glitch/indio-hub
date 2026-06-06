'use client'
import { useState } from 'react'
import { X, ExternalLink, Zap, Copy, Check, ChevronRight, MessageSquare } from 'lucide-react'
import type { Agente } from '@/data/agentes'

interface Props {
  agente: Agente
  onClose: () => void
}

export default function LaunchPanel({ agente, onClose }: Props) {
  const [promptPersonalizado, setPromptPersonalizado] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(id)
      setTimeout(() => setCopiado(null), 2000)
    })
  }

  function buildPromptCompleto(prompt: string) {
    return `[CONTEXTO DO AGENTE: ${agente.nomeCompleto}]\n${agente.systemPrompt}\n\n---\n\n${prompt || promptPersonalizado}`
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: agente.cor + '30' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: agente.corClara }}>
          {agente.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-sm truncate">{agente.nomeCompleto}</h2>
          <p className="text-xs text-gray-500 truncate">{agente.descricao}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {agente.url && (
            <a href={agente.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: agente.cor }}>
              <ExternalLink size={12} /> Abrir sistema
            </a>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Como usar */}
        <div className="px-4 py-3 border-b text-xs text-gray-500 flex items-center gap-2"
          style={{ background: agente.corClara }}>
          <MessageSquare size={13} style={{ color: agente.cor }} />
          <span>Copie o prompt de uma ação abaixo e <strong>cole aqui no Claude</strong> — usa seus créditos da assinatura.</span>
        </div>

        {/* Ações rápidas */}
        {agente.tipo !== 'link' && (
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Zap size={14} style={{ color: agente.cor }} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ações rápidas — clique para copiar o prompt
              </span>
            </div>
            <div className="space-y-2">
              {agente.acoesRapidas.map((acao, i) => {
                const id = `acao-${i}`
                const promptFull = buildPromptCompleto(acao.prompt)
                const isCopied = copiado === id
                return (
                  <div key={i} className="rounded-xl border overflow-hidden"
                    style={{ borderColor: agente.cor + '30' }}>
                    {/* Label da ação */}
                    <div className="flex items-center justify-between px-3 py-2"
                      style={{ background: agente.corClara }}>
                      <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <span>{acao.emoji}</span> {acao.label}
                      </span>
                      <button
                        onClick={() => copiar(promptFull, id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: isCopied ? '#22C55E' : agente.cor }}>
                        {isCopied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar prompt</>}
                      </button>
                    </div>
                    {/* Preview do prompt */}
                    <div className="px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {acao.prompt}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Link direto */}
        {agente.url && (
          <div className="px-4 pb-4">
            <a href={agente.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-4 rounded-xl border-2 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: agente.cor, borderColor: agente.cor }}>
              <span className="flex items-center gap-2">
                <ExternalLink size={18} /> Abrir {agente.nome}
              </span>
              <ChevronRight size={18} />
            </a>
          </div>
        )}

        {/* Prompt personalizado */}
        {agente.tipo !== 'link' && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ou escreva sua demanda personalizada
              </span>
            </div>
            <textarea
              value={promptPersonalizado}
              onChange={e => setPromptPersonalizado(e.target.value)}
              placeholder={`Descreva o que precisa do agente ${agente.nome}...`}
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition mb-2"
              style={{ '--tw-ring-color': agente.cor } as React.CSSProperties}
            />
            <button
              onClick={() => copiar(buildPromptCompleto(promptPersonalizado), 'custom')}
              disabled={!promptPersonalizado.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-40"
              style={{ background: agente.cor }}>
              {copiado === 'custom'
                ? <><Check size={16} /> Copiado! Cole no Claude</>
                : <><Copy size={16} /> Copiar prompt completo</>}
            </button>
          </div>
        )}

        {/* Capacidades */}
        <div className="px-4 pb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Capacidades</p>
          <div className="flex flex-wrap gap-1.5">
            {agente.capacidades.map((cap, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: agente.corClara, color: agente.cor }}>
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
