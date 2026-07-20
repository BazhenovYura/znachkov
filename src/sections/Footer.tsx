import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Копируем useEffect из Header для обработки скролла при переходе с якорем
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      console.log('🎯 Попытка скролла к секции из Footer:', sectionId);
      
      const timer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        
        if (element) {
          console.log('✅ Элемент найден, скроллим к', sectionId);
          
          const getYOffsetByScreenWidth = (width: number) => {
            if (width < 640) return -40;
            if (width < 768) return -50;
            if (width < 1024) return -60;
            if (width < 1280) return -70;
            return -80;
          };
          
          const originalScreenWidth = location.state?.originalScreenWidth || window.innerWidth;
          const yOffset = getYOffsetByScreenWidth(originalScreenWidth);
          
          const targetY = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          
          // Очищаем state после скролла
          setTimeout(() => {
            navigate('/', { replace: true, state: {} });
          }, 200);
        } else {
          console.log('❌ Элемент не найден');
          navigate('/', { replace: true, state: {} });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const handleNavClick = (href: string) => {
    const sectionId = href.substring(1);
    console.log('🔗 Навигация к секции из Footer:', sectionId);
    
    // Отправляем событие в Метрику
    sendMetrikaEvent('navigation', { to: sectionId, from: 'footer' });
    
    if (location.pathname === '/') {
      // Если на главной - скролим к секции
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      // Если не на главной - переходим с state
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handlePhoneClick = () => {
    sendMetrikaGoal('phone_click');
    console.log('📞 Клик по телефону в футере');
  };

  const handleMailClick = () => {
    sendMetrikaEvent('email_click', { from: 'footer' });
    console.log('📧 Клик по email в футере');
  };

  const handleAddressClick = () => {
    sendMetrikaEvent('address_click', { from: 'footer' });
    console.log('📍 Клик по адресу в футере');
  };

  const handleLogoClick = () => {
    sendMetrikaEvent('navigation', { to: 'home', from: 'footer_logo' });
    console.log('🏠 Клик по логотипу в футере');
    
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    }
  };

  const handlePrivacyClick = () => {
    sendMetrikaEvent('privacy_policy_click', { from: 'footer' });
    console.log('📄 Клик по политике конфиденциальности');
  };

  const navLinks = [
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'Процесс', href: '#process' },
    { name: 'О нас', href: '#why-us' },
    { name: 'Контакты', href: '#contact' },
  ];

  return (
    <footer className="py-12 lg:py-16 border-t border-gray-800" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <button 
              onClick={handleLogoClick}
              className="inline-block mb-4 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span className="font-serif text-2xl font-bold text-gold-gradient">
                ЗНАЧКОВ.РФ
              </span>
            </button>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Производство ювелирных значков из золота и серебра с 1972 года. 
              Собственное производство полного цикла. Индивидуальное изготовление 
              корпоративной символики премиум-класса.
            </p>
            <div className="flex items-center gap-2 text-gold text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Принимаем заказы онлайн</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-medium mb-4">Навигация</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-400 hover:text-gold transition-colors text-sm cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-medium mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+79227474474"
                  onClick={handlePhoneClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>+7 (922) 74-74-4-74</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:znachkoff@gmail.com"
                  onClick={handleMailClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>znachkoff@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://yandex.ru/maps/org/uralskiy_yuvelir/1119071637/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleAddressClick}
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Челябинская область, г.Озерск, пр.Победы, 55</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ЗНАЧКОВ.РФ — Все права защищены
          </p>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <a
              href="https://disk.yandex.ru/i/SUN1UhIcS4pW7Q"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePrivacyClick}
              className="text-gray-500 hover:text-gold transition-colors text-xs"
            >
              Политика конфиденциальности
            </a>
            <div className="text-gray-500 text-xs text-center sm:text-right">
              <p>ИП Баженов Юрий Николаевич</p>
              <p>ИНН: 667115263758</p>
              <p>ТПК "Уральский ювелир"</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
