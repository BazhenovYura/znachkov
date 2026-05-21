import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Upload, X, Calculator, Gift, TrendingUp, 
  Check, Zap, Clock, Award, Users, Package, Share2, RefreshCw
} from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Константы с URL ваших Яндекс Функций
const YANDEX_TEXT_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ejvffqhagifq5goidk';
const YANDEX_FILE_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ebhne62abdudhrv085';

// URL вашей прокси-функции для получения цен металлов
const METAL_PRICES_PROXY_URL = 'https://functions.yandexcloud.net/d4eubr12aftt733bpe1e';

// Коэффициенты расчета
const GOLD_PURITY_FACTOR = 0.585;
const SILVER_PURITY_FACTOR = 0.926;
const LOSS_FACTOR = 1.1;
const VAT_BUY_FACTOR = 1.22;
const VAT_SELL_FACTOR = 1.22;
const GOLD_LABOR_COST = 3500;
const SILVER_LABOR_COST = 2000;
const GOLD_DENSITY = 0.0134;
const SILVER_DENSITY = 0.0105;
const MODEL_3D_COST = 10000; // стоимость 3D-модели

// Габариты значков по типам
const typeDimensions = {
  maxi: { length: 35, width: 30, complexity: 1.4 },
  midi: { length: 25, width: 22, complexity: 1.3 },
  mini: { length: 20, width: 17, complexity: 1.2 },
  micro: { length: 15, width: 12, complexity: 1.1 },
};

