import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

const Contact = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Состояния для формы
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | ReactNode>('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSubmitError('');
    
    // Отправляем событие о начале заполнения поля (только первый раз)
    if (!formData[name as keyof typeof formData] && value) {
      sendMetrikaEvent('form_field_filled', { field: name, form: 'contact' });
    }
  };

  const handleFocus = (fieldName: string) => {
    // Отправляем событие о фокусе на поле
    sendMetrikaEvent('form_field_focus', { field: fieldName, form: 'contact' });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked);
    if (e.target.checked) {
      setConsentError('');
      sendMetrikaEvent('privacy_agreed', { form: 'contact' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Отправляем событие о загрузке файла
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        form: 'contact'
      });
      
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
    // Отправляем событие об удалении файла
    sendMetrikaEvent('file_removed', { form: 'contact' });
  };

  // Функция отправки текста (без файла)
  const sendTextToTelegram = async (data: typeof formData) => {
    const message = `
🔥 <b>НОВАЯ ЗАЯВКА С САЙТА ЗНАЧКОВ.РФ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Контакты" (низ страницы)

👤 <b>Имя:</b> ${data.name || 'Не указано'}
🏢 <b>Компания:</b> ${data.company || 'Не указана'}
📞 <b>Телефон:</b> ${data.phone}
📧 <b>Email:</b> ${data.email || 'Не указан'}
💬 <b>Комментарий:</b> ${data.comment || 'Без комментария'}

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
  const sendFileToTelegram = async (data: typeof formData, file: File) => {
    const caption = `
🔥 <b>НОВАЯ ЗАЯВКА С САЙТА ЗНАЧКОВ.РФ (С ФАЙЛОМ)</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Блок "Контакты" (низ страницы)

👤 <b>Имя:</b> ${data.name || 'Не указано'}
🏢 <b>Компания:</b> ${data.company || 'Не указана'}
📞 <b>Телефон:</b> ${data.phone}
📧 <b>Email:</b> ${data.email || 'Не указан'}
💬 <b>Комментарий:</b> ${data.comment || 'Без комментария'}

📎 <b>Прикрепленный файл:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)

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
    setSubmitError('');
    
    if (!isAgreed) {
      setConsentError('Необходимо согласиться с политикой конфиденциальности');
      // Отправляем событие о неудачной попытке
      sendMetrikaEvent('form_validation_error', { 
        reason: 'privacy_not_agreed', 
        form: 'contact' 
      });
      const checkboxElement = document.getElementById('privacy-checkbox');
      if (checkboxElement) {
        checkboxElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Валидация полей
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { 
        reason: 'empty_fields', 
        form: 'contact' 
      });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setConsentError('');
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendFileToTelegram(formData, uploadedFile);
        // Отправляем цель в Метрику - отправка формы с файлом
        sendMetrikaGoal('contact_form_submit_with_file', {
          hasComment: !!formData.comment,
          hasCompany: !!formData.company,
          hasEmail: !!formData.email
        });
      } else {
        await sendTextToTelegram(formData);
        // Отправляем цель в Метрику - отправка формы без файла
        sendMetrikaGoal('contact_form_submit', {
          hasComment: !!formData.comment,
          hasCompany: !!formData.company,
          hasEmail: !!formData.email
        });
      }
      
      setIsSubmitted(true);
      setFormData({ name: '', company: '', phone: '', email: '', comment: '' });
      setUploadedFile(null);
      setFilePreview(null);
      setIsAgreed(false);
      
      // Переход на страницу благодарности с передачей секции и ширины экрана
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'contact',
          screenWidth: window.innerWidth
        } 
      });
      
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      // Отправляем событие об ошибке
      sendMetrikaEvent('form_submit_error', { 
        form: 'contact', 
        error: String(error) 
      });
      setSubmitError(
        <span>
          ❌ Ошибка отправки. Попробуйте позже или свяжитесь напрямую:{' '}
          <a 
            href="tel:+79227474474" 
            className="text-gold hover:text-gold-light underline font-medium"
          >
            по телефону
          </a>
          {' '}или в{' '}
          <a 
            href="https://t.me/BazhenovYuri" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light underline font-medium"
          >
            Telegram
          </a>
        </span>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Телефон',
      value: '+7 (922) 74-74-4-74',
      href: 'tel:+79227474474',
      onClick: () => sendMetrikaGoal('phone_click')
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'znachkoff@gmail.com',
      href: 'mailto:znachkoff@gmail.com',
      onClick: () => sendMetrikaEvent('email_click')
    },
    {
      icon: MapPin,
      label: 'Адрес',
      value: 'Челябинская область, г.Озерск, пр.Победы, 55',
      href: 'https://yandex.ru/maps/org/uralskiy_yuvelir/1119071637/',
      onClick: () => sendMetrikaEvent('address_click')
    },
    {
      icon: Clock,
      label: 'Режим работы',
      value: 'Пн-Пт 9:00-18:00',
      href: '#',
    },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Контакты
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Оставить <span className="text-gold-gradient">заявку</span>
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Заполните форму и мы свяжемся с вами в течение часа 
            для обсуждения вашего проекта
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="reveal opacity-0 animation-delay-200">
            <h3 className="font-serif text-2xl text-white mb-8">
              Свяжитесь с нами
            </h3>
            
            <div className="space-y-6 mb-10">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={item.onClick}
                  className="flex items-start gap-4 group"
                  target={item.href !== '#' ? '_blank' : undefined}
                  rel={item.href !== '#' ? 'noopener noreferrer' : undefined}
                >
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">
                      {item.label}
                    </span>
                    <span className="text-white group-hover:text-gold transition-colors">
                      {item.value}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Requisites */}
            <div className="p-6 bg-dark-light rounded-lg border border-gray-800">
              <h4 className="text-white font-medium mb-4">Реквизиты</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>ИП Баженов Юрий Николаевич</p>
                <p>ИНН: 667115263758</p>
                <p>ТПК "Уральский ювелир"</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="reveal opacity-0 animation-delay-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Компания
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onFocus={() => handleFocus('company')}
                    className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Название компании"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="email@company.ru"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Комментарий
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  onFocus={() => handleFocus('comment')}
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="Опишите ваши пожелания: количество, размер, материал..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Прикрепить файл <span className="text-gray-600">(необязательно)</span>
                </label>
                
                {!uploadedFile ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="contact-file-upload"
                    />
                    <label
                      htmlFor="contact-file-upload"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark-light border border-gray-800 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Выберите файл (изображение, PDF, документ)</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-dark-light border border-gray-800 rounded-lg">
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
              <div className="space-y-2">
                <div className="flex items-start gap-3" id="privacy-checkbox">
                  <div className="relative flex items-center h-6">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={isAgreed}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 bg-dark-light border border-gray-800 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                    />
                  </div>
                  <label htmlFor="privacy" className="text-sm text-gray-400 cursor-pointer">
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
                
                {/* Consent Error Message */}
                {consentError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-red-500 text-sm">
                      {consentError}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message с альтернативными контактами */}
              {submitError && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-500 text-sm">
                    {submitError}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <span>ОТПРАВИТЬ ЗАЯВКУ</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Success Message */}
              {isSubmitted && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-500 text-sm">
                    Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
