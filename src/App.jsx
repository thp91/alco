import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import servicePages from '../contenu/services.json';
import Bridge from './cms/Bridge';
import { ContentProvider } from './cms/ContentProvider';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { useScrollEffects } from './hooks/useScrollEffects';
import { destroySmoothScroll, initSmoothScroll, scrollToElement, scrollToTop } from './lib/smoothScroll';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import Legal from './pages/Legal/Legal';
import NotFound from './pages/NotFound/NotFound';
import ProjetDetail from './pages/ProjetDetail/ProjetDetail';
import Realisations from './pages/Realisations/Realisations';
import Service from './pages/Service/Service';
import Seo from './seo/Seo';

// Back-office : chargé à part, uniquement sur /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'));

function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    initSmoothScroll();
    return destroySmoothScroll;
  }, []);

  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) {
      scrollToElement(target);
    } else {
      scrollToTop();
    }
  }, [pathname, hash]);

  useScrollEffects(pathname);

  return (
    <ContentProvider>
      <Seo />
      <Bridge />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ContentProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Navigate to="/#services" replace />} />
        <Route path="services/:slug" element={<Service />} />
        <Route path="realisations" element={<Realisations />} />
        <Route path="realisations/:slug" element={<ProjetDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="mentions-legales" element={<Legal cle="mentions" />} />
        <Route path="politique-de-confidentialite" element={<Legal cle="confidentialite" />} />

        {/* Anciennes URL de alcorope.fr (ex. /cordiste/) : en ligne, vercel.json répond par une 301. */}
        {servicePages.map((page) => (
          <Route key={page.slug} path={page.slug} element={<Navigate to={`/services/${page.slug}`} replace />} />
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
