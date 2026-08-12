import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Единая функция для MAX (как в Hero и Portfolio блоках)
const YANDEX_MAX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';

// Максимальный размер файла: 1 МБ (для сжатия)
const MAX_FILE_SIZE = 1024 * 1024;

interface BadgeType {
  id: string;
  name: string;
  image: string;
  description: string;
  features: string[];
  size: string;
}

const badgeTypes: BadgeType[] = [
  {
    id: 'maxi',
    name: 'MAXI',
    image: '/images/types-maxi.png',
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
    image: '/images/types-midi.png',
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
    image: '/images/types-mini.png',
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
    image: '/images/types-micro.png',
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

const Types = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  
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

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    if (!isModalOpen) {
      setLogoFile(null);
      setLogoPreview(null);
      setFileError(null);
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

  // Единая функция отправки в MAX (как в Hero и Portfolio блоках)
  const sendToMax = async (data: typeof formData, type: BadgeType, file?: File) => {
    const featuresList = type.features.map(f => `▫️ ${f}`).join('\n');

    let message = `
📌 <b>НОВАЯ ЗАЯВКА НА МАКЕТ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Типы значков"

🔹 <b>Выбранный формат:</b> ${type.name} (${type.size})
📝 <b>Описание формата:</b> ${type.description}

<b>Характеристики формата ${type.name}:</b>
${featuresList}

━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Клиент:</b>
• Имя: ${data.name || 'Не указано'}
• Телефон: ${data.phone}

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
      message += `\n📎 <b>Прикрепленный логотип:</b> ${fileToSend.name} (${(fileToSend.size / 1024).toFixed(1)} KB)`;
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
      
      setLogoFile(file);
      
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setLogoPreview(null);
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFileError(null);
    sendMetrikaEvent('file_removed', { 
      form: 'types',
      typeId: selectedType?.id,
      typeName: selectedType?.name
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError(null);
    
    if (!isAgreed) {
      sendMetrikaEvent('form_validation_error', { 
        reason: 'privacy_not_agreed', 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { 
        reason: 'empty_fields', 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (logoFile) {
        await sendToMax(formData, selectedType!, logoFile);
        sendMetrikaGoal('types_form_submit_with_logo', { 
          typeId: selectedType?.id,
          typeName: selectedType?.name,
          typeSize: selectedType?.size
        });
      } else {
        await sendToMax(formData, selectedType!);
        sendMetrikaGoal('types_form_submit', { 
          typeId: selectedType?.id,
          typeName: selectedType?.name,
          typeSize: selectedType?.size
        });
      }
      
      setIsModalOpen(false);
      
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'types',
          screenWidth: window.innerWidth
        } 
      });
      
      setFormData({ name: '', phone: '' });
      setLogoFile(null);
      setLogoPreview(null);
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
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name,
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
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { 
      field: fieldName, 
      form: 'types',
      typeId: selectedType?.id,
      typeName: selectedType?.name
    });
  };

  const openModal = (type: BadgeType) => {
    setSelectedType(type);
    setIsModalOpen(true);
    setFileError(null);
    sendMetrikaGoal('open_types_modal', { 
      typeId: type.id, 
      typeName: type.name,
      typeSize: type.size
    });
  };

  const closeModal = () => {
    if (formData.name || formData.phone || logoFile) {
      sendMetrikaEvent('modal_closed_with_data', { 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
    } else {
      sendMetrikaEvent('modal_closed_empty', { 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <section
        id="types"
        ref={sectionRef}
        className="py-20 lg:py-32"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badgeTypes.map((type, index) => (
              <div
                key={type.id}
                className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group`}
              >
                <div 
                  className="h-full p-6 lg:p-8 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-gold flex flex-col cursor-pointer"
                  onClick={() => openModal(type)}
                >
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gold/10 rounded-full blur-2xl transform scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                      src={type.image}
                      alt={type.name}
                      className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>

                  <div className="flex items-baseline gap-3 mb-4 justify-center">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {type.name}
                    </h3>
                    <span className="text-gold text-sm">{type.size}</span>
                  </div>

                  <p className="text-gray-400 text-sm mb-6 text-center">
                    {type.description}
                  </p>

                  <ul className="space-y-3 mb-6 flex-grow">
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(type);
                    }}
                    className="w-full py-2 px-4 bg-gold/10 text-gold rounded-lg hover:bg-gold hover:text-dark transition-all duration-300 font-medium text-sm mt-auto"
                  >
                    Получить макет
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isModalOpen && selectedType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative max-w-lg w-full bg-dark-light border border-gray-800 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                  <img
                    src={selectedType.image}
                    alt={selectedType.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-white">
                    Получить макет в формате <span className="text-gold-gradient">{selectedType.name}</span>
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Размер: {selectedType.size}
                  </p>
                </div>
              </div>
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

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Загрузить свой логотип <span className="text-gray-600">(необязательно, до 1 МБ)</span>
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
                    {fileError && (
                      <p className="text-red-500 text-xs mt-1">{fileError}</p>
                    )}
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
                    id="privacy-types"
                    checked={isAgreed}
                    onChange={(e) => {
                      setIsAgreed(e.target.checked);
                      if (e.target.checked) {
                        sendMetrikaEvent('privacy_agreed', { 
                          form: 'types',
                          typeId: selectedType.id,
                          typeName: selectedType.name
                        });
                      }
                    }}
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

              {fileError && !logoFile && (
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
