import { Component } from 'react'

/**
 * ErrorBoundary — React render hatalarını yakalar ve beyaz sayfa yerine hata mesajı gösterir.
 * React 19 + StrictMode uyumlu.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[EYS ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'monospace',
          padding: '2rem',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.25rem', color: '#ef4444', margin: 0 }}>Uygulama Hatası</h1>
          <p style={{ color: '#aaa', margin: 0 }}>
            Bir render hatası oluştu. Detaylar:
          </p>
          <pre style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem',
            maxWidth: '800px',
            width: '100%',
            overflowX: 'auto',
            fontSize: '0.75rem',
            color: '#f87171',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.href = '/'
            }}
            style={{
              background: '#22a135',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
