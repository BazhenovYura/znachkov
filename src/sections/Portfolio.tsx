import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ZoomIn } from 'lucide-react';

// Конфигурация Telegram из переменных окружения Vite
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

interface PortfolioItem {
  id: number;
  image: string;
  title: string;
  description: string;
  material: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    image: '/images/portfolio-1.jpg',
    title: 'Золотой значок с эмалью',
    description: 'Корпоративный значок с цветной эмалью',
    material: 'Золото 585 пробы',
  },
  {
    id: 2,
    image: '/images/portfolio-2.jpg',
    title: 'Серебряный значок',
    description: 'Минималистичный дизайн с синей эмалью',
    material: 'Серебро 925 пробы',
  },
  {
    id: 3,
    image: '/images/portfolio-3.jpg',
    title: 'Коллекция значков',
    description: 'Разнообразие форм и дизайнов',
    material: 'Золото и серебро',
  },
  {
    id: 4,
    image: '/images/portfolio-4.jpg',
    title: 'VIP значок с рубином',
    description: 'Эксклюзивный дизайн с драгоценным камнем',
    material: 'Золото 585 пробы, рубин',
  },
  {
    id: 5,
    image: '/images/portfolio-5.jpg',
    title: 'Серебряный значок',
    description: 'Современный корпоративный стиль',
    material: 'Серебро 925 пробы',
  },
  {
    id: 6,
    image: '/images/portfolio-6.jpg',
    title: 'Золотой значок с бриллиантом',
    description: 'Премиум класс с драгоценным камнем',
    material: 'Золото 585 пробы, бриллиант',
  },
];

const Portfolio = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  
  // Состояния для формы заказа
  const [showOrderForm, setShowOrderForm] = useState(false);
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

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  // Функция отправки в Telegram
  const sendToTelegram = async (data: typeof formData, item: PortfolioItem) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Отсутствует токен Telegram');
    }

    const message = `
🛍️ <b>Заказ похожего значка с сайта ЗНАЧКОВ.РФ</b>

📌 <b>Выбранный образец:</b>
• Название: ${item.title}
• Описание: ${item.description}
• Материал: ${item.material}
• ID: ${item.id}

👤 <b>Клиент:</b>
• Имя: ${data.name || 'Не указано'}
• Телефон: ${data.phone}

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
      await sendToTelegram(formData, selectedItem!);
      
      // Закрываем модальное окно и форму
      setSelectedItem(null);
      setShowOrderForm(false);
      
      // Переход на страницу благодарности
      navigate('/thanks');
      
      // Сброс формы
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

  // Открытие формы заказа
  const openOrderForm = () => {
    setShowOrderForm(true);
  };

  // Возврат к просмотру значка
  const backToItem = () => {
    setShowOrderForm(false);
  };

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Наши работы
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Примеры <span className="text-gold-gradient">изготовленных</span> значков
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Каждый значок — это уникальное произведение ювелирного искусства, 
            созданное с вниманием к деталям
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <div
              key={item.id}
              className={`reveal opacity-0 animation-delay-${(index % 5) * 100 + 200} group relative`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-dark-light cursor-pointer card-hover">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content on hover */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-gold text-sm mb-2">{item.material}</span>
                  <h3 className="text-white font-serif text-xl mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                {/* Zoom icon */}
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowOrderForm(false); // Сбрасываем форму при открытии нового значка
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold hover:text-dark"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Border on hover */}
                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 rounded-lg transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={() => {
            setSelectedItem(null);
            setShowOrderForm(false);
          }}
        >
          <div
            className="relative max-w-4xl w-full bg-dark-light rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedItem(null);
                setShowOrderForm(false);
              }}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {!showOrderForm ? (
              // Просмотр значка
              <div className="grid md:grid-cols-2">
                <div className="aspect-square">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-gold text-sm uppercase tracking-wider mb-4">
                    {selectedItem.material}
                  </span>
                  <h3 className="font-serif text-3xl text-white mb-4">
                    {selectedItem.title}
                  </h3>
                  <p className="text-gray-400 text-lg mb-6">
                    {selectedItem.description}
                  </p>
                  <button
                    onClick={openOrderForm}
                    className="btn-primary w-fit"
                  >
                    Заказать похожий
                  </button>
                </div>
              </div>
            ) : (
              // Форма заказа
              <div className="p-8">
                {/* Кнопка назад */}
                <button
                  onClick={backToItem}
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6"
                >
                  <span>←</span>
                  <span>Вернуться к просмотру</span>
                </button>

                <div className="max-w-md mx-auto">
                  {/* Заголовок */}
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-2xl text-white mb-2">
                      Заказать похожий значок
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Вы выбрали: <span className="text-gold">{selectedItem.title}</span>
                    </p>
                  </div>

                  {/* Форма */}
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

                    {/* Чекбокс согласия */}
                    <div className="flex items-start gap-3">
                      <div className="relative flex items-center h-6">
                        <input
                          type="checkbox"
                          id="privacy-portfolio"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                        />
                      </div>
                      <label htmlFor="privacy-portfolio" className="text-sm text-gray-400 cursor-pointer">
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
                        <span>ОТПРАВИТЬ ЗАЯВКУ</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
