import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Конфигурация Telegram
const TELEGRAM_BOT_TOKEN = '7981489499:AAF6_AyeVt0mQGUd_IdKRFrYT7YR23hpmgg';
const TELEGRAM_CHAT_ID = '180758065';

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Сбрасываем ошибку при изменении формы
    setSubmitError('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAgreed(e.target.checked);
    if (e.target.checked) {
      setConsentError('');
    }
  };

  // Функция отправки в Telegram
  const sendToTelegram = async (data: typeof formData) => {
    const message = `
🔥 <b>Новая заявка с сайта ЗНАЧКОВ.РФ</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
🏢 <b>Компания:</b> ${data.company || 'Не указана'}
📞 <b>Телефон:</b> ${data.phone}
📧 <b>Email:</b> ${data.email || 'Не указан'}
💬 <b>Комментарий:</b> ${data.comment || 'Без комментария'}

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

    if (!response.ok) {
      throw new Error('Ошибка отправки в Telegram');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    // Check if user agreed to privacy policy
    if (!isAgreed) {
      setConsentError('Необходимо согласиться с политикой конфиденциальности');
      const checkboxElement = document.getElementById('privacy-checkbox');
      if (checkboxElement) {
        checkboxElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setConsentError('');
    setIsSubmitting(true);
    
    try {
      // Отправляем данные в Telegram
      await sendToTelegram(formData);
      
      // Если успешно
      setIsSubmitted(true);
      setFormData({ name: '', company: '', phone: '', email: '', comment: '' });
      setIsAgreed(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setSubmitError('Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
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
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'znachkoff@gmail.com',
      href: 'mailto:znachkoff@gmail.com',
    },
    {
      icon: MapPin,
      label: 'Адрес',
      value: 'Челябинская область, г.Озерск, пр.Победы, 55',
      href: 'https://yandex.ru/maps/org/uralskiy_yuvelir/1119071637/',
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
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-light border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder="Опишите ваши пожелания: количество, размер, материал..."
                />
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

              {/* Error Message */}
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
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
