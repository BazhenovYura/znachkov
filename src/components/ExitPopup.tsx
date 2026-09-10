import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Send, AlertCircle, Gift } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

const ExitPopup = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    comment: 'Рассчитайте, пожалуйста, партию для получения скидки на первый заказ: в золоте/серебре, количество Х штук, размер габаритов 10х10мм'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [consentError, setConsentError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Проверяем при загрузке, был ли уже показан попап в этой сессии
  useEffect(() => {
    const wasShown = sessionStorage.getItem('exit_popup_shown');
    if (wasShown === 'true') {
      setHasBeenShown(true);
    }
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Если попап уже был показан - не показываем повторно
      if (hasBeenShown) return;
      
      // Если курсор уходит за пределы окна вверх (к закрытию)
      if (e.clientY <= 0 && !isVisible) {
        setIsVisible(true);
        setHasBeenShown(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
        sendMetrikaGoal('exit_popup_shown');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Если попап уже был показан - не показываем повторно
      if (hasBeenShown) return;
      
      // Показываем модалку при попытке закрыть вкладку
      if (!isVisible) {
        e.preventDefault();
        setIsVisible(true);
        setHasBeenShown(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
        sendMetrikaGoal('exit_popup_shown');
        return '';
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isVisible, hasBeenShown]);

  // Блокировка скролла при открытом попапе
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

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

  const sendTextToTelegram = async (data: typeof formData) => {
    const message = `
🎁 <b>СРОЧНАЯ ЗАЯВКА НА СКИДКУ (EXIT-ПОПАП)</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Всплывающее окно при закрытии вкладки

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}
💬 <b>Комментарий:</b> ${data.comment}

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

  const sendFileToTelegram = async (data: typeof formData, file: File) => {
    const caption = `
🎁 <b>СРОЧНАЯ ЗАЯВКА НА СКИДКУ (EXIT-ПОПАП)</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Всплывающее окно при закрытии вкладки

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📞 <b>Телефон:</b> ${data.phone}
💬 <b>Комментарий:</b> ${data.comment}

📎 <b>Прикрепленный файл:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSubmitError('');
    
    if (!formData[name as keyof typeof formData] && value) {
      sendMetrikaEvent('form_field_filled', { field: name, form: 'exit_popup' });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { field: fieldName, form: 'exit_popup' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        form: 'exit_popup'
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
    sendMetrikaEvent('file_removed', { form: 'exit_popup' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setConsentError('');
    
    if (!isAgreed) {
      setConsentError('Необходимо согласиться с политикой конфиденциальности');
      sendMetrikaEvent('form_validation_error', { 
        reason: 'privacy_not_agreed', 
        form: 'exit_popup' 
      });
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { 
        reason: 'empty_fields', 
        form: 'exit_popup' 
      });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendFileToTelegram(formData, uploadedFile);
        sendMetrikaGoal('exit_popup_form_submit_with_file');
      } else {
        await sendTextToTelegram(formData);
        sendMetrikaGoal('exit_popup_form_submit');
      }
      
      setIsVisible(false);
      navigate('/thanks', { 
        state: { 
          from: '/',
          section: 'hero',
          screenWidth: window.innerWidth
        } 
      });
      
      setFormData({
        name: '',
        phone: '',
        comment: 'Рассчитайте, пожалуйста, партию для получения скидки на первый заказ: в золоте/серебре, количество Х штук, размер габаритов 10х10мм'
      });
      setUploadedFile(null);
      setFilePreview(null);
      setIsAgreed(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      sendMetrikaEvent('form_submit_error', { 
        form: 'exit_popup', 
        error: String(error) 
      });
      setSubmitError('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopup = () => {
    sendMetrikaEvent('exit_popup_closed', { 
      hasData: !!(formData.name || formData.phone || uploadedFile) 
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-dark-light border border-gold/30 rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-dark/80 rounded-full flex items-center justify-center text-gray-500 hover:text-gold hover:bg-dark transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with gold gradient and styled icon */}
        <div className="relative bg-gradient-to-r from-gold/20 to-gold/5 px-6 py-8 text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
          
          {/* Стилизованная иконка подарка */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/50 shadow-gold">
              <Gift className="w-10 h-10 text-gold" />
            </div>
          </div>
          
          <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
            <span className="text-gold-gradient">Ограниченное предложение!</span>
          </h3>
          <p className="text-gold/80 text-sm uppercase tracking-wider">
            Только для тех, кто собирается уйти
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-white text-lg mb-2">
              Оставь заявку на расчет и получи{' '}
              <span className="text-gold-gradient font-bold">скидку на первый заказ!</span>
            </p>
            <p className="text-gray-400 text-sm">
              Менеджер свяжется с вами в ближайшее время
            </p>
          </div>

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
                className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors resize-none text-sm"
                placeholder="Рассчитайте, пожалуйста, партию для получения скидки на первый заказ..."
              />
              <p className="text-gray-500 text-xs mt-1">
                <span className="text-gold">✦</span> Укажите желаемый металл (золото/серебро), количество и размер
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Прикрепить эскиз <span className="text-gray-600">(необязательно)</span>
              </label>
              
              {!uploadedFile ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="exit-file-upload"
                  />
                  <label
                    htmlFor="exit-file-upload"
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

            {/* Privacy Policy Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="relative flex items-center h-6">
                  <input
                    type="checkbox"
                    id="privacy-exit"
                    checked={isAgreed}
                    onChange={(e) => {
                      setIsAgreed(e.target.checked);
                      if (e.target.checked) {
                        setConsentError('');
                        sendMetrikaEvent('privacy_agreed', { form: 'exit_popup' });
                      }
                    }}
                    className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="privacy-exit" className="text-sm text-gray-400 cursor-pointer">
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
              
              {consentError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-500 text-sm">{consentError}</span>
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-500 text-sm">{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <span>ПОЛУЧИТЬ СКИДКУ</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExitPopup;
