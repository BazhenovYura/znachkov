import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Upload } from 'lucide-react';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    quantity: 1,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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

  // Сброс файла при закрытии модального окна
  useEffect(() => {
    if (!selectedItem) {
      setUploadedFile(null);
      setFilePreview(null);
    }
  }, [selectedItem]);

  // Функция отправки текста (без файла)
  const sendTextToTelegram = async (data: typeof formData, item: PortfolioItem) => {
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}${item.image}`;

    const message = `
🛍️ <b>ЗАКАЗ ПОХОЖЕГО ЗНАЧКА</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Портфолио"

📌 <b>Выбранный образец:</b>
• Название: ${item.title}
• Описание: ${item.description}
• Материал: ${item.material}
• ID: ${item.id}

━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Клиент:</b>
• Имя: ${data.name || 'Не указано'}
• Телефон: ${data.phone}
• Количество: ${data.quantity} шт.

🖼️ <b>Фото образца:</b> ${imageUrl}

⏰ <b>Время отправки (Екатеринбург):</b> ${new Date().toLocaleString('ru-RU', { 
  timeZone: 'Asia/Yekaterinburg',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `;

    const response = await fetch(YANDEX_TEXT_FUNCTION_URL, {
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

  // Функция отправки с файлом
  const sendFileToTelegram = async (data: typeof formData, item: PortfolioItem, file: File) => {
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}${item.image}`;

    const caption = `
🛍️ <b>ЗАКАЗ ПОХОЖЕГО ЗНАЧКА (С ФАЙЛОМ)</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Портфолио"

📌 <b>Выбранный образец:</b>
• Название: ${item.title}
• Описание: ${item.description}
• Материал: ${item.material}
• ID: ${item.id}

━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Клиент:</b>
• Имя: ${data.name || 'Не указано'}
• Телефон: ${data.phone}
• Количество: ${data.quantity} шт.

📎 <b>Прикрепленный файл:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)
🖼️ <b>Фото образца:</b> ${imageUrl}

⏰ <b>Время отправки (Екатеринбург):</b> ${new Date().toLocaleString('ru-RU', { 
  timeZone: 'Asia/Yekaterinburg',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    
    const response = await fetch(YANDEX_FILE_FUNCTION_URL, {
      method: 'POST',
      body: formData,
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
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendFileToTelegram(formData, selectedItem!, uploadedFile);
      } else {
        await sendTextToTelegram(formData, selectedItem!);
      }
      
      setSelectedItem(null);
      
      // Передаём секцию и ширину экрана
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'portfolio',
          screenWidth: window.innerWidth
        } 
      });
      
      setFormData({ name: '', phone: '', quantity: 1 });
      setUploadedFile(null);
      setFilePreview(null);
      setIsAgreed(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
    } else if (e.target.value === '') {
      setFormData(prev => ({
        ...prev,
        quantity: 1
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Если это изображение, создаем превью
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <div
              key={item.id}
              className={`reveal opacity-0 animation-delay-${(index % 5) * 100 + 200} group relative`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-dark-light cursor-pointer card-hover">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-gold text-sm mb-2">{item.material}</span>
                  <h3 className="text-white font-serif text-xl mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                {/* Кнопка "Рассчитать похожий" - адаптивная для мобильных */}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-dark font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold-light text-xs sm:text-sm max-w-[120px] sm:max-w-none text-center break-words"
                >
                  Рассчитать похожий
                </button>

                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 rounded-lg transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-dark-light rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Единое окно с фото, описанием и формой */}
            <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
              {/* Левая колонка - фото */}
              <div className="aspect-square sticky top-0">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Правая колонка - описание и форма */}
              <div className="p-8 overflow-y-auto">
                <span className="text-gold text-sm uppercase tracking-wider mb-4">
                  {selectedItem.material}
                </span>
                <h3 className="font-serif text-3xl text-white mb-4">
                  {selectedItem.title}
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                  {selectedItem.description}
                </p>

                {/* Форма заказа */}
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

                  {/* Поле количества с кнопками + и - */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Количество (шт.) *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleQuantityInput}
                        min="1"
                        required
                        className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Загрузка файла */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Прикрепить свой эскиз <span className="text-gray-600">(необязательно)</span>
                    </label>
                    
                    {!uploadedFile ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="portfolio-file-upload"
                        />
                        <label
                          htmlFor="portfolio-file-upload"
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5" />
                          <span>Выберите файл</span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-dark border border-gray-700 rounded-lg">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gold" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{uploadedFile.name}</p>
                          <p className="text-gray-500 text-xs">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
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
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
