import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Compare from './pages/Compare';
import Recommend from './pages/Recommend';
import Assistant from './pages/Assistant';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#1e40af', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Page not found</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, '')}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
