import { Component } from 'react';
import PageState from '@/shared/components/PageState.jsx';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main>
          <PageState
            title="Halaman belum dapat ditampilkan"
            message="Silakan muat ulang halaman. Jika masalah berlanjut, hubungi pengelola Wandoor."
            onRetry={() => window.location.reload()}
            actionLabel="Muat ulang"
          />
        </main>
      );
    return this.props.children;
  }
}
