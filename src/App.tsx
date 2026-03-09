import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

// Создаем отдельный компонент для маршрутизации
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // При каждом изменении маршрута прокручиваем наверх
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
