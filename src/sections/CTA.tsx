import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, X, Upload } from 'lucide-react';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

const CTA = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Состояния для модального окна
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

  const getEkaterinburgTime = () => {
    return new Date().toLocaleString('ru-RU', { 
      timeZone: 'Asia/Yekaterinburg',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция отправки текста (без файла)
  const sendTextToTelegram = async (data: typeof formData) => {
    const message = `
🎨 <b>ЗАЯВКА НА БЕСПЛАТНЫЙ МАКЕТ (CTA блок)</b>
━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
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
  const sendFileToTelegram = async (data: typeof formData, file: File) => {
    const caption = `
🎨 <b>ЗАЯВКА НА БЕСПЛАТНЫЙ МАКЕТ С ЛОГОТИПОМ (CTA блок)</b>
━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}

📎 <b>Логотип:</b> ${file.name}

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
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

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAgreed) {
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (logoFile) {
        await sendFileToTelegram(formData, logoFile);
      } else {
        await sendTextToTelegram(formData);
      }
      
      setIsModalOpen(false);
      
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'cta',
          screenWidth: window.innerWidth
        } 
      });
      
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
  };

  return (
    <>
      <section
        id="cta"
        ref={sectionRef}
        className="py-20 lg:py-32 relative overflow-hidden"
      >
        {/* Gold gradient background */}
        <div className="absolute inset-0 bg-gold-gradient">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-dark/20 via-transparent to-gold-dark/20" />
        </div>

        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="reveal opacity-0 inline-block text-dark/70 text-sm uppercase tracking-widest mb-4">
              Специальное предложение
            </span>
            
            <h2 className="reveal opacity-0 animation-delay-100 font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-dark mb-6">
              ПОЛУЧИТЕ БЕСПЛАТНЫЙ<br />
              МАКЕТ ЗНАЧКА
            </h2>
            
            <p className="reveal opacity-0 animation-delay-200 text-dark/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Оставьте заявку и мы создадим 3D-визуализацию вашего значка 
              абсолютно бесплатно — без обязательств и скрытых условий
            </p>

            <div className="reveal opacity-0 animation-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={openModal}
                className="px-8 py-4 bg-dark text-gold font-semibold rounded-sm hover:bg-dark-light transition-all duration-300 flex items-center gap-2 group animate-pulse-gold"
              >
                <span>ОСТАВИТЬ ЗАЯВКУ</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="tel:+79227474474"
                className="flex items-center gap-2 text-dark font-semibold hover:text-dark/80 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+7 (922) 74-74-4-74</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Модальное окно */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-dark-light border border-gray-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-gray-800">
              <h3 className="font-serif text-2xl text-white">
                Получить бесплатный макет
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Заполните форму и мы создадим 3D-визуализацию вашего значка
              </p>
            </div>

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
                      id="cta-logo-upload"
                    />
                    <label
                      htmlFor="cta-logo-upload"
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

              <div className="flex items-start gap-3">
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    id="cta-privacy"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="cta-privacy" className="text-sm text-gray-400 cursor-pointer">
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
                className="w-full px-8 py-4 bg-gold text-dark font-semibold rounded-sm hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
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

export default CTA;
