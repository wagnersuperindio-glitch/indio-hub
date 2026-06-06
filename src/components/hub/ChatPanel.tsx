'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Send, ExternalLink, Zap, RotateCcw } from 'lucide-react'
import type { Agente } from '@/data/agentes'

interface Msg { role: 'user' | 'assistant'; content: string }

function renderMd(text: string) {
  let html = text
    // Escape básico
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Restaurar tags permitidas depois — não, vamos só fazer substituições seguras

  // Reset — trabalha no texto original
  html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---+$/gm, '<hr/>')
    .replace(/^[-*•] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

  return html
}

interface Props {
  agente: Agente
  onClose: () => void
}

export default function ChatPanel({ agente, onClose }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    inputRef.current?.focus()
  }, [agente.id])

  async function send(texto: string) {
    if (!texto.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: texto }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agente.id,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Erro na resposta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      setMsgs(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMsgs(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
      }
    } catch (err) {
      setMsgs(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Erro ao conectar com o agente. Verifique a ANTHROPIC_API_KEY.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: agente.cor + '30' }}>
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80"
              style={{ background: agente.cor }}>
              <ExternalLink size={12} /> Abrir sistema
            </a>
          )}
          <button onClick={() => { setMsgs([]); setInput('') }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            title="Limpar conversa">
            <RotateCcw size={16} />
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Ações Rápidas */}
      {msgs.length === 0 && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap size={14} style={{ color: agente.cor }} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações rápidas</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {agente.tipo === 'link' ? (
              <a href={agente.url} target="_blank" rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: agente.cor, borderColor: agente.cor }}>
                <ExternalLink size={18} />
                Abrir {agente.nome}
              </a>
            ) : (
              agente.acoesRapidas.map((acao, i) => (
                <button key={i}
                  onClick={() => send(acao.prompt)}
                  className="flex items-start gap-2 p-3 rounded-xl border text-left transition-all hover:shadow-sm hover:border-current/20"
                  style={{ borderColor: agente.cor + '40', background: agente.corClara }}>
                  <span className="text-lg leading-none">{acao.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{acao.label}</span>
                </button>
              ))
            )}
          </div>
          {agente.tipo !== 'link' && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Clique em uma ação ou escreva sua demanda abaixo
            </p>
          )}
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base mr-2 flex-shrink-0 mt-0.5"
                style={{ background: agente.corClara }}>
                {agente.emoji}
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'text-white rounded-tr-sm'
                  : 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'
              }`}
              style={msg.role === 'user' ? { background: agente.cor } : {}}
            >
              {msg.role === 'assistant' ? (
                <div className="chat-content"
                  dangerouslySetInnerHTML={{ __html: renderMd(msg.content || '▋') }} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && msgs[msgs.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base mr-2 flex-shrink-0"
              style={{ background: agente.corClara }}>
              {agente.emoji}
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm border border-gray-100 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: agente.cor, animationDelay: `${j * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {agente.tipo !== 'link' && (
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${agente.nome}...`}
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl text-white transition-all disabled:opacity-40"
              style={{ background: agente.cor }}>
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-1.5">Enter para enviar · Shift+Enter para nova linha</p>
        </div>
      )}
    </div>
  )
}
