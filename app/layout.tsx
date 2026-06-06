import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PresidentOX — 이재명 연임 vs 탄핵',
  description: '대한민국 최대 실시간 찬반 토론 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
