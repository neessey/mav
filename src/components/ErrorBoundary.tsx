import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches JS errors anywhere below it in the tree and shows a recoverable screen
// instead of a blank white page. Without this, any uncaught render error (like the
// "Function not implemented." shadowing bug we fixed earlier) takes down the entire
// app with nothing shown to the visitor.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Erreur non interceptée:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-[#F2F2F0] flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-display text-2xl uppercase tracking-wider">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-neutral-400">
              Quelque chose s'est mal passé de notre côté. Merci de recharger la page — si le
              problème persiste, contactez-nous.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-white text-black font-display text-xs uppercase tracking-wider rounded hover:bg-neutral-200"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
