import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Shield, Truck, X, Upload } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константа с URL вашей Яндекс Функции для MAX
const YANDEX_MAX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';

// Максимальный размер файла: 1 МБ
const MAX_FILE_SIZE = 1024 * 1024;

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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

  // Сброс файла при закрытии модального окна
  useEffect(() => {
    if (!isModalOpen) {
      setUploadedFile(null);
      setFilePreview(null);
      setFileError(null);
    }
  }, [isModalOpen]);

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    sendMetrikaGoal('click_portfolio_button');
    sendMetrikaEvent('navigation', { to: 'portfolio', from: 'hero_button' });
  };

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

  // Вспомогательная функция для преобразования файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Функция сжатия изображения
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // Максимальный размер стороны
          
          let width = img.width;
          let height = img.height;
          
          // Пропорционально уменьшаем изображение
          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Конвертируем в JPEG с качеством 70%
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Не удалось сжать изображение'));
              }
            },
            'image/jpeg',
            0.7 // Качество 70%
          );
        };
        reader.onerror = (error) => reject(error);
      };
    });
  };

  // Функция отправки в MAX с поддержкой файлов
  const sendToMax = async (data: typeof formData, file?: File) => {
    let message = `
🎨 <b>ЗАПРОС БЕСПЛАТНОГО МАКЕТА (HERO блок)</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Hero" (первый экран)

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
    `;

    // Формируем payload
    const payload: any = { text: message };

    // Если есть файл, обрабатываем его
    if (file) {
      let fileToSend = file;
      
      // Если файл > 1 МБ и это изображение, сжимаем его
      if (file.size > MAX_FILE_SIZE) {
        if (file.type.startsWith('image/')) {
          try {
            fileToSend = await compressImage(file);
            console.log(`✅ Изображение сжато: ${(fileToSend.size / 1024).toFixed(1)} KB (было ${(file.size / 1024).toFixed(1)} KB)`);
          } catch (error) {
            console.error('Ошибка сжатия:', error);
            throw new Error('Не удалось сжать изображение. Попробуйте загрузить файл поменьше.');
          }
        } else {
          // Для не-изображений показываем ошибку
          throw new Error(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер: 1 МБ`);
        }
      }
      
      // Проверяем размер после сжатия
      if (fileToSend.size > MAX_FILE_SIZE) {
        throw new Error(`Файл слишком большой (${(fileToSend.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер: 1 МБ`);
      }
      
      const base64File = await fileToBase64(fileToSend);
      payload.file = base64File;
      payload.fileName = fileToSend.name;
      payload.fileSize = fileToSend.size;
    }

    const response = await fetch(YANDEX_MAX_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Проверяем ответ
    if (response.status === 413) {
      throw new Error('Файл слишком большой для отправки. Попробуйте загрузить изображение меньшего размера.');
    }

    const responseData = await response.json();
    if (!responseData.ok) {
      throw new Error('Ошибка отправки в MAX');
    }
    return responseData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    
    if (!isAgreed) {
      sendMetrikaEvent('form_validation_error', { reason: 'privacy_not_agreed', form: 'hero' });
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { reason: 'empty_fields', form: 'hero' });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendToMax(formData, uploadedFile);
        sendMetrikaGoal('hero_form_submit_with_file');
      } else {
        await sendToMax(formData);
        sendMetrikaGoal('hero_form_submit');
      }
      
      setIsModalOpen(false);
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'hero',
          screenWidth: window.innerWidth
        } 
      });
      
      setFormData({ name: '', phone: '' });
      setUploadedFile(null);
      setFilePreview(null);
      setIsAgreed(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      
      // Показываем понятное сообщение об ошибке
      let errorMessage = '❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.';
      if (error instanceof Error) {
        if (error.message.includes('слишком большой')) {
          errorMessage = `❌ ${error.message}`;
        } else if (error.message.includes('сжать')) {
          errorMessage = '❌ Не удалось сжать изображение. Попробуйте загрузить файл поменьше.';
        }
      }
      setFileError(errorMessage);
      
      sendMetrikaEvent('form_submit_error', { form: 'hero', error: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (!formData[name as keyof typeof formData] && value) {
      sendMetrikaEvent('form_field_filled', { field: name, form: 'hero' });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { field: fieldName, form: 'hero' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (file) {
      // Проверяем размер файла
      if (file.size > MAX_FILE_SIZE && !file.type.startsWith('image/')) {
        setFileError(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер: 1 МБ`);
        e.target.value = '';
        return;
      }
      
      setUploadedFile(file);
      
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        form: 'hero'
      });
      
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
    setFileError(null);
    sendMetrikaEvent('file_removed', { form: 'hero' });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
    setFileError(null);
    sendMetrikaGoal('open_hero_modal');
  };

  const closeModal = () => {
    if (formData.name || formData.phone || uploadedFile) {
      sendMetrikaEvent('modal_closed_with_data', { form: 'hero' });
    } else {
      sendMetrikaEvent('modal_closed_empty', { form: 'hero' });
    }
    setIsModalOpen(false);
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
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-dark-light border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in-up">
            {/* Close button */}
            <button
              onClick={closeModal}
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

              {/* Загрузка файла */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Прикрепить свой эскиз <span className="text-gray-600">(необязательно, до 1 МБ)</span>
                </label>
                
                {!uploadedFile ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="hero-file-upload"
                    />
                    <label
                      htmlFor="hero-file-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Выберите файл</span>
                    </label>
                    {fileError && (
                      <p className="text-red-500 text-xs mt-1">{fileError}</p>
                    )}
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

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start gap-3">
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    id="privacy-hero"
                    checked={isAgreed}
                    onChange={(e) => {
                      setIsAgreed(e.target.checked);
                      if (e.target.checked) {
                        sendMetrikaEvent('privacy_agreed', { form: 'hero' });
                      }
                    }}
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

              {fileError && !uploadedFile && (
                <p className="text-red-500 text-sm text-center">{fileError}</p>
              )}

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
