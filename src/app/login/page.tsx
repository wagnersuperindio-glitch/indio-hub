'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      })
      if (res.ok) {
        router.push('/hub')
        router.refresh()
      } else {
        const data = await res.json()
        setErro(data.erro || 'Usuário ou senha incorretos')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 60%, #0D1B2A 100%)' }}>

      {/* Mascote + Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 mb-3 drop-shadow-2xl">
          <Image src="/mascote-novo.png" alt="Mascote Índio" fill className="object-contain" priority />
        </div>
        <div className="relative h-10 w-48">
          <Image src="/logo.png" alt="Supermercados Índio" fill className="object-contain" priority />
        </div>
        <div className="h-0.5 w-32 mt-3 rounded-full"
          style={{ background: 'linear-gradient(90deg, #E65100, #1565C0)' }} />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-7"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #E65100',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-black text-white tracking-wide">
            ÍNDIO <span style={{ color: '#FF8C42' }}>HUB</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">Central de Agentes</p>
          <p className="text-white/50 text-sm italic mt-2">❤ Juntos Somos Mais Fortes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="seu usuário"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          {erro && (
            <p className="text-red-400 text-xs text-center bg-red-400/10 rounded-lg py-2 px-3">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all mt-1"
            style={{ background: loading ? '#555' : '#E65100', boxShadow: '0 4px 16px rgba(230,81,0,0.4)' }}>
            {loading ? 'Entrando...' : '🔓 Entrar'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-5">
          Acesso restrito — Supermercados Índio © 2026
        </p>
      </div>
    </div>
  )
}
