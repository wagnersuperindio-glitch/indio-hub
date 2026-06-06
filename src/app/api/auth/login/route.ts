import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

const USUARIOS: Record<string, { hash: string; nome: string; perfil: string }> = {
  wagner:          { hash: hash('Ind!o@W2026'),  nome: 'Wagner Antonelli', perfil: 'CEO' },
  carolina:        { hash: hash('Ind!o@C2026'),  nome: 'Carolina',         perfil: 'Diretora' },
  david:           { hash: hash('Ind!o@D2026'),  nome: 'David',            perfil: 'Diretor' },
  nicolas:         { hash: hash('Ind!o@N2026'),  nome: 'Nicolas',          perfil: 'Diretor' },
  financeiro:      { hash: hash('Ind!o@Fin26'),  nome: 'Financeiro',       perfil: 'Financeiro' },
  fiscaltributario:{ hash: hash('Ind!o@FT2026'), nome: 'Fiscal Tributário', perfil: 'Fiscal' },
}

export async function POST(req: NextRequest) {
  const { usuario, senha } = await req.json()

  const user = USUARIOS[usuario?.toLowerCase()]
  if (!user || user.hash !== hash(senha)) {
    return NextResponse.json({ erro: 'Usuário ou senha incorretos' }, { status: 401 })
  }

  const session = JSON.stringify({ usuario, nome: user.nome, perfil: user.perfil })
  const res = NextResponse.json({ ok: true, nome: user.nome, perfil: user.perfil })
  res.cookies.set('indio_hub_auth', encodeURIComponent(session), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 horas
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('indio_hub_auth')
  return res
}
