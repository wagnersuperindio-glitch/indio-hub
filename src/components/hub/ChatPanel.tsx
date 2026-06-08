'use client'
import { useState, useRef, useEffect } from 'react'
import { X, ExternalLink, Zap, Send, Bot, User, Loader2, ChevronRight, RotateCcw } from 'lucide-react'
import type { Agente } from '@/data/agentes'
import Image from 'next/image'

interface Mensagem {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  agente: Agente
  onClose: () => void
}

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-sm mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold mt-3 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm leading-relaxed">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm leading-relaxed">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>')
}

export default function ChatPanel({ agente, onClose }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }, [input])

  async function enviar(texto?: string) {
    const msg = (texto ?? input).trim()
    if (!msg || carregando) return

    const novasMensagens: Mensagem[] = [...mensagens, { role: 'user', content: msg }]
    setMensagens(novasMensagens)
    setInput('')
    setCarregando(true)
    setErro('')

    // Placeholder da resposta
    setMensagens(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: agente.systemPrompt,
          messages: novasMensagens.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro na API')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                fullText += parsed.text
                setMensagens(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: fullText }
                  return updated
                })
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro de conexão'
      setErro(msg)
      setMensagens(prev => prev.slice(0, -1)) // remove placeholder
    } finally {
      setCarregando(false)
    }
  }

  function limparChat() {
    setMensagens([])
    setErro('')
  }

  const semMensagens = mensagens.length === 0

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: agente.cor + '30', background: agente.corClara }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {agente.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-sm truncate">{agente.nomeCompleto}</h2>
          <p className="text-xs truncate" style={{ color: agente.cor }}>Chat direto com IA ✦ Claude Opus</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {mensagens.length > 0 && (
            <button onClick={limparChat} title="Limpar conversa"
              className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition">
              <RotateCcw size={15} />
            </button>
          )}
          {agente.url && (
            <a href={agente.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: agente.cor }}>
              <ExternalLink size={11} /> Sistema
            </a>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── CHAT AREA ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Tela inicial — ações rápidas */}
        {semMensagens && (
          <div className="p-4 space-y-3">
            {/* Welcome */}
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative w-14 h-14 mb-2">
                <Image src="/mascote-novo.png" alt="Mascote" fill className="object-contain" />
              </div>
              <p className="font-bold text-gray-800 text-sm">{agente.nome} pronto para ajudar</p>
              <p className="text-xs text-gray-400 mt-0.5">Escolha uma ação ou escreva sua pergunta abaixo</p>
            </div>

            {/* Ações rápidas */}
            {agente.acoesRapidas.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={13} style={{ color: agente.cor }} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações rápidas</span>
                </div>
                <div className="space-y-2">
                  {agente.acoesRapidas.map((acao, i) => (
                    <button
                      key={i}
                      onClick={() => enviar(acao.prompt)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-sm group"
                      style={{
                        borderColor: agente.cor + '30',
                        background: agente.corClara,
                      }}
                    >
                      <span className="text-xl flex-shrink-0">{acao.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{acao.label}</p>
                        <p className="text-xs text-gray-400 truncate">{acao.prompt.slice(0, 60)}…</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Capacidades */}
            <div className="pt-2">
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
        )}

        {/* Mensagens */}
        {!semMensagens && (
          <div className="p-4 space-y-4">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${m.role === 'user' ? 'text-white' : 'bg-white border'}`}
                  style={m.role === 'user' ? { background: agente.cor } : { borderColor: agente.cor + '40' }}>
                  {m.role === 'user'
                    ? <User size={14} />
                    : <Bot size={14} style={{ color: agente.cor }} />}
                </div>

                {/* Balão */}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'rounded-tr-sm text-white'
                    : 'rounded-tl-sm bg-gray-50 border text-gray-800'}`}
                  style={m.role === 'user'
                    ? { background: agente.cor }
                    : { borderColor: '#E5E7EB' }}>
                  {m.role === 'user'
                    ? <p>{m.content}</p>
                    : m.content
                      ? <div
                          className="prose-sm"
                          dangerouslySetInnerHTML={{ __html: '<p class="mb-2">' + renderMd(m.content) + '</p>' }}
                        />
                      : <Loader2 size={16} className="animate-spin" style={{ color: agente.cor }} />
                  }
                </div>
              </div>
            ))}

            {/* Erro */}
            {erro && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <span className="text-red-500 text-lg">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-red-700">Erro</p>
                  <p className="text-xs text-red-600">{erro}</p>
                  {erro.includes('ANTHROPIC_API_KEY') && (
                    <p className="text-xs text-red-500 mt-1">
                      Configure a variável <code>ANTHROPIC_API_KEY</code> nas configurações do Vercel.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── INPUT ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t p-3" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-end gap-2 p-2 rounded-xl border-2 transition-colors"
          style={{ borderColor: agente.cor + '40', background: '#FAFAFA' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar()
              }
            }}
            placeholder={`Pergunte ao ${agente.nome}…`}
            rows={1}
            disabled={carregando}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400
              focus:outline-none py-1 px-1 min-h-[28px] max-h-[120px] disabled:opacity-50"
          />
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white
              transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: agente.cor }}>
            {carregando
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-1.5">Enter envia · Shift+Enter nova linha</p>
      </div>
    </div>
  )
}
