import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Índio Hub — Central de Agentes',
  description: 'Central de controle dos agentes de IA — Grupo Supermercados Índio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
