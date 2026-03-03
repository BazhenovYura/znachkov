import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, X, Send, AlertCircle, Menu } from 'lucide-react';

// Конфигурация Telegram из переменных окружения Vite
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const navLinks = [
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'Процесс', href: '#process' },
    { name: 'О нас', href: '#why-us' },
    { name: 'Контакты', href: '#contact' },
  ];

  // Универсальная функция навигации
  const handleNavClick = (href: string) => {
    const sectionId = href.substring(1); // убираем #
    
    if (location.pathname === '/') {
      // Если мы на главной - просто скроллим
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Если на другой странице - переходим на главную с якорем
      navigate('/', { state: { scrollTo: sectionId } });
    }
    
    setIsMobileMenuOpen(false);
  };

  // Обработка скролла после навигации с якорем
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      // Небольшая задержка, чтобы страница загрузилась
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      // Очищаем state, чтобы не скроллить при повторных переходах
      navigate('/', { replace: true, state: {} });
    }
  }, [location]);

  // Функция отправки в Telegram
  const sendToTelegram = async (data: typeof formData) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Отсутствует токен Telegram');
    }

    const message = `
📞 <b>Заказ обратного звонка с сайта ЗНАЧКОВ.РФ</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}

⏰ <b>Время отправки:</b> ${new Date().toLocaleString('ru-RU')}
    `;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.description || 'Ошибка отправки в Telegram');
    }

    return responseData;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setConsentError('');
    
    if (!isAgreed) {
      setConsentError('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendToTelegram(formData);
      
      setIsModalOpen(false);
      navigate('/thanks');
      
      setFormData({ name: '', phone: '' });
      setIsAgreed(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setSubmitError('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка изменений в форме
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSubmitError('');
  };

  // Открытие модального окна
  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
    setSubmitError('');
    setConsentError('');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-dark/95 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            {/* Logo - ведет на главную */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2"
            >
              <span className="font-serif text-2xl md:text-3xl font-bold text-gold-gradient">
                ЗНАЧКОВ.РФ
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-300 hover:text-gold transition-colors duration-300 text-sm uppercase tracking-wider"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Contact & CTA */}
            <div className="hidden lg:flex items-center gap-6">
              <a
                href="tel:+79227474474"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-medium">+7 (922) 74-74-4-74</span>
              </a>
              <button
                onClick={openModal}
                className="btn-primary text-sm"
              >
                Заказать обратный звонок
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2"
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-dark/98 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-gray-300 hover:text-gold transition-colors py-2 text-lg"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-800">
                <a
                  href="tel:+79227474474"
                  className="flex items-center gap-2 text-gold mb-4"
                >
                  <Phone className="w-4 h-4" />
                  <span>+7 (922) 74-74-4-74</span>
                </a>
                <button
                  onClick={() => {
                    openModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary w-full text-center"
                >
                  Заказать обратный звонок
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Модальное окно (без изменений) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* ... остальной код модального окна ... */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          
          <div className="relative bg-dark-light border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in-up">
            <button
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gold transition-colors"
              disabled={isSubmitting}
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl text-white mb-2">
                Заказать обратный звонок
              </h3>
              <p className="text-gray-400 text-sm">
                Оставьте контакты и мы перезвоним вам в ближайшее время
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... остальная форма ... */}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
