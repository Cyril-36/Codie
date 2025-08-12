/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Premium Design System Colors
      colors: {
        // Brand Colors
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
        },
        
        // Background Colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          hover: 'var(--bg-hover)',
          selected: 'var(--bg-selected)',
        },
        
        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        
        // Semantic Colors
        success: {
          50: 'var(--success-bg)',
          500: 'var(--success)',
          600: 'var(--success)',
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
        },
        warning: {
          50: 'var(--warning-bg)',
          500: 'var(--warning)',
          600: 'var(--warning)',
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
        },
        error: {
          50: 'var(--error-bg)',
          500: 'var(--error)',
          600: 'var(--error)',
          bg: 'var(--error-bg)',
          border: 'var(--error-border)',
        },
        info: {
          50: 'var(--info-bg)',
          500: 'var(--info)',
          600: 'var(--info)',
          bg: 'var(--info-bg)',
          border: 'var(--info-border)',
        },
        
        // Code Highlighting
        code: {
          bg: 'var(--code-bg)',
          border: 'var(--code-border)',
          keyword: 'var(--code-keyword)',
          string: 'var(--code-string)',
          function: 'var(--code-function)',
          comment: 'var(--code-comment)',
          variable: 'var(--code-variable)',
        },
        
        // Border Colors
        border: {
          default: 'var(--border-default)',
          hover: 'var(--border-hover)',
          focus: 'var(--border-focus)',
        },
        
        // Shadow Colors
        shadow: {
          sm: 'var(--shadow-sm)',
          md: 'var(--shadow-md)',
          lg: 'var(--shadow-lg)',
          glow: 'var(--shadow-glow)',
        },
        
        // Legacy compatibility
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },

      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },

      // Spacing (4px base unit)
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
      },

      // Component sizes
      height: {
        'button': '2.5rem',     // 40px
        'input': '2.5rem',      // 40px
        'header': '4rem',       // 64px
        'header-mobile': '3.5rem', // 56px
      },

      // Layout
      maxWidth: {
        'container': '80rem',   // 1280px
      },

      width: {
        'sidebar': '16rem',     // 256px
      },

      margin: {
        'sidebar': '16rem',     // 256px - for ml-sidebar
      },

      padding: {
        'header': '4rem',       // 64px - for pt-header
        'header-mobile': '3.5rem', // 56px - for pt-header-mobile
      },

      // Animations
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },

      // Box shadows with design system values
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
        'neon': 'var(--neon-glow)',
        // Enhanced dark mode shadows
        'dark-sm': '0 1px 3px 0 rgb(0 0 0 / 0.3)',
        'dark-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        'dark-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
        'dark-xl': '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
        // Glassmorphism shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },

      // Animation keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translate3d(-20px, 0, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale3d(0.95, 0.95, 1)' },
          '100%': { opacity: '1', transform: 'scale3d(1, 1, 1)' },
        },
        // Premium animations
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px 10px rgba(124, 58, 237, 0)',
            transform: 'scale(1.02)'
          }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        'slide-up': {
          'from': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in-scale': {
          'from': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          'to': { 
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        successPulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        errorShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 4px var(--brand-primary), 0 0 8px var(--brand-primary), 0 0 12px var(--brand-primary)'
          },
          '50%': { 
            textShadow: '0 0 8px var(--brand-primary), 0 0 16px var(--brand-primary), 0 0 24px var(--brand-primary)'
          }
        },
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-out both',
        'slide-in': 'slideIn 200ms ease-out both',
        'scale-in': 'scaleIn 200ms ease-out both',
        // Premium animations
        'pulse-glow': 'pulse-glow 2s ease infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'slide-up': 'slide-up 0.3s ease',
        'fade-in-scale': 'fade-in-scale 0.3s ease',
        'float': 'float 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease infinite',
        // Enhanced animations
        'shimmer': 'shimmer 1.5s infinite',
        'success-pulse': 'successPulse 0.6s ease-out',
        'error-shake': 'errorShake 0.6s ease-out',
      },

      // Enhanced backdrop filters
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },

      // Enhanced border radius
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [],
};
