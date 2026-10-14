import AppRoutes from '@/app/routes/AppRoutes.jsx';
import ErrorBoundary from '@/shared/components/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">
        Lewati navigasi
      </a>
      <div id="main-content" tabIndex={-1}>
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
}
