import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, X, Calculator, Gift, TrendingUp, Shield } from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

const PriceCalculator = () => {
  const navigate = useNavigate();
  
  // Состояния для калькулятора
  const [calculatorData, setCalculatorData] = useState({
    type: 'maxi',
    material: 'gold',
    quantity: 500,
    size: '25-35',
  });
  
  // Состояния для формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const types = {
    maxi: { name: 'MAXI', size: '25-35 мм', multiplier: 2.0 },
    midi: { name: 'MIDI', size: '20-25 мм', multiplier: 1.5 },
    mini: { name: 'MINI', size: '15-20 мм', multiplier: 1.0 },
    micro: { name: 'MICRO', size: '10-15 мм', multiplier: 0.7 },
  };

  const materials = {
    gold: { name: 'Золото 585', price: 500, multiplier: 3.0 },
    silver: { name: 'Серебро 925', price: 100, multiplier: 1.0 },
  };

  const sizes = {
    '10-15': { name: '10-15 мм', multiplier: 0.5 },
    '15-20': { name: '15-20 мм', multiplier: 0.8 },
    '20-25': { name: '20-25 мм', multiplier: 1.0 },
    '25-35': { name: '25-35 мм', multiplier: 1.3 },
  };

  useEffect(() => {
    const typeMult = types[calculatorData.type as keyof typeof types]?.multiplier || 1;
    const materialMult = materials[calculatorData.material as keyof typeof materials]?.multiplier || 1;
    const sizeMult = sizes[calculatorData.size as keyof typeof sizes]?.multiplier || 1;
    const basePrice = materials[calculatorData.material as keyof typeof materials]?.price || 100;
    
    const calculated = basePrice * calculatorData.quantity * typeMult * materialMult * sizeMult;
    setEstimatedPrice(Math.round(calculated));
  }, [calculatorData]);

  useEffect(() => {
    window.scrollTo(0, 0);
    sendMetrikaEvent('calculator_page_view');
  }, []);

  const handleCalculatorChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setCalculatorData(prev => ({ ...prev, [name]: value }));
    sendMetrikaEvent('calculator_param_change', { param: name, value });
    if (!showForm) {
      setShowForm(true);
      sendMetrikaEvent('calculator_form_shown');
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(10, Math.min(10000, calculatorData.quantity + delta));
    setCalculatorData(prev => ({ ...prev, quantity: newQuantity }));
    sendMetrikaEvent('calculator_quantity_change', { quantity: newQuantity });
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 500;
    value = Math.max(10, Math.min(10000, value));
    setCalculatorData(prev => ({ ...prev, quantity: value }));
    sendMetrikaEvent('calculator_quantity_manual', { quantity: value });
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

  const sendTextToTelegram = async () => {
    const message = `💰 <b>ЗАПРОС ТОЧНОГО РАСЧЕТА СТОИМОСТИ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Страница калькулятора

<b>📊 Параметры заказа:</b>
• Тип: ${types[calculatorData.type as keyof typeof types]?.name}
• Материал: ${materials[calculatorData.material as keyof typeof materials]?.name}
• Количество: ${calculatorData.quantity} шт.
• Размер: ${sizes[calculatorData.size as keyof typeof sizes]?.name}
• Предварительная цена: ${estimatedPrice.toLocaleString()} ₽

━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Клиент:</b>
• Имя: ${formData.name || 'Не указано'}
• Телефон: ${formData.phone}
• Email: ${formData.email || 'Не указан'}

${formData.comment ? `💬 <b>Комментарий:</b> ${formData.comment}\n` : ''}
⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}`;

    const response = await fetch(YANDEX_TEXT_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const responseData = await response.json();
    if (!responseData.ok) throw new Error('Ошибка отправки в Telegram');
    return responseData;
  };

  const sendFileToTelegram = async (file: File) => {
    const caption = `💰 <b>ЗАПРОС ТОЧНОГО РАСЧЕТА СТОИМОСТИ С ЭСКИЗОМ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Страница калькулятора

<b>📊 Параметры заказа:</b>
• Тип: ${types[calculatorData.type as keyof typeof types]?.name}
• Материал: ${materials[calculatorData.material as keyof typeof materials]?.name}
• Количество: ${calculatorData.quantity} шт.
• Размер: ${sizes[calculatorData.size as keyof typeof sizes]?.name}
• Предварительная цена: ${estimatedPrice.toLocaleString()} ₽

━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Клиент:</b>
• Имя: ${formData.name || 'Не указано'}
• Телефон: ${formData.phone}
• Email: ${formData.email || 'Не указан'}

${formData.comment ? `💬 <b>Комментарий:</b> ${formData.comment}\n` : ''}
📎 <b>Прикрепленный эскиз:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}`;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);
    const response = await fetch(YANDEX_FILE_FUNCTION_URL, { method: 'POST', body: fd });
    const responseData = await response.json();
    if (!responseData.ok) throw new Error('Ошибка отправки в Telegram');
    return responseData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setConsentError('');
    
    if (!isAgreed) {
      setConsentError('Необходимо согласиться с политикой конфиденциальности');
      sendMetrikaEvent('form_validation_error', { reason: 'privacy_not_agreed', form: 'calculator' });
      return;
    }
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      sendMetrikaEvent('form_validation_error', { reason: 'empty_fields', form: 'calculator' });
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (uploadedFile) {
        await sendFileToTelegram(uploadedFile);
        sendMetrikaGoal('calculator_form_submit_with_file');
      } else {
        await sendTextToTelegram();
        sendMetrikaGoal('calculator_form_submit');
      }
      
      sendMetrikaGoal('calculator_lead_generated', {
        orderType: types[calculatorData.type as keyof typeof types]?.name,
        quantity: calculatorData.quantity,
        estimatedPrice: estimatedPrice
      });
      
      navigate('/thanks', { 
        state: { 
          from: '/price-calculator',
          section: 'calculator',
          screenWidth: window.innerWidth
        } 
      });
      
      setFormData({ name: '', phone: '', email: '', comment: '' });
      setUploadedFile(null);
      setFilePreview(null);
      setIsAgreed(false);
      setShowForm(false);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      sendMetrikaEvent('form_submit_error', { form: 'calculator', error: String(error) });
      setSubmitError('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
    if (!formData[name as keyof typeof formData] && value) {
      sendMetrikaEvent('form_field_filled', { field: name, form: 'calculator' });
    }
  };

  const handleFocus = (fieldName: string) => {
    sendMetrikaEvent('form_field_focus', { field: fieldName, form: 'calculator' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      sendMetrikaEvent('file_uploaded', { fileName: file.name, fileSize: file.size, fileType: file.type, form: 'calculator' });
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    sendMetrikaEvent('file_removed', { form: 'calculator' });
  };

  useEffect(() => {
    if (showForm) {
      const typeName = types[calculatorData.type as keyof typeof types]?.name;
      const materialName = materials[calculatorData.material as keyof typeof materials]?.name;
      const sizeName = sizes[calculatorData.size as keyof typeof sizes]?.name;
      setFormData(prev => ({
        ...prev,
        comment: `Хочу заказать ${typeName} (${sizeName}) из ${materialName}, тираж ${calculatorData.quantity} шт. Рассчитайте точную стоимость и подберите скидку под этот заказ.`
      }));
    }
  }, [calculatorData, showForm]);

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm">Калькулятор стоимости</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Рассчитайте стоимость <span className="text-gold-gradient">партии значков</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Заполните параметры заказа, прикрепите логотип и получите точный расчет 
            со специальной скидкой за обращение через этот раздел
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-400">Расчет за 2 минуты</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-gray-400">Скидка на первый заказ</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              <span className="text-gray-400">Предложение действительно 24 часа</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up animation-delay-100 backdrop-blur-sm">
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-6 text-center">Шаг 1. Выберите параметры заказа</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Тип значка *</label>
                <select name="type" value={calculatorData.type} onChange={handleCalculatorChange} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:border-gold focus:outline-none transition-colors cursor-pointer">
                  <option value="maxi">MAXI — 25-35 мм (полный логотип, драгкамни)</option>
                  <option value="midi">MIDI — 20-25 мм (основной символ, эмаль)</option>
                  <option value="mini">MINI — 15-20 мм (компактный, экономичный)</option>
                  <option value="micro">MICRO — 10-15 мм (массовый, минимальная цена)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Материал *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="material" value="gold" checked={calculatorData.material === 'gold'} onChange={handleCalculatorChange} className="w-4 h-4 text-gold focus:ring-gold" />
                    <span className="text-white">Золото 585</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="material" value="silver" checked={calculatorData.material === 'silver'} onChange={handleCalculatorChange} className="w-4 h-4 text-gold focus:ring-gold" />
                    <span className="text-white">Серебро 925</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Количество (шт.) *</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleQuantityChange(-100)} className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors">−100</button>
                  <button type="button" onClick={() => handleQuantityChange(-10)} className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors">−10</button>
                  <input type="number" name="quantity" value={calculatorData.quantity} onChange={handleQuantityInput} min="10" max="10000" step="10" className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white text-center focus:border-gold focus:outline-none transition-colors" />
                  <button type="button" onClick={() => handleQuantityChange(10)} className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors">+10</button>
                  <button type="button" onClick={() => handleQuantityChange(100)} className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors">+100</button>
                </div>
                <p className="text-gray-500 text-xs mt-2">От 10 до 10 000 штук</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Размер</label>
                <select name="size" value={calculatorData.size} onChange={handleCalculatorChange} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:border-gold focus:outline-none transition-colors cursor-pointer">
                  <option value="10-15">10-15 мм — Микро</option>
                  <option value="15-20">15-20 мм — Мини</option>
                  <option value="20-25">20-25 мм — Средний</option>
                  <option value="25-35">25-35 мм — Макси</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Предварительная стоимость</p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-gold-gradient">{estimatedPrice.toLocaleString()} ₽</p>
              <p className="text-gray-500 text-xs mt-2">*Для точного расчета оставьте заявку ниже</p>
            </div>
          </div>

          {showForm && (
            <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in-up backdrop-blur-sm">
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-2 text-center">Шаг 2. Получите точный расчет</h2>
              <p className="text-gray-400 text-sm text-center mb-6">Заполните форму и получите персональное предложение со скидкой</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Ваше имя *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} onFocus={() => handleFocus('name')} required className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors" placeholder="Иван Иванов" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Телефон *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => handleFocus('phone')} required className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors" placeholder="+7 (___) ___-__-__" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => handleFocus('email')} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors" placeholder="ivan@company.ru" />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Комментарий</label>
                  <textarea name="comment" value={formData.comment} onChange={handleChange} onFocus={() => handleFocus('comment')} rows={4} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors resize-none" />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Загрузить логотип / эскиз <span className="text-gray-600">(необязательно)</span></label>
                  {!uploadedFile ? (
                    <div className="relative">
                      <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="calculator-file-upload" />
                      <label htmlFor="calculator-file-upload" className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors cursor-pointer">
                        <Upload className="w-5 h-5" /><span>Выберите файл</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-dark border border-gray-700 rounded-lg">
                      {filePreview ? <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center"><Upload className="w-6 h-6 text-gold" /></div>}
                      <div className="flex-1 min-w-0"><p className="text-white text-sm truncate">{uploadedFile.name}</p><p className="text-gray-500 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</p></div>
                      <button type="button" onClick={removeFile} className="text-gray-500 hover:text-red-500"><X className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="privacy-calculator" checked={isAgreed} onChange={(e) => { setIsAgreed(e.target.checked); if (e.target.checked) { setConsentError(''); sendMetrikaEvent('privacy_agreed', { form: 'calculator' }); } }} className="w-5 h-5 bg-dark border border-gray-700 rounded focus:ring-gold focus:ring-2 text-gold cursor-pointer" />
                    <label htmlFor="privacy-calculator" className="text-sm text-gray-400 cursor-pointer">Я соглашаюсь с <a href="https://disk.yandex.ru/i/SUN1UhIcS4pW7Q" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline">политикой конфиденциальности</a> и даю согласие на обработку персональных данных *</label>
                  </div>
                  {consentError && <p className="text-red-500 text-sm">{consentError}</p>}
                </div>

                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <><div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" /><span>Отправка...</span></> : <><span>ПОЛУЧИТЬ ТОЧНЫЙ РАСЧЕТ И СКИДКУ</span><Send className="w-5 h-5" /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-12 animate-fade-in-up animation-delay-200">
          <div className="text-center p-6 bg-dark-light/30 rounded-xl border border-gray-800"><div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3"><Calculator className="w-6 h-6 text-gold" /></div><h3 className="text-white font-medium mb-1">Быстрый расчет</h3><p className="text-gray-500 text-sm">Оцените стоимость за 2 минуты</p></div>
          <div className="text-center p-6 bg-dark-light/30 rounded-xl border border-gray-800"><div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3"><Gift className="w-6 h-6 text-gold" /></div><h3 className="text-white font-medium mb-1">Скидка на первый заказ</h3><p className="text-gray-500 text-sm">Специальное предложение</p></div>
          <div className="text-center p-6 bg-dark-light/30 rounded-xl border border-gray-800"><div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3"><Shield className="w-6 h-6 text-gold" /></div><h3 className="text-white font-medium mb-1">Точный расчет за 24 часа</h3><p className="text-gray-500 text-sm">С персональным предложением</p></div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