const PriceCalculator = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceLoadError, setPriceLoadError] = useState(false);
  
  const [calculatorData, setCalculatorData] = useState({
    type: 'maxi',
    material: 'gold',
    quantity: 500,
  });
  
  const [metalPrices, setMetalPrices] = useState<{ gold: number | null; silver: number | null }>({
    gold: null,
    silver: null,
  });
  
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
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [priceHighlight, setPriceHighlight] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Загрузка цен через прокси-функцию
  const fetchMetalPrices = async () => {
    setIsLoadingPrice(true);
    setPriceLoadError(false);
    
    try {
      console.log('Загрузка цен через прокси-функцию...');
      const response = await fetch(METAL_PRICES_PROXY_URL);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.gold && data.silver) {
        setMetalPrices({
          gold: data.gold,
          silver: data.silver
        });
        setLastUpdated(new Date());
        sendMetrikaEvent('metal_prices_updated', { gold: data.gold, silver: data.silver });
        console.log(`✅ Цены загружены: Золото ${data.gold} ₽/г, Серебро ${data.silver} ₽/г`);
      } else {
        throw new Error('Не удалось получить цены');
      }
      
    } catch (error) {
      console.error('Ошибка загрузки цен:', error);
      setPriceLoadError(true);
      sendMetrikaEvent('metal_prices_error', { error: String(error) });
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Функция расчета цены
  const calculatePrice = () => {
    const dimensions = typeDimensions[calculatorData.type as keyof typeof typeDimensions];
    const isGold = calculatorData.material === 'gold';
    
    const metalPrice = isGold ? metalPrices.gold : metalPrices.silver;
    
    if (!metalPrice) {
      return {
        totalPrice: 0,
        pricePerUnit: 0,
        weight: '0',
        metalCostPerGram: 0,
        totalCostPerGram: 0,
        model3DCostWithVAT: 0,
      };
    }
    
    const purityFactor = isGold ? GOLD_PURITY_FACTOR : SILVER_PURITY_FACTOR;
    const laborCost = isGold ? GOLD_LABOR_COST : SILVER_LABOR_COST;
    const density = isGold ? GOLD_DENSITY : SILVER_DENSITY;
    
    const metalCostWithVAT = metalPrice * purityFactor * LOSS_FACTOR * VAT_BUY_FACTOR;
    const totalCostPerGram = metalCostWithVAT + laborCost;
    
    const volume = dimensions.length * dimensions.width * 1;
    const weight = volume * density;
    
    const pricePerItemBeforeVAT = totalCostPerGram * weight * dimensions.complexity;
    const pricePerItem = pricePerItemBeforeVAT * VAT_SELL_FACTOR;
    const totalItemsPrice = pricePerItem * calculatorData.quantity;
    
    // Стоимость 3D-модели с НДС
    const model3DCostWithVAT = MODEL_3D_COST * VAT_SELL_FACTOR;
    
    // Итоговая цена: стоимость всех значков + стоимость 3D-модели
    const totalPrice = totalItemsPrice + model3DCostWithVAT;
    
    return {
      totalPrice: Math.round(totalPrice),
      pricePerUnit: Math.round(pricePerItem),
      weight: weight.toFixed(2),
      metalCostPerGram: Math.round(metalCostWithVAT),
      totalCostPerGram: Math.round(totalCostPerGram),
      model3DCostWithVAT: Math.round(model3DCostWithVAT),
    };
  };

  // Пересчет цены
  useEffect(() => {
    if (!metalPrices.gold || !metalPrices.silver) return;
    
    const { totalPrice, pricePerUnit } = calculatePrice();
    
    if (totalPrice !== estimatedPrice) {
      setPriceHighlight(true);
      setTimeout(() => setPriceHighlight(false), 500);
    }
    
    setEstimatedPrice(totalPrice);
    setPricePerUnit(pricePerUnit);
  }, [calculatorData, metalPrices]);

  // Загрузка цен при старте
  useEffect(() => {
    fetchMetalPrices();
    window.scrollTo(0, 0);
    sendMetrikaEvent('calculator_page_view');
  }, []);

  const handleTypeSelect = (typeId: string) => {
    setCalculatorData(prev => ({ ...prev, type: typeId }));
    sendMetrikaEvent('calculator_param_change', { param: 'type', value: typeId });
    if (!showForm) {
      setShowForm(true);
      sendMetrikaEvent('calculator_form_shown');
    }
  };

  const handleMaterialSelect = (materialId: string) => {
    setCalculatorData(prev => ({ ...prev, material: materialId }));
    sendMetrikaEvent('calculator_param_change', { param: 'material', value: materialId });
  };

  const handleQuantityPreset = (quantity: number) => {
    setCalculatorData(prev => ({ ...prev, quantity }));
    sendMetrikaEvent('calculator_quantity_change', { quantity });
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

  const refreshPrices = () => {
    fetchMetalPrices();
    sendMetrikaEvent('calculator_refresh_prices');
  };

  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set('type', calculatorData.type);
    params.set('material', calculatorData.material);
    params.set('quantity', String(calculatorData.quantity));
    
    const shareUrl = `${window.location.origin}/#/price-calculator?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    sendMetrikaEvent('calculator_share_link');
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

  const { weight, metalCostPerGram, totalCostPerGram, model3DCostWithVAT } = calculatePrice();
  const dimensions = typeDimensions[calculatorData.type as keyof typeof typeDimensions];
  const isGold = calculatorData.material === 'gold';
  const currentMetalPrice = isGold ? metalPrices.gold : metalPrices.silver;
  const quantityPresets = [100, 500, 1000, 5000];
  const isPriceLoaded = metalPrices.gold !== null && metalPrices.silver !== null;

  const getMaterialPriceDisplay = (material: 'gold' | 'silver') => {
    const price = material === 'gold' ? metalPrices.gold : metalPrices.silver;
    if (priceLoadError) return 'ошибка загрузки';
    if (!price) return 'загрузка...';
    return `${price.toLocaleString()} ₽/г`;
  };

  const sendTextToTelegram = async () => {
    const message = `
💰 <b>ЗАПРОС ТОЧНОГО РАСЧЕТА СТОИМОСТИ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Страница калькулятора

<b>📊 Параметры заказа:</b>
• Тип: ${isGold ? 'Золото 585' : 'Серебро 925'}
• Формат: ${calculatorData.type.toUpperCase()} (${dimensions.length}×${dimensions.width} мм)
• Количество: ${calculatorData.quantity} шт.
• Актуальная цена металла: ${currentMetalPrice?.toLocaleString() || 'не загружена'} ₽/г
• Себестоимость металла: ${metalCostPerGram.toLocaleString()} ₽/г
• Итого себестоимость с работой: ${totalCostPerGram.toLocaleString()} ₽/г
• Стоимость 3D-модели (с НДС): ${model3DCostWithVAT.toLocaleString()} ₽
• Расчетная стоимость: ${estimatedPrice.toLocaleString()} ₽
• Цена за штуку: ${pricePerUnit.toLocaleString()} ₽

━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Клиент:</b>
• Имя: ${formData.name || 'Не указано'}
• Телефон: ${formData.phone}
• Email: ${formData.email || 'Не указан'}

${formData.comment ? `💬 <b>Комментарий:</b> ${formData.comment}\n` : ''}
⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
    `;

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
    const caption = `
💰 <b>ЗАПРОС ТОЧНОГО РАСЧЕТА СТОИМОСТИ С ЭСКИЗОМ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Страница калькулятора

<b>📊 Параметры заказа:</b>
• Тип: ${isGold ? 'Золото 585' : 'Серебро 925'}
• Формат: ${calculatorData.type.toUpperCase()} (${dimensions.length}×${dimensions.width} мм)
• Количество: ${calculatorData.quantity} шт.
• Актуальная цена металла: ${currentMetalPrice?.toLocaleString() || 'не загружена'} ₽/г
• Стоимость 3D-модели (с НДС): ${model3DCostWithVAT.toLocaleString()} ₽
• Расчетная стоимость: ${estimatedPrice.toLocaleString()} ₽
• Цена за штуку: ${pricePerUnit.toLocaleString()} ₽

━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Клиент:</b>
• Имя: ${formData.name || 'Не указано'}
• Телефон: ${formData.phone}
• Email: ${formData.email || 'Не указан'}

${formData.comment ? `💬 <b>Комментарий:</b> ${formData.comment}\n` : ''}
📎 <b>Прикрепленный эскиз:</b> ${file.name} (${(file.size / 1024).toFixed(1)} KB)

⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
    `;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);
    
    const response = await fetch(YANDEX_FILE_FUNCTION_URL, {
      method: 'POST',
      body: fd,
    });

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
        orderType: calculatorData.type,
        material: calculatorData.material,
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
      const materialName = calculatorData.material === 'gold' ? 'золоте 585' : 'серебре 925';
      setFormData(prev => ({
        ...prev,
        comment: `Хочу заказать значки в формате ${calculatorData.type.toUpperCase()} (${dimensions.length}×${dimensions.width} мм) из ${materialName}, тираж ${calculatorData.quantity} шт. Рассчитайте точную стоимость и подберите скидку под этот заказ.`
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
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm">Калькулятор стоимости</span>
            <button
              onClick={refreshPrices}
              disabled={isLoadingPrice}
              className="ml-2 p-1 hover:bg-gold/20 rounded-full transition-colors"
              title="Обновить цены на металлы"
            >
              <RefreshCw className={`w-3 h-3 text-gold ${isLoadingPrice ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Рассчитайте стоимость{' '}
            <span className="text-gold-gradient">партии значков</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
            Актуальные цены на золото и серебро с биржи. Заполните параметры заказа и получите точный расчет.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
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
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-gray-400">500+ клиентов</span>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-up">
          <div className="text-center p-4 bg-dark-light/30 rounded-xl border border-gray-800">
            <Award className="w-6 h-6 text-gold mx-auto mb-2" />
            <div className="text-white font-bold text-xl">1972</div>
            <div className="text-gray-500 text-xs">год основания</div>
          </div>
          <div className="text-center p-4 bg-dark-light/30 rounded-xl border border-gray-800">
            <Package className="w-6 h-6 text-gold mx-auto mb-2" />
            <div className="text-white font-bold text-xl">10 000+</div>
            <div className="text-gray-500 text-xs">изготовлено значков</div>
          </div>
          <div className="text-center p-4 bg-dark-light/30 rounded-xl border border-gray-800">
            <Users className="w-6 h-6 text-gold mx-auto mb-2" />
            <div className="text-white font-bold text-xl">500+</div>
            <div className="text-gray-500 text-xs">довольных клиентов</div>
          </div>
          <div className="text-center p-4 bg-dark-light/30 rounded-xl border border-gray-800">
            <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
            <div className="text-white font-bold text-xl">14 дней</div>
            <div className="text-gray-500 text-xs">средний срок</div>
          </div>
        </div>

        {/* Текущие цены */}
        <div className="flex justify-center gap-6 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-300 text-sm">Золото 999:</span>
            <span className="text-gold font-medium">{getMaterialPriceDisplay('gold')}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-300 text-sm">Серебро 999:</span>
            <span className="text-gold font-medium">{getMaterialPriceDisplay('silver')}</span>
          </div>
          {priceLoadError && (
            <div className="text-red-500 text-xs self-center">
              ⚠️ Не удалось загрузить актуальные цены
            </div>
          )}
          {lastUpdated && !priceLoadError && (
            <div className="text-gray-500 text-xs self-center">
              Цены обновлены: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {priceLoadError && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 text-sm">
              ⚠️ Не удалось загрузить актуальные цены на металлы. Пожалуйста, попробуйте обновить страницу позже или 
              <button onClick={refreshPrices} className="text-gold hover:underline ml-1">нажмите здесь</button>, чтобы повторить попытку.
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Блок калькулятора */}
          <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up animation-delay-100 backdrop-blur-sm">
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-6 text-center">
              Шаг 1. Выберите параметры заказа
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Материал *</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleMaterialSelect('gold')}
                  className={`flex-1 p-4 rounded-xl border transition-all duration-300 text-center ${
                    calculatorData.material === 'gold'
                      ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-gold shadow-gold'
                      : 'bg-dark border-gray-700 hover:border-gold/50'
                  }`}
                >
                  <div className="font-bold text-yellow-500">Золото 585</div>
                  <div className="text-xs text-gray-500 mt-1">{getMaterialPriceDisplay('gold')} (биржа)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleMaterialSelect('silver')}
                  className={`flex-1 p-4 rounded-xl border transition-all duration-300 text-center ${
                    calculatorData.material === 'silver'
                      ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gold shadow-gold'
                      : 'bg-dark border-gray-700 hover:border-gold/50'
                  }`}
                >
                  <div className="font-bold text-gray-400">Серебро 925</div>
                  <div className="text-xs text-gray-500 mt-1">{getMaterialPriceDisplay('silver')} (биржа)</div>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Тип значка *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(typeDimensions).map(([id, data]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTypeSelect(id)}
                    className={`p-4 rounded-xl border transition-all duration-300 text-center ${
                      calculatorData.type === id
                        ? 'bg-gold/20 border-gold shadow-gold'
                        : 'bg-dark border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{id === 'maxi' ? '👑' : id === 'midi' ? '⭐' : id === 'mini' ? '●' : '•'}</div>
                    <div className="font-bold text-white">{id.toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{data.length}×{data.width} мм</div>
                    <div className="text-xs text-gold mt-1">сложность {data.complexity}×</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Количество (шт.) *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {quantityPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuantityPreset(preset)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                      calculatorData.quantity === preset
                        ? 'bg-gold text-dark font-medium'
                        : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    {preset.toLocaleString()} шт.
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-100)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                >
                  −100
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-10)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                >
                  −10
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={calculatorData.quantity}
                  onChange={handleQuantityInput}
                  min="10"
                  max="10000"
                  step="10"
                  className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white text-center focus:border-gold focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(10)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(100)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                >
                  +100
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">От 10 до 10 000 штук</p>
            </div>

            {/* Результат расчета */}
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6 text-center">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 text-sm">Предварительная стоимость</p>
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Скопировано!' : 'Поделиться расчётом'}
                </button>
              </div>
              {!isPriceLoaded && !priceLoadError ? (
                <p className="text-gray-400 text-lg">Загрузка цен...</p>
              ) : priceLoadError ? (
                <p className="text-red-400 text-lg">Цены не загружены</p>
              ) : (
                <>
                  <p className={`font-serif text-3xl md:text-4xl font-bold text-gold-gradient transition-all duration-300 ${priceHighlight ? 'scale-110' : 'scale-100'}`}>
                    {estimatedPrice.toLocaleString()} ₽
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    ~ {pricePerUnit.toLocaleString()} ₽ за штуку
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    Вес значка: ~{weight} г | 
                    Стоимость материала: {metalCostPerGram.toLocaleString()} ₽/г
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    3D-модель (единоразово): {model3DCostWithVAT.toLocaleString()} ₽
                  </p>
                </>
              )}
              <p className="text-gray-500 text-xs mt-1">*Для точного расчета оставьте заявку ниже</p>
            </div>
          </div>

          {/* Форма для точного расчета */}
          {showForm && (
            <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in-up backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-white">
                    Шаг 2. Получите точный расчет
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Заполните форму и получите персональное предложение со скидкой</p>
                </div>
                <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
                  <Zap className="w-4 h-4 text-gold" />
                  <span className="text-gold text-sm">Скидка до 15%</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Ваше имя *</label>
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
                    <label className="block text-gray-400 text-sm mb-2">Телефон *</label>
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
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="ivan@company.ru"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Комментарий</label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    onFocus={() => handleFocus('comment')}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Ваши пожелания..."
                  />
                </div>

                {/* Загрузка файла */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Прикрепить эскиз (необязательно)</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="cursor-pointer px-4 py-2 bg-dark border border-gray-700 rounded-lg text-gray-300 hover:border-gold transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Выбрать файл
                      <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
                    </label>
                    {uploadedFile && (
                      <div className="flex items-center gap-2 bg-dark-light px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-300">{uploadedFile.name}</span>
                        <button type="button" onClick={removeFile} className="text-gray-500 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {filePreview && (
                    <div className="mt-3">
                      <img src={filePreview} alt="Preview" className="max-w-[200px] max-h-[200px] rounded-lg border border-gray-700" />
                    </div>
                  )}
                </div>

                {/* Согласие */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-gold"
                  />
                  <label htmlFor="privacy" className="text-gray-400 text-sm">
                    Я согласен(на) на обработку персональных данных в соответствии с{' '}
                    <a href="/privacy-policy" target="_blank" className="text-gold hover:underline">
                      политикой конфиденциальности
                    </a>
                    {' '}*
                  </label>
                </div>
                {consentError && <p className="text-red-500 text-sm">{consentError}</p>}

                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-gold to-yellow-600 text-dark font-bold rounded-xl hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Отправка...</>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Получить точный расчет
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 text-xs">
                  Нажимая на кнопку, вы соглашаетесь с условиями обработки данных
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
