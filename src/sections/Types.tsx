import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Crown, Circle, Dot, X, Upload } from 'lucide-react';

// Конфигурация Telegram из переменных окружения Vite
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

interface BadgeType {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  size: string;
}

const badgeTypes: BadgeType[] = [
  {
    id: 'maxi',
    name: 'MAXI',
    icon: Gem,
    description: 'Максимальная детализация для премиальных брендов',
    features: [
      'Полный логотип с названием',
      'Девиз и лозунг компании',
      'Цветовая палитра бренда',
      'Драгоценные камни',
      'Сложная эмаль и гравировка',
    ],
    size: '25-35 мм',
  },
  {
    id: 'midi',
    name: 'MIDI',
    icon: Crown,
    description: 'Оптимальный баланс размера и детализации',
    features: [
      'Основной символ компании',
      'Цветовая палитра бренда',
      'Цветная эмаль',
      'Лазерная гравировка',
      'Гальваника (родирование, золочение)',
    ],
    size: '20-25 мм',
  },
  {
    id: 'mini',
    name: 'MINI',
    icon: Circle,
    description: 'Компактный формат для повседневного использования',
    features: [
      'Компактный символ бренда',
      'Минимальный набор техник',
      'Лазерная гравировка',
      'Чернение и родирование',
      'Экономичное решение',
    ],
    size: '15-20 мм',
  },
  {
    id: 'micro',
    name: 'MICRO',
    icon: Dot,
    description: 'Минимальный размер для массовых мероприятий',
    features: [
      'Упрощённый символ',
      'Базовое исполнение',
      'Минимальная цена',
      'Быстрое производство',
      'Идеально для конференций',
    ],
    size: '10-15 мм',
  },
];

const Types = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Состояния для модального окна
  const [selectedType, setSelectedType] = useState<BadgeType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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

    const elements = sectionRef.current?.querySelectorAll('.reveal');
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

  // Очистка превью при закрытии
  useEffect(() => {
    if (!isModalOpen) {
      setLogoFile(null);
      setLogoPreview(null);
    }
  }, [isModalOpen]);

  // Функция отправки в Telegram с фотографией логотипа
  const sendToTelegram = async (data: typeof formData, type: BadgeType, logo?: File) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Отсутствует токен Telegram');
    }

    const message = `
📌 <b>Заявка на макет с сайта ЗНАЧКОВ.РФ</b>

🔹 <b>Выбранный формат:</b> ${type.name} (${type.size})
📝 <b>Описание:</b> ${type.description}

👤 <b>Клиент:</b>
• Имя: ${data.name || 'Не указано'}
• Телефон: ${data.phone}

${logo ? '🖼️ <b>Логотип:</b> Прикреплен к сообщению' : ''}

⏰ <b>Время отправки:</b> ${new Date().toLocaleString('ru-RU')}
    `;

    if (logo) {
      // Если есть логотип, используем sendPhoto
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', logo);
      formData.append('caption', message);
      formData.append('parse_mode', 'HTML');

      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.description || 'Ошибка отправки в Telegram');
      }

      return responseData;
    } else {
      // Если без логотипа, используем sendMessage
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
    }
  };

  // Обработка выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление выбранного логотипа
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
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
      await sendToTelegram(formData, selectedType!, logoFile || undefined);
      
      setIsModalOpen(false);
      navigate('/thanks');
      
      // Сброс формы
      setFormData({ name: '', phone: '' });
      setLogoFile(null);
      setLogoPreview(null);
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

  // Открытие модального окна с выбранным типом
  const openModal = (type: BadgeType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="py-20 lg:py-32"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
              Виды значков
            </span>
            <h2 className="reveal opacity-0 animation-delay-100 section-title">
              Выберите <span className="text-gold-gradient">формат</span> для вашего бренда
            </h2>
            <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
              От компактных до премиальных — найдите идеальный вариант 
              для ваших задач и бюджета
            </p>
            <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
          </div>

          {/* Types Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badgeTypes.map((type, index) => (
              <div
                key={type.id}
                className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group relative`}
              >
                <div className="h-full p-6 lg:p-8 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-gold">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <type.icon className="w-7 h-7 text-gold" />
                  </div>

                  {/* Name & Size */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {type.name}
                    </h3>
                    <span className="text-gold text-sm">{type.size}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6">
                    {type.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {type.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-gray-300 text-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Кнопка заказа макета */}
                  <button
                    onClick={() => openModal(type)}
                    className="w-full py-2 px-4 bg-gold/10 text-gold rounded-lg hover:bg-gold hover:text-dark transition-all duration-300 font-medium text-sm"
                  >
                    Получить макет
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Модальное окно */}
      {isModalOpen && selectedType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-dark-light border border-gray-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="font-serif text-2xl text-white">
                Получить макет в формате <span className="text-gold-gradient">{selectedType.name}</span>
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Размер: {selectedType.size}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              {/* Загрузка логотипа */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Загрузить свой логотип <span className="text-gray-600">(необязательно)</span>
                </label>
                
                {!logoPreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Выберите файл</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-dark border border-gray-700 rounded-lg">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{logoFile?.name}</p>
                      <p className="text-gray-500 text-xs">
                        {(logoFile?.size && (logoFile.size / 1024).toFixed(1))} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start gap-3">
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    id="privacy-types"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="privacy-types" className="text-sm text-gray-400 cursor-pointer">
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
                  <span>ПОЛУЧИТЬ МАКЕТ</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Types;
