import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Footer from './components/Footer'
import MobileDrawer from './components/MobileDrawer'
import UniversalHeader from './components/UniversalHeader'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import StorageWarning from './components/StorageWarning'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lumora AI Health Assistant',
  description: 'An intelligent AI-powered health consultation platform providing personalized health guidance through advanced AI technology.',
  keywords: 'AI health, medical consultation, health assistant, symptom analysis, medicine information',
  creator: 'Lumora AI',
  publisher: 'Lumora AI',
  robots: 'index, follow',
  openGraph: {
    title: 'Lumora AI Health Assistant',
    description: 'Get personalized health guidance through advanced AI technology',
    url: 'https://github.com/dipanshu-dixit/Lumora',
    siteName: 'Lumora AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumora AI Health Assistant',
    description: 'Get personalized health guidance through advanced AI technology',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${lora.variable} bg-void text-starlight`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('unhandledrejection', function(event) {
              console.error('Unhandled promise rejection:', event.reason);
            });
            if('serviceWorker' in navigator){
              window.addEventListener('load',()=>{
                navigator.serviceWorker.register('/service-worker.js').catch(e=>console.error('SW registration failed:',e));
              });
            }
            if(typeof window!=='undefined'){window.scrollTo(0,0);}
          `
        }} />
      </head>
      <body className="bg-void text-starlight font-sans antialiased h-screen overflow-hidden transition-colors duration-300">
        <GlobalErrorBoundary>
          <StorageWarning />
          <UniversalHeader />
          <div className="transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] pl-0 lg:pl-[var(--sidebar-width,64px)] h-screen overflow-hidden pt-16 md:pt-16">
            {children}
          </div>
          <MobileDrawer />
        </GlobalErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
