import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

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
  const sendTextToTelegram = async (data: typeof formData, type: BadgeType) => {
    const featuresList = type.features.map(f => `▫️ ${f}`).join('\n');

    const message = `
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
  const sendFileToTelegram = async (data: typeof formData, type: BadgeType, file: File) => {
    const featuresList = type.features.map(f => `▫️ ${f}`).join('\n');

    const caption = `
📌 <b>НОВАЯ ЗАЯВКА НА МАКЕТ С ЛОГОТИПОМ</b>
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

📎 <b>Прикрепленный логотип:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)

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
      
      // Отправляем событие о загрузке файла
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
      
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
    // Отправляем событие об удалении файла
    sendMetrikaEvent('file_removed', { 
      form: 'types',
      typeId: selectedType?.id,
      typeName: selectedType?.name
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAgreed) {
      // Отправляем событие о неудачной попытке (не согласился с политикой)
      sendMetrikaEvent('form_validation_error', { 
        reason: 'privacy_not_agreed', 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name
      });
      alert('Необходимо согласиться с политикой конфиденциальности');
      return;
    }
    
    // Валидация полей
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
        await sendFileToTelegram(formData, selectedType!, logoFile);
        // Отправляем цель в Метрику - отправка формы с файлом
        sendMetrikaGoal('types_form_submit_with_logo', { 
          typeId: selectedType?.id,
          typeName: selectedType?.name,
          typeSize: selectedType?.size
        });
      } else {
        await sendTextToTelegram(formData, selectedType!);
        // Отправляем цель в Метрику - отправка формы без файла
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
      // Отправляем событие об ошибке
      sendMetrikaEvent('form_submit_error', { 
        form: 'types',
        typeId: selectedType?.id,
        typeName: selectedType?.name,
        error: String(error) 
      });
      alert('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
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
    
    // Отправляем событие о начале заполнения поля (только первый раз)
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
    // Отправляем событие о фокусе на поле
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
    // Отправляем цель в Метрику - открытие модалки с конкретным типом
    sendMetrikaGoal('open_types_modal', { 
      typeId: type.id, 
      typeName: type.name,
      typeSize: type.size
    });
  };

  const closeModal = () => {
    // Отправляем событие о закрытии модалки
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
                className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group relative`}
              >
                <div className="h-full p-6 lg:p-8 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-gold flex flex-col">
                  {/* Фото значка с прозрачным фоном */}
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gold/10 rounded-full blur-2xl transform scale-75 opacity-50 group-hover:opacity-100 transition-opacity" />
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
                    onClick={() => openModal(type)}
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
