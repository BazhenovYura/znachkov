import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Shield, Truck, X } from 'lucide-react';

// Конфигурация Telegram из переменных окружения Vite
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
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

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Функция отправки в Telegram
  const sendToTelegram = async (data: typeof formData) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Отсутствует токен Telegram');
    }

    const message = `
🎨 <b>Запрос бесплатного макета с сайта ЗНАЧКОВ.РФ</b>

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
    
    if (!isAgreed) {
      alert('Необходимо согласиться с политикой конфиденциальности');
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
      alert('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
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
  };

  // Открытие модального окна
  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
  };

  const benefits = [
    { icon: Calendar, text: 'Работаем с 1972 года' },
    { icon: Clock, text: 'От 14 дней' },
    { icon: Shield, text: 'Проверка в УГИПН' },
    { icon: Truck, text: 'Доставка по РФ' },
  ];

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-gold/5 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 pt-20 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left column - Text */}
            <div className="space-y-6">
              <div className="reveal opacity-0">
                <span className="inline-block px-4 py-2 border border-gold/30 text-gold text-sm uppercase tracking-widest mb-4">
                  Премиум качество
                </span>
              </div>

              <h1 className="reveal opacity-0 animation-delay-100">
                <span className="block font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  ЮВЕЛИРНЫЕ
                </span>
                <span className="block font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold-gradient leading-tight mt-1">
                  ЗНАЧКИ
                </span>
                <span className="block font-serif text-2xl sm:text-3xl lg:text-4xl text-white/90 mt-2">
                  из золота и серебра
                </span>
              </h1>

              <p className="reveal opacity-0 animation-delay-200 text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
                Корпоративная символика премиум-класса для вашего бренда. 
                Собственное производство с 1972 года. Индивидуальное изготовление 
                значков с логотипом вашей компании.
              </p>

              <div className="reveal opacity-0 animation-delay-300 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={openModal}
                  className="btn-primary flex items-center justify-center gap-2 group animate-pulse-gold"
                >
                  <span>ПОЛУЧИТЬ БЕСПЛАТНЫЙ МАКЕТ</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={scrollToPortfolio}
                  className="btn-outline"
                >
                  Смотреть портфолио
                </button>
              </div>

              {/* Benefits */}
              <div className="reveal opacity-0 animation-delay-400 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="text-gray-400 text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Image */}
            <div className="reveal opacity-0 animation-delay-300 relative lg:col-span-1">
              <div className="relative aspect-square max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl transform scale-75" />
                
                {/* Image container */}
                <div className="relative z-10 w-full h-full overflow-hidden rounded-lg shadow-2xl">
                  <img
                    src="/images/hero-badges.jpg"
                    alt="Ювелирные значки премиум класса"
                    className="w-full h-full object-cover object-bottom"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 lg:w-24 lg:h-24 border border-gold/30 rounded-lg" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 lg:w-28 lg:h-28 border border-gold/20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:block">
          <div className="w-5 h-8 border-2 border-gold/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gold rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Модальное окно для получения макета */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-dark-light border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in-up">
            {/* Close button */}
            <button
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gold transition-colors"
              disabled={isSubmitting}
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl text-white mb-2">
                Получить бесплатный макет
              </h3>
              <p className="text-gray-400 text-sm">
                Оставьте контакты и мы пришлем вам макет для согласования
              </p>
            </div>

            {/* Form */}
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
                  required
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center h-6">
                    <input
                      type="checkbox"
                      id="privacy-hero"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                    />
                  </div>
                  <label htmlFor="privacy-hero" className="text-sm text-gray-400 cursor-pointer">
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
                    <span>ПОЛУЧИТЬ МАКЕТ</span>
                    <ArrowRight className="w-5 h-5" />
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

export default Hero;
