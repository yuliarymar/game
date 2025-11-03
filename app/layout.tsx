// app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'Місто Рішень - RPG Гра',
  description: 'Інтерактивна рольова гра "Графіті на школі"',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="uk">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}