'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
        setErro(data.erro || 'Erro ao entrar')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 50%, #0D1B2A 100%)'
    }}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🪶</div>
          <h1 className="text-4xl font-black text-white tracking-wide">
            ÍNDIO <span style={{ color: '#E65100' }}>HUB</span>
          </h1>
          <p className="text-sm text-white/40 tracking-widest uppercase mt-1">
            Central de Agentes
          </p>
          <div className="h-0.5 mt-4 mx-auto w-24 rounded-full"
            style={{ background: 'linear-gradient(90deg, #E65100, #1565C0)' }} />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #E65100',
          backdropFilter: 'blur(12px)',
        }}>
          <p className="text-white/60 text-sm text-center mb-6 italic">
            ❤ Juntos Somos Mais Fortes
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1">Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="seu usuário"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
            {erro && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg py-2">{erro}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: loading ? '#888' : '#E65100' }}
            >
              {loading ? 'Entrando...' : '🔓 Entrar'}
            </button>
          </form>
          <p className="text-center text-white/20 text-xs mt-6">
            Acesso restrito — Supermercados Índio © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
