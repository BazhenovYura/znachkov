import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { sendMetrikaHit } from './utils/metrika';
import Header from './components/Header';
import Hero from './sections/Hero';
import Portfolio from './sections/Portfolio';
import Types from './sections/Types';
import WhyUs from './sections/WhyUs';
import Process from './sections/Process';
import Benefits from './sections/Benefits';
import CTA from './sections/CTA';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import Thanks from './sections/Thanks';
import NotFound from './sections/NotFound';
import ExitPopup from './components/ExitPopup';
import PriceCalculator from './sections/PriceCalculator';

// Создаем отдельный компонент для маршрутизации
const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Обработка редиректа из 404.html (опционально, можно удалить)
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath && redirectPath !== location.pathname) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // При каждом изменении маршрута прокручиваем наверх
    window.scrollTo(0, 0);
    
    // Отправляем просмотр страницы в Яндекс.Метрику
    const fullUrl = location.pathname + location.search + location.hash;
    sendMetrikaHit(fullUrl);
  }, [location]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={
          <main>
            <Hero />
            <Portfolio />
            <Types />
            <WhyUs />
            <Process />
            <Benefits />
            <CTA />
            <Contact />
          </main>
        } />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/price-calculator" element={<PriceCalculator />} />
        {/* Маршрут для 404 - должен быть последним */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <ExitPopup />
    </>
  );
};

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
        <AppRoutes />
      </div>
    </HashRouter>
  );
}

export default App;
