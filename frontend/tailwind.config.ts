import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-void',
    'bg-surface',
    'bg-highlight',
    'text-starlight',
    'text-muted',
    'bg-aura',
    'bg-aura-dark'
  ],
  theme: {
    extend: {
      // Professional Color Palette - Clinical Calm, Digital Serenity
      colors: {
        // Core brand colors - Production Ready
        void: '#000000',        // Pure black for main backgrounds
        surface: '#18181b',     // Zinc-900 for cards/modals
        highlight: '#27272a',   // Zinc-800 for borders/inputs
        starlight: '#FFFFFF',   // Primary text - pure clarity
        muted: '#8B949E',       // Secondary text - gentle presence
        aura: '#39D3BB',        // Accent - healing teal energy
        'aura-dark': '#2BB3A0', // Accent hover - deeper healing
        
        // Semantic color mapping
        background: '#000000',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#39D3BB',
          foreground: '#FFFFFF',
          hover: '#2BB3A0',
        },
        secondary: {
          DEFAULT: '#8B949E',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#18181b',
          foreground: '#FFFFFF',
        },
      },

      // Typography - Humanistic Futurism
      fontFamily: {
        // Clean geometric sans-serif for UI and user messages
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Modern sans-serif for AI responses - professional medical look
        serif: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },

      // 4-point grid spacing system
      spacing: {
        '0.5': '2px',   // 0.5 * 4px
        '1': '4px',     // 1 * 4px
        '1.5': '6px',   // 1.5 * 4px
        '2': '8px',     // 2 * 4px
        '2.5': '10px',  // 2.5 * 4px
        '3': '12px',    // 3 * 4px
        '3.5': '14px',  // 3.5 * 4px
        '4': '16px',    // 4 * 4px
        '5': '20px',    // 5 * 4px
        '6': '24px',    // 6 * 4px
        '7': '28px',    // 7 * 4px
        '8': '32px',    // 8 * 4px
        '10': '40px',   // 10 * 4px
        '12': '48px',   // 12 * 4px
        '16': '64px',   // 16 * 4px
        '20': '80px',   // 20 * 4px
        '24': '96px',   // 24 * 4px
      },

      // Keyframe animations for premium interactions
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        gentlePulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.7',
          },
        },
        breathe: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.02)',
            opacity: '1',
          },
        },
      },

      // Animation utilities
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
      },

      // Box shadows for depth and elevation
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(57, 211, 187, 0.3)',
      },

      // Border radius for consistent curves
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config