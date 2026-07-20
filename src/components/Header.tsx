import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, X, Menu } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

const YANDEX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('📍 Header загружен');
  console.log('📍 Текущий pathname:', location.pathname);
  console.log('📦 State из навигации:', location.state);

  useEffect(() => {
    if (isMobileMenuOpen || isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Обработка скролла при возврате с якорем
  useEffect(() => {
    console.log('🔄 useEffect [location, navigate] сработал');
    console.log('📍 location.pathname:', location.pathname);
    console.log('📍 location.state:', location.state);
    console.log('📍 location.state?.scrollTo:', location.state?.scrollTo);
    
    if (location.pathname === '/' && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const originalScreenWidth = location.state?.originalScreenWidth;
      
      console.log('🎯 НАЧАЛО: Попытка скролла к секции:', sectionId);
      console.log('📱 Текущая ширина экрана:', window.innerWidth);
      console.log('📱 Исходная ширина экрана:', originalScreenWidth);
      console.log('📦 Полный state:', location.state);
      console.log('⏰ Текущее время:', new Date().toISOString());
      
      const elementNow = document.getElementById(sectionId);
      console.log('🔍 Элемент сейчас в DOM:', !!elementNow);
      
      if (elementNow) {
        const rect = elementNow.getBoundingClientRect();
        console.log('📐 Позиция элемента сейчас:', {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          offsetTop: elementNow.offsetTop,
          pageYOffset: window.pageYOffset
        });
      } else {
        console.log('❌ Элемент НЕ найден в DOM');
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        console.log('📋 Все ID на странице:', allIds);
      }
      
      // Флаг для отслеживания состояния скролла
      let isScrolling = false;
      let scrollAttempts = 0;
      const MAX_ATTEMPTS = 5;
      
      const timer = setTimeout(() => {
        console.log(`⏰ Таймер сработал через 800ms, попытка ${scrollAttempts + 1}`);
        const element = document.getElementById(sectionId);
        console.log('🔍 Элемент через 800ms найден:', !!element);
        
        if (element && !isScrolling) {
          isScrolling = true;
          scrollAttempts++;
          
          console.log(`✅ Элемент найден, скроллим к ${sectionId} (попытка ${scrollAttempts})`);
          
          const getYOffsetByScreenWidth = (width: number) => {
            if (width < 640) return -40;
            if (width < 768) return -50;
            if (width < 1024) return -60;
            if (width < 1280) return -70;
            return -80;
          };
          
          const widthForOffset = originalScreenWidth || window.innerWidth;
          const yOffset = getYOffsetByScreenWidth(widthForOffset);
          console.log('📏 Отступ для ширины', widthForOffset, ':', yOffset);
          
          const rect = element.getBoundingClientRect();
          const targetY = rect.top + window.pageYOffset + yOffset;
          console.log('🎯 Целевая позиция скролла:', targetY);
          console.log('📍 Текущая позиция скролла ДО:', window.scrollY);
          console.log('📐 Позиция элемента rect.top:', rect.top);
          console.log('📐 pageYOffset:', window.pageYOffset);
          
          // Сохраняем targetY в глобальную переменную для отладки
          (window as any).__targetY = targetY;
          (window as any).__sectionId = sectionId;
          
          // СНАЧАЛА скроллим без анимации для точности
          console.log('🔄 Выполняю scrollTo с behavior: instant (для точности)');
          window.scrollTo({ top: targetY, behavior: 'instant' });
          
          // Проверяем через 50ms после instant
          setTimeout(() => {
            const currentScroll = window.scrollY;
            console.log(`📍 ПОСЛЕ INSTANT скролла позиция:`, currentScroll);
            console.log(`🎯 Должны были попасть в:`, targetY);
            console.log(`📐 Разница:`, Math.abs(currentScroll - targetY));
            
            // Если разница есть, доводим smooth
            if (Math.abs(currentScroll - targetY) > 10) {
              console.log(`🔄 Доводка smooth скроллом (попытка ${scrollAttempts})`);
              window.scrollTo({ top: targetY, behavior: 'smooth' });
              
              // Проверяем через 200ms после smooth
              setTimeout(() => {
                const finalScroll = window.scrollY;
                console.log(`📍 ФИНАЛЬНАЯ позиция скролла:`, finalScroll);
                console.log(`🎯 Целевая позиция:`, targetY);
                console.log(`📐 Финальная разница:`, Math.abs(finalScroll - targetY));
                console.log(`⏰ Финальное время:`, new Date().toISOString());
                
                if (Math.abs(finalScroll - targetY) > 20 && scrollAttempts < MAX_ATTEMPTS) {
                  console.log(`⚠️ Всё ещё не доехали, повторим через 1 секунду`);
                  setTimeout(() => {
                    if (!isScrolling) return;
                    console.log(`🔄 Финальный скролл (попытка ${scrollAttempts + 1})`);
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                    isScrolling = false;
                  }, 1000);
                } else {
                  console.log('✅ Скролл выполнен успешно');
                  isScrolling = false;
                }
              }, 200);
            } else {
              console.log('✅ Скролл выполнен точно, разница в пределах 10px');
              isScrolling = false;
            }
          }, 50);
        } else {
          console.log('❌ Элемент не найден через 800ms или уже идет скролл');
          if (!element) {
            console.log('❌ Элемент с id="' + sectionId + '" не существует на странице');
          }
          if (isScrolling) {
            console.log('⚠️ Скролл уже выполняется, пропускаем');
          }
        }
      }, 800);
      
      return () => {
        console.log('🧹 Очистка таймера, isScrolling:', isScrolling);
        clearTimeout(timer);
        isScrolling = true;
      };
    } else {
      console.log('ℹ️ Условие для скролла НЕ выполнено');
      console.log('  - pathname === "/"?', location.pathname === '/');
      console.log('  - state?.scrollTo существует?', !!location.state?.scrollTo);
    }
  }, [location, navigate]);

  // Дополнительная проверка после полной загрузки страницы
  useEffect(() => {
    console.log('🔄 useEffect [location] (load event) сработал');
    console.log('📍 location.pathname:', location.pathname);
    console.log('📍 location.state:', location.state);
    
    if (location.pathname === '/' && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      console.log('📌 Будет добавлен слушатель события load для секции:', sectionId);
      
      const handleLoad = () => {
        console.log('🔄 СОБЫТИЕ LOAD: Страница полностью загружена');
        console.log('🔄 Проверяем скролл для секции:', sectionId);
        console.log('📍 Текущий scrollY:', window.scrollY);
        
        const element = document.getElementById(sectionId);
        console.log('🔍 Элемент на load:', !!element);
        
        if (element) {
          const yOffset = -80;
          const rect = element.getBoundingClientRect();
          const targetY = rect.top + window.pageYOffset + yOffset;
          console.log(`🔄 Событие LOAD: скроллим к ${sectionId}, targetY:`, targetY);
          console.log(`📍 Текущий scrollY ДО скролла на load:`, window.scrollY);
          
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          
          setTimeout(() => {
            console.log(`📍 ПОСЛЕ скролла на load позиция:`, window.scrollY);
            console.log(`🎯 Целевая позиция на load:`, targetY);
            console.log(`📐 Разница на load:`, Math.abs(window.scrollY - targetY));
          }, 200);
        } else {
          console.warn(`⚠️ Элемент ${sectionId} не найден на событии load`);
        }
      };
      
      console.log('📌 Добавляем слушатель события load');
      window.addEventListener('load', handleLoad);
      
      return () => {
        console.log('🧹 Удаляем слушатель события load');
        window.removeEventListener('load', handleLoad);
      };
    } else {
      console.log('ℹ️ Условие для load event НЕ выполнено');
    }
  }, [location]);

  // Отслеживаем изменения scrollY
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScrollDebug = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 50) {
        console.log(`📊 Изменение скролла: ${lastScrollY} -> ${currentScrollY}`);
        lastScrollY = currentScrollY;
        
        // Если скролл упал до 0, логируем это
        if (currentScrollY < 50 && lastScrollY > 100) {
          console.warn('⚠️⚠️⚠️ ОБНАРУЖЕН СБРОС СКРОЛЛА НАВЕРХ!');
          console.warn(`📊 Предыдущая позиция: ${lastScrollY}, Текущая: ${currentScrollY}`);
          console.warn(`⏰ Время сброса: ${new Date().toISOString()}`);
          console.warn(`📍 Текущий pathname: ${location.pathname}`);
          console.warn(`📍 Текущий state:`, location.state);
        }
      }
    };
    
    window.addEventListener('scroll', handleScrollDebug, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollDebug);
  }, [location]);

  const navLinks = [
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'Процесс', href: '#process' },
    { name: 'О нас', href: '#why-us' },
    { name: 'Контакты', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    const sectionId = href.substring(1);
    console.log(`🔗 НАВИГАЦИЯ: Клик по ссылке "${href}" -> секция "${sectionId}"`);
    console.log(`📍 Текущий pathname: ${location.pathname}`);
    console.log(`⏰ Время клика: ${new Date().toISOString()}`);
    
    sendMetrikaEvent('navigation', { to: sectionId, from: 'header_menu' });
    
    if (location.pathname === '/') {
      console.log('📍 На главной странице, скроллим напрямую');
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        console.log(`🎯 Прямой скролл к ${sectionId}, targetY:`, y);
        console.log(`📍 Текущий scrollY:`, window.scrollY);
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        console.warn(`⚠️ Элемент ${sectionId} не найден на главной странице`);
      }
    } else {
      console.log(`📍 Переход на главную с state: { scrollTo: "${sectionId}" }`);
      navigate('/', { state: { scrollTo: sectionId } });
    }
    
    setIsMobileMenuOpen(false);
  };

  const handlePhoneClick = () => {
    sendMetrikaGoal('phone_click');
    console.log('📞 Клик по телефону');
  };

  const goToHome = () => {
    console.log('🏠 Возврат на главную');
    console.log(`📍 Текущий pathname: ${location.pathname}`);
    console.log(`⏰ Время клика: ${new Date().toISOString()}`);
    
    sendMetrikaEvent('navigation', { to: 'home', from: 'logo' });
    
    if (location.pathname === '/') {
      console.log('📍 На главной, скроллим наверх');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('📍 Переход на главную');
      navigate('/');
      setTimeout(() => {
        console.log('📍 Через 500ms скроллим наверх');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    }
    setIsMobileMenuOpen(false);
  };

  const sendToTelegram = async (data: typeof formData) => {
    const message = `
📞 <b>Заказ обратного звонка с сайта ЗНАЧКОВ.РФ</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}

⏰ <b>Время отправки (Екатеринбург):</b> ${new Date().toLocaleString('ru-RU', { 
  timeZone: 'Asia/Yekaterinburg',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `;

    const response = await fetch(YANDEX_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const responseData = await response.json();
    if (!responseData.ok) {
      throw new Error('Ошибка отправки в Telegram');
    }
    return responseData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAgreed) {
      sendMetrikaEvent('form_validation_error', { reason: 'privacy_not_agreed' });
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { reason: 'empty_fields' });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendToTelegram(formData);
      sendMetrikaGoal('callback_form_submit');
      setIsModalOpen(false);
      
      let currentSection = 'hero';
      let currentScreenWidth = window.innerWidth;
      
      if (location.pathname === '/') {
        const sections = [
          { id: 'hero', element: document.getElementById('hero') },
          { id: 'portfolio', element: document.getElementById('portfolio') },
          { id: 'types', element: document.getElementById('types') },
          { id: 'why-us', element: document.getElementById('why-us') },
          { id: 'process', element: document.getElementById('process') },
          { id: 'benefits', element: document.getElementById('benefits') },
          { id: 'cta', element: document.getElementById('cta') },
          { id: 'contact', element: document.getElementById('contact') }
        ];
        
        const scrollPosition = window.scrollY + 200;
        
        for (const section of sections) {
          if (section.element) {
            const rect = section.element.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top;
            const sectionBottom = sectionTop + rect.height;
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
              currentSection = section.id;
              break;
            }
          }
        }
      }
      
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: currentSection,
          screenWidth: currentScreenWidth
        } 
      });
      
      setFormData({ name: '', phone: '' });
      setIsAgreed(false);
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      sendMetrikaEvent('form_submit_error', { error: String(error) });
      alert('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (!formData[name as keyof typeof formData] && value) {
      sendMetrikaEvent('form_field_filled', { field: name });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { field: fieldName });
  };

  const openModal = () => {
    console.log('📱 Открытие модального окна');
    sendMetrikaGoal('open_callback_modal');
    setIsModalOpen(true);
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
    setIsMobileMenuOpen(false);
  };

  const closeModal = () => {
    if (formData.name || formData.phone) {
      sendMetrikaEvent('modal_closed_with_data');
    } else {
      sendMetrikaEvent('modal_closed_empty');
    }
    setIsModalOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-dark/95 backdrop-blur-md py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            <button 
              onClick={goToHome} 
              className="flex items-center gap-2"
            >
              <span className="font-serif text-2xl md:text-3xl font-bold text-gold-gradient">
                ЗНАЧКОВ.РФ
              </span>
            </button>

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

            <div className="hidden lg:flex items-center gap-6">
              <a
                href="tel:+79227474474"
                onClick={handlePhoneClick}
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 z-50 relative"
              aria-label="Меню"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`lg:hidden fixed inset-0 z-[70] transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-dark/98 backdrop-blur-md" />
        
        <div className="relative h-full overflow-y-auto">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-white p-2 z-10 hover:text-gold transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="min-h-full flex flex-col justify-center px-6 py-20">
            <div className="space-y-6 text-center">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    handleNavClick(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-gray-300 hover:text-gold transition-colors text-3xl font-medium w-full py-3"
                >
                  {link.name}
                </button>
              ))}
              
              <div className="pt-8 mt-8 border-t border-gray-800">
                <a
                  href="tel:+79227474474"
                  onClick={() => {
                    handlePhoneClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="group flex items-center justify-center gap-3 mb-6 text-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/10 group-hover:bg-gold/20 flex items-center justify-center transition-colors">
                    <Phone className="w-6 h-6 text-gold group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-gold font-medium group-hover:text-gold-light group-hover:scale-105 transition-all">
                    +7 (922) 74-74-4-74
                  </span>
                </a>
                
                <button
                  onClick={() => {
                    openModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-transform"
                >
                  Заказать обратный звонок
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          <div className="relative bg-dark-light border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in-up">
            <button
              onClick={closeModal}
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
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  required
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => handleFocus('phone')}
                  required
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="flex items-start gap-3">
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    id="privacy-header"
                    checked={isAgreed}
                    onChange={(e) => {
                      setIsAgreed(e.target.checked);
                      if (e.target.checked) {
                        sendMetrikaEvent('privacy_agreed');
                      }
                    }}
                    className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="privacy-header" className="text-sm text-gray-400 cursor-pointer">
                  Я соглашаюсь с{' '}
                  <a 
                    href="https://disk.yandex.ru/i/SUN1UhIcS4pW7Q"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold-light underline transition-colors"
                  >
                    политикой конфиденциальности
                  </a>
                  {' '}и даю согласие на обработку персональных данных *
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <span>ЗАКАЗАТЬ ЗВОНОК</span>
                    <span>📞</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
