import Navbar from '@/shared/components/Navbar.jsx';
import '@/shared/styles/components/page-layout.css';

export default function PageLayout({
  title,
  description,
  eyebrow = 'WANDOOR',
  actions,
  children,
}) {
  return (
    <div className="customer-page">
      <Navbar />
      <main className="customer-main">
        <header className="customer-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {actions}
        </header>
        {children}
      </main>
    </div>
  );
}
