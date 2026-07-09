import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
      <h1 className="font-heading" style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: 'var(--color-body-text)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Page not found</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
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
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
