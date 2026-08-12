import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { X, Minus, Plus, Upload, ZoomIn, ArrowLeft } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Единая функция для MAX (как в Hero блоке)
const YANDEX_MAX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';

// Максимальный размер файла: 1 МБ (для сжатия)
const MAX_FILE_SIZE = 1024 * 1024;

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

// Вспомогательная функция для преобразования файла в base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Функция сжатия изображения (как в Hero блоке)
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        
        let width = img.width;
        let height = img.height;
        
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
          0.7
        );
      };
      reader.onerror = (error) => reject(error);
    };
  });
};

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
  const [fileError, setFileError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Отслеживаем изменение размера окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Определяем режимы на основе ширины окна
  const isLargeDesktop = windowWidth > 1600;
  const isMediumDesktop = windowWidth >= 768 && windowWidth <= 1600;
  const isMobile = windowWidth < 768;

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
      setFileError(null);
    }
  }, [selectedItem]);

  // Настройка свайпа для закрытия модального окна
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (selectedItem) {
        if (formData.name || formData.phone || uploadedFile || formData.quantity > 1) {
          sendMetrikaEvent('modal_closed_with_data', { form: 'portfolio', method: 'swipe' });
        } else {
          sendMetrikaEvent('modal_closed_empty', { form: 'portfolio', method: 'swipe' });
        }
        setSelectedItem(null);
      }
    },
    onSwiping: (eventData) => {
      if (Math.abs(eventData.deltaX) > 20) {
        eventData.event.preventDefault();
      }
    },
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  });

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

  // Единая функция отправки в MAX (как в Hero блоке)
  const sendToMax = async (data: typeof formData, item: PortfolioItem, file?: File) => {
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}${item.image}`;

    let message = `
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

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
    `;

    const payload: any = { text: message };

    // Если есть файл, преобразуем в base64 и добавляем в payload
    if (file) {
      let fileToSend = file;
      
      // Сжимаем если файл > 1 МБ и это изображение
      if (file.size > MAX_FILE_SIZE && file.type.startsWith('image/')) {
        try {
          fileToSend = await compressImage(file);
          console.log(`✅ Изображение сжато: ${(fileToSend.size / 1024).toFixed(1)} KB (было ${(file.size / 1024).toFixed(1)} KB)`);
        } catch (error) {
          console.error('Ошибка сжатия:', error);
          throw new Error('Не удалось сжать изображение. Попробуйте загрузить файл поменьше.');
        }
      }
      
      const base64File = await fileToBase64(fileToSend);
      payload.file = base64File;
      payload.fileName = fileToSend.name;
      payload.fileType = fileToSend.type || 'image/jpeg';
      
      // Добавляем в сообщение информацию о файле
      message += `\n📎 <b>Прикрепленный файл:</b> ${fileToSend.name} (${(fileToSend.size / 1024).toFixed(1)} KB)`;
      payload.text = message;
    }

    const response = await fetch(YANDEX_MAX_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
      sendMetrikaEvent('form_validation_error', { 
        reason: 'privacy_not_agreed', 
        form: 'portfolio',
        itemId: selectedItem?.id 
      });
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { 
        reason: 'empty_fields', 
        form: 'portfolio',
        itemId: selectedItem?.id 
      });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendToMax(formData, selectedItem!, uploadedFile);
        sendMetrikaGoal('portfolio_form_submit_with_file', { 
          itemId: selectedItem?.id,
          itemTitle: selectedItem?.title,
          quantity: formData.quantity
        });
      } else {
        await sendToMax(formData, selectedItem!);
        sendMetrikaGoal('portfolio_form_submit', { 
          itemId: selectedItem?.id,
          itemTitle: selectedItem?.title,
          quantity: formData.quantity
        });
      }
      
      setSelectedItem(null);
      
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
      let errorMessage = '❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.';
      if (error instanceof Error) {
        if (error.message.includes('слишком большой') || error.message.includes('сжать')) {
          errorMessage = `❌ ${error.message}`;
        }
      }
      setFileError(errorMessage);
      sendMetrikaEvent('form_submit_error', { 
        form: 'portfolio',
        itemId: selectedItem?.id,
        error: String(error) 
      });
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
      sendMetrikaEvent('form_field_filled', { 
        field: name, 
        form: 'portfolio',
        itemId: selectedItem?.id 
      });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { 
      field: fieldName, 
      form: 'portfolio',
      itemId: selectedItem?.id 
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, formData.quantity + delta);
    setFormData(prev => ({
      ...prev,
      quantity: newQuantity
    }));
    
    sendMetrikaEvent('quantity_changed', { 
      form: 'portfolio',
      itemId: selectedItem?.id,
      oldValue: formData.quantity,
      newValue: newQuantity,
      method: delta > 0 ? 'increment' : 'decrement'
    });
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
      sendMetrikaEvent('quantity_manually_entered', { 
        form: 'portfolio',
        itemId: selectedItem?.id,
        value: value
      });
    } else if (e.target.value === '') {
      setFormData(prev => ({
        ...prev,
        quantity: 1
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (file) {
      // Проверяем размер файла для не-изображений
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
        form: 'portfolio',
        itemId: selectedItem?.id
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
    sendMetrikaEvent('file_removed', { 
      form: 'portfolio',
      itemId: selectedItem?.id 
    });
  };

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    sendMetrikaGoal('open_portfolio_modal', { 
      itemId: item.id, 
      itemTitle: item.title,
      itemMaterial: item.material
    });
  };

  const closeModal = () => {
    if (formData.name || formData.phone || uploadedFile || formData.quantity > 1) {
      sendMetrikaEvent('modal_closed_with_data', { 
        form: 'portfolio',
        itemId: selectedItem?.id,
        method: 'button'
      });
    } else {
      sendMetrikaEvent('modal_closed_empty', { 
        form: 'portfolio',
        itemId: selectedItem?.id,
        method: 'button'
      });
    }
    setSelectedItem(null);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <div
              key={item.id}
              className={`reveal opacity-0 animation-delay-${(index % 5) * 100 + 200} group relative`}
            >
              <div 
                className="relative aspect-square overflow-hidden rounded-lg bg-dark-light cursor-pointer card-hover group"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 opacity-100">
                  <span className="text-gold text-xs sm:text-sm mb-1 sm:mb-2">{item.material}</span>
                  <h3 className="text-white font-serif text-base sm:text-xl mb-0.5 sm:mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{item.description}</p>
                </div>

                {isLargeDesktop && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-gold/10 text-gold border border-gold/30 rounded-lg hover:bg-gold hover:text-dark transition-all duration-300 font-medium text-sm opacity-0 group-hover:opacity-100"
                  >
                    Рассчитать похожий
                  </button>
                )}

                {isMediumDesktop && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-gold/90 rounded-full flex items-center justify-center text-dark hover:bg-gold shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                    aria-label="Рассмотреть подробнее"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                )}

                {isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-gold/90 rounded-full flex items-center justify-center text-dark hover:bg-gold shadow-lg transition-all duration-300"
                    aria-label="Рассмотреть подробнее"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                )}

                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 rounded-lg transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-dark/95 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            {...swipeHandlers}
            className="relative w-full max-w-4xl bg-dark-light rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: 'pan-y' }}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
              <div 
                className={`w-full cursor-pointer ${!isMobile && 'md:sticky md:top-0 md:h-fit'}`}
                onClick={closeModal}
              >
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <div 
                className={`${isMobile ? 'p-4' : 'p-6 lg:p-8'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className={`text-gold uppercase tracking-wider mb-2 block ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {selectedItem.material}
                </span>
                <h3 className={`font-serif text-white mb-2 ${
                  isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'
                }`}>
                  {selectedItem.title}
                </h3>
                <p className={`text-gray-400 mb-4 ${
                  isMobile ? 'text-sm' : 'text-base lg:text-lg'
                }`}>
                  {selectedItem.description}
                </p>

                <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '3' : '4'}`}>
                  <div>
                    <label className={`block text-gray-400 mb-1 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      required
                      className={`w-full bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors ${
                        isMobile 
                          ? 'px-3 py-2 text-sm' 
                          : 'px-4 py-3 text-base'
                      }`}
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div>
                    <label className={`block text-gray-400 mb-1 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      required
                      className={`w-full bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors ${
                        isMobile 
                          ? 'px-3 py-2 text-sm' 
                          : 'px-4 py-3 text-base'
                      }`}
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  <div>
                    <label className={`block text-gray-400 mb-1 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Количество (шт.) *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className={`bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors ${
                          isMobile 
                            ? 'w-8 h-8' 
                            : 'w-10 h-10'
                        }`}
                      >
                        <Minus className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                      </button>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleQuantityInput}
                        min="1"
                        required
                        className={`flex-1 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors text-center ${
                          isMobile 
                            ? 'px-3 py-2 text-sm' 
                            : 'px-4 py-3 text-base'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className={`bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors ${
                          isMobile 
                            ? 'w-8 h-8' 
                            : 'w-10 h-10'
                        }`}
                      >
                        <Plus className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-gray-400 mb-1 ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Прикрепить свой эскиз <span className="text-gray-600">(необязательно, до 1 МБ)</span>
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
                          className={`flex items-center justify-center gap-2 w-full bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer ${
                            isMobile 
                              ? 'py-2 px-3 text-sm' 
                              : 'py-3 px-4 text-base'
                          }`}
                        >
                          <Upload className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                          <span>Выберите файл</span>
                        </label>
                        {fileError && (
                          <p className="text-red-500 text-xs mt-1">{fileError}</p>
                        )}
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 sm:gap-3 bg-dark border border-gray-700 rounded-lg ${
                        isMobile ? 'p-2' : 'p-3'
                      }`}>
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className={`object-cover rounded-lg ${
                              isMobile ? 'w-8 h-8' : 'w-12 h-12'
                            }`}
                          />
                        ) : (
                          <div className={`rounded-lg bg-gold/10 flex items-center justify-center ${
                            isMobile ? 'w-8 h-8' : 'w-12 h-12'
                          }`}>
                            <Upload className={isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-gold />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-white truncate ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>{uploadedFile.name}</p>
                          <p className="text-gray-500 text-xs">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <X className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="relative flex items-center h-5 sm:h-6">
                      <input
                        type="checkbox"
                        id="privacy-portfolio"
                        checked={isAgreed}
                        onChange={(e) => {
                          setIsAgreed(e.target.checked);
                          if (e.target.checked) {
                            sendMetrikaEvent('privacy_agreed', { 
                              form: 'portfolio',
                              itemId: selectedItem?.id 
                            });
                          }
                        }}
                        className={`bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`}
                      />
                    </div>
                    <label htmlFor="privacy-portfolio" className={`text-gray-400 cursor-pointer ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
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
                    className={`w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                      isMobile 
                        ? 'mt-4 py-2 text-sm' 
                        : 'mt-6 py-3 text-base'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={`border-2 border-dark/30 border-t-dark rounded-full animate-spin ${
                          isMobile ? 'w-4 h-4' : 'w-5 h-5'
                        }`} />
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <span>ОТПРАВИТЬ ЗАЯВКУ</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gold transition-colors py-2 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Вернуться назад</span>
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
