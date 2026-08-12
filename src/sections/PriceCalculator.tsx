import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Upload, X, Calculator, Gift, TrendingUp, 
  Check, Zap, Clock, Award, Users, Package, Share2, RefreshCw,
  Square, Circle, FileText
} from 'lucide-react';
import { sendMetrikaGoal, sendMetrikaEvent } from '../utils/metrika';

// Единая функция для MAX
const YANDEX_MAX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4ekq3u1mf711pskoaop';

// URL вашей прокси-функции для получения цен металлов
const METAL_PRICES_PROXY_URL = 'https://functions.yandexcloud.net/d4eubr12aftt733bpe1e';

// Максимальный размер файла: 5 МБ
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
const MODEL_3D_COST = 10000;
const ADDITIONAL_PROCESSING_COST = 1500;

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
        const MAX_SIZE = 1200;
        
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
          0.8
        );
      };
      reader.onerror = (error) => reject(error);
    };
  });
};

const PriceCalculator = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceLoadError, setPriceLoadError] = useState(false);
  const [isLoadingMode, setIsLoadingMode] = useState(true);
  
  const [mode, setMode] = useState<'manager' | 'client'>('client');
  
  const [calculatorData, setCalculatorData] = useState({
    type: 'custom',
    material: 'gold',
    quantity: 2,
    shape: 'circle',
    width: 20,
    height: 20,
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
  const [fileError, setFileError] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [priceHighlight, setPriceHighlight] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [additionalProcessing, setAdditionalProcessing] = useState({
    goldPlating: false,
    rhodium: false,
    blackening: false,
    enamel: false,
    enamelColors: 1,
  });

  const getThemeClasses = () => {
    const isGold = calculatorData.material === 'gold';
    return {
      border: isGold ? 'border-gold' : 'border-silver',
      bgLight: isGold ? 'bg-gold/10' : 'bg-silver/10',
      text: isGold ? 'text-gold' : 'text-silver',
      shadow: isGold ? 'shadow-gold' : 'shadow-silver',
      gradient: isGold ? 'from-gold/10 to-gold/5' : 'from-silver/10 to-silver/5',
      buttonFrom: isGold ? 'from-gold' : 'from-gray-400',
      buttonTo: isGold ? 'to-yellow-600' : 'to-gray-500',
    };
  };
  
  useEffect(() => {
    const savedMode = sessionStorage.getItem('calculator_mode');
    if (savedMode === 'manager') {
      setMode('manager');
      setCalculatorData(prev => ({ ...prev, quantity: 1 }));
    }
  }, []);
  
  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = hash.split('?')[1];
    
    let modeParam = null;
    if (hashParams) {
      const params = new URLSearchParams(hashParams);
      modeParam = params.get('mode');
    }
    
    console.log('Mode from URL (hash):', modeParam);
    console.log('Full hash:', hash);
    console.log('Hash params:', hashParams);
    
    if (modeParam === 'manager') {
      setMode('manager');
      console.log('🔓 Режим менеджера ВКЛЮЧЕН - цены будут показаны');
    } else {
      setMode('client');
      console.log('🔒 Клиентский режим - цены скрыты');
    }
    setIsLoadingMode(false);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = hash.split('?')[1];
    
    if (!hashParams) return;
    
    const params = new URLSearchParams(hashParams);
    
    const type = params.get('type');
    const material = params.get('material');
    const quantity = params.get('quantity');
    const shape = params.get('shape');
    const width = params.get('width');
    const height = params.get('height');
    
    if (type || material || quantity || shape || width || height) {
      setCalculatorData(prev => ({
        ...prev,
        type: type || prev.type,
        material: material || prev.material,
        quantity: quantity ? parseInt(quantity) : prev.quantity,
        shape: (shape as 'rectangle' | 'rounded' | 'circle') || prev.shape,
        width: width ? parseInt(width) : prev.width,
        height: height ? parseInt(height) : prev.height,
      }));
      
      console.log('📋 Загружены параметры из ссылки:', {
        type,
        material,
        quantity,
        shape,
        width,
        height
      });
    }
  }, []);

  useEffect(() => {
    if (!isLoadingMode) {
      if (mode === 'client') {
        setShowForm(true);
        console.log('Клиентский режим: форма должна быть видна');
      } else {
        setShowForm(false);
        console.log('Режим менеджера: форма скрыта до выбора параметров');
      }
    }
  }, [mode, isLoadingMode]);

  useEffect(() => {
    if (mode === 'client' && !showForm && !isLoadingMode) {
      console.log('Принудительный показ формы для клиента');
      setShowForm(true);
    }
  }, [mode, showForm, isLoadingMode]);
  
  const presets = {
    maxi: { width: 35, height: 30, shape: 'rectangle' as const, label: 'MAXI', complexity: 1.4 },
    midi: { width: 25, height: 22, shape: 'rectangle' as const, label: 'MIDI', complexity: 1.3 },
    mini: { width: 20, height: 17, shape: 'rectangle' as const, label: 'MINI', complexity: 1.2 },
    micro: { width: 15, height: 12, shape: 'rectangle' as const, label: 'MICRO', complexity: 1.1 },
    rounded_small: { width: 20, height: 20, shape: 'rounded' as const, label: 'Скругленный S', complexity: 1.15 },
    rounded_medium: { width: 30, height: 30, shape: 'rounded' as const, label: 'Скругленный M', complexity: 1.25 },
    circle_small: { width: 20, height: 20, shape: 'circle' as const, label: 'Круглый S', complexity: 1.15 },
    circle_medium: { width: 30, height: 30, shape: 'circle' as const, label: 'Круглый M', complexity: 1.25 },
    circle_large: { width: 35, height: 35, shape: 'circle' as const, label: 'Круглый L', complexity: 1.35 },
  };

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

  const getCurrentComplexity = () => {
    if (calculatorData.type !== 'custom' && presets[calculatorData.type as keyof typeof presets]) {
      return presets[calculatorData.type as keyof typeof presets].complexity;
    }
    const avgSize = (calculatorData.width + calculatorData.height) / 2;
    if (avgSize >= 50) return 1.6;
    if (avgSize >= 40) return 1.5;
    if (avgSize >= 35) return 1.4;
    if (avgSize >= 25) return 1.3;
    if (avgSize >= 20) return 1.2;
    if (avgSize >= 10) return 1.1;
    return 1.0;
  };

  const calculatePrice = () => {
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
        additionalCostPerUnit: 0,
      };
    }
    
    const purityFactor = isGold ? GOLD_PURITY_FACTOR : SILVER_PURITY_FACTOR;
    const laborCost = isGold ? GOLD_LABOR_COST : SILVER_LABOR_COST;
    const density = isGold ? GOLD_DENSITY : SILVER_DENSITY;
    
    const metalCostWithVAT = metalPrice * purityFactor * LOSS_FACTOR * VAT_BUY_FACTOR;
    const totalCostPerGram = metalCostWithVAT + laborCost;
    
    let area: number;
    if (calculatorData.shape === 'circle') {
      const radius = calculatorData.width / 2;
      area = Math.PI * radius * radius;
    } else {
      area = calculatorData.width * calculatorData.height;
    }
    
    const volume = area * 1;
    const weight = volume * density;
    
    const pricePerItemBeforeVAT = totalCostPerGram * weight * getCurrentComplexity();
    const pricePerItem = pricePerItemBeforeVAT * VAT_SELL_FACTOR;
    
    let additionalCostPerUnit = 0;
    const { goldPlating, rhodium, blackening, enamel, enamelColors } = additionalProcessing;
    
    if (goldPlating) additionalCostPerUnit += ADDITIONAL_PROCESSING_COST;
    if (rhodium) additionalCostPerUnit += ADDITIONAL_PROCESSING_COST;
    if (blackening) additionalCostPerUnit += ADDITIONAL_PROCESSING_COST;
    if (enamel) additionalCostPerUnit += ADDITIONAL_PROCESSING_COST * enamelColors;
    
    const additionalCostWithVAT = additionalCostPerUnit * VAT_SELL_FACTOR;
    
    const totalItemsPrice = (pricePerItem + additionalCostWithVAT) * calculatorData.quantity;
    
    const model3DCostWithVAT = MODEL_3D_COST * VAT_SELL_FACTOR;
    const totalPrice = totalItemsPrice + model3DCostWithVAT;
    
    return {
      totalPrice: Math.round(totalPrice),
      pricePerUnit: Math.round(pricePerItem),
      weight: weight.toFixed(2),
      metalCostPerGram: Math.round(metalCostWithVAT),
      totalCostPerGram: Math.round(totalCostPerGram),
      model3DCostWithVAT: Math.round(model3DCostWithVAT),
      additionalCostPerUnit: Math.round(additionalCostWithVAT),
    };
  };

  useEffect(() => {
    if (!metalPrices.gold || !metalPrices.silver) return;
    
    const { totalPrice, pricePerUnit } = calculatePrice();
    
    if (totalPrice !== estimatedPrice) {
      setPriceHighlight(true);
      setTimeout(() => setPriceHighlight(false), 500);
    }
    
    setEstimatedPrice(totalPrice);
    setPricePerUnit(pricePerUnit);
  }, [calculatorData, metalPrices, additionalProcessing]);

  useEffect(() => {
    fetchMetalPrices();
    window.scrollTo(0, 0);
    sendMetrikaEvent('calculator_page_view');
  }, []);

  const handlePresetSelect = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      setCalculatorData(prev => ({
        ...prev,
        type: presetKey,
        shape: preset.shape,
        width: preset.width,
        height: preset.height,
      }));
      sendMetrikaEvent('calculator_param_change', { param: 'preset', value: presetKey });
    }
    if (mode === 'manager' && !showForm) {
      setShowForm(true);
      sendMetrikaEvent('calculator_form_shown');
    }
  };

  const handleCustomMode = () => {
    setCalculatorData(prev => ({
      ...prev,
      type: 'custom',
    }));
    sendMetrikaEvent('calculator_param_change', { param: 'mode', value: 'custom' });
  };

  const handleShapeSelect = (shape: 'rectangle' | 'rounded' | 'circle') => {
    setCalculatorData(prev => {
      if (shape === 'circle') {
        const minSize = Math.min(prev.width, prev.height);
        return {
          ...prev,
          type: 'custom',
          shape,
          width: minSize,
          height: minSize,
        };
      }
      return {
        ...prev,
        type: 'custom',
        shape,
      };
    });
    sendMetrikaEvent('calculator_param_change', { param: 'shape', value: shape });
  };

  const handleWidthChange = (value: number) => {
    let newValue = Math.max(5, Math.min(50, value));
    if (calculatorData.shape === 'circle') {
      setCalculatorData(prev => ({
        ...prev,
        type: 'custom',
        width: newValue,
        height: newValue,
      }));
    } else {
      setCalculatorData(prev => ({
        ...prev,
        type: 'custom',
        width: newValue,
      }));
    }
    sendMetrikaEvent('calculator_param_change', { param: 'width', value: newValue });
  };

  const handleHeightChange = (value: number) => {
    const newValue = Math.max(5, Math.min(50, value));
    if (calculatorData.shape === 'circle') {
      setCalculatorData(prev => ({
        ...prev,
        type: 'custom',
        width: newValue,
        height: newValue,
      }));
    } else {
      setCalculatorData(prev => ({
        ...prev,
        type: 'custom',
        height: newValue,
      }));
    }
    sendMetrikaEvent('calculator_param_change', { param: 'height', value: newValue });
  };

  const handleMaterialSelect = (materialId: string) => {
    setCalculatorData(prev => ({ ...prev, material: materialId }));
    sendMetrikaEvent('calculator_param_change', { param: 'material', value: materialId });
  };

  const quantityPresets = [5, 10, 20, 30, 50, 100, 500];
  
  const handleQuantityPreset = (quantity: number) => {
    if (mode === 'client' && quantity < 2) {
      quantity = 2;
    }
    setCalculatorData(prev => ({ ...prev, quantity }));
    sendMetrikaEvent('calculator_quantity_change', { quantity });
  };

  const handleQuantityChange = (delta: number) => {
    const minQuantity = mode === 'manager' ? 1 : 2;
    const newQuantity = Math.max(minQuantity, Math.min(10000, calculatorData.quantity + delta));
    setCalculatorData(prev => ({ ...prev, quantity: newQuantity }));
    sendMetrikaEvent('calculator_quantity_change', { quantity: newQuantity });
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    const minQuantity = mode === 'manager' ? 1 : 2;
    if (isNaN(value)) value = minQuantity;
    value = Math.max(minQuantity, Math.min(10000, value));
    setCalculatorData(prev => ({ ...prev, quantity: value }));
    sendMetrikaEvent('calculator_quantity_manual', { quantity: value });
  };

  const handleQuantityMin = () => {
    const minQuantity = mode === 'manager' ? 1 : 2;
    setCalculatorData(prev => ({ ...prev, quantity: minQuantity }));
    sendMetrikaEvent('calculator_quantity_change', { quantity: minQuantity });
  };

  const handleProcessingToggle = (type: 'goldPlating' | 'rhodium' | 'blackening' | 'enamel') => {
    setAdditionalProcessing(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleEnamelColorsChange = (delta: number) => {
    setAdditionalProcessing(prev => ({
      ...prev,
      enamelColors: Math.max(1, Math.min(5, prev.enamelColors + delta)),
    }));
  };

  const handleClientModeClick = () => {
    setShowLoginModal(true);
    setLogin('');
    setPassword('');
    setLoginError('');
  };

  const handleLogin = () => {
    const ADMIN_LOGIN = 'Админ';
    const ADMIN_PASSWORD = '142536';
    
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setMode('manager');
      setShowLoginModal(false);
      setLogin('');
      setPassword('');
      setLoginError('');
      sessionStorage.setItem('calculator_mode', 'manager');
      setCalculatorData(prev => ({ ...prev, quantity: 1 }));
    } else {
      setLoginError('Неверный логин или пароль');
    }
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
    params.set('shape', calculatorData.shape);
    params.set('width', String(calculatorData.width));
    params.set('height', String(calculatorData.height));
    params.set('mode', mode);
    
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

  // Единая функция отправки в MAX
  const sendToMax = async (file?: File) => {
    const shapeName = calculatorData.shape === 'circle' ? 'Круглая' : (calculatorData.shape === 'rounded' ? 'Скругленные углы' : 'Прямые углы');
    
    let processingList = [];
    if (additionalProcessing.goldPlating) processingList.push('Золочение');
    if (additionalProcessing.rhodium) processingList.push('Родирование');
    if (additionalProcessing.blackening) processingList.push('Чернение');
    if (additionalProcessing.enamel) processingList.push(`Эмаль (${additionalProcessing.enamelColors} цв.)`);
    
    const processingText = processingList.length > 0 
      ? `• Доп. обработка: ${processingList.join(', ')}\n• Стоимость обработки: ${additionalCostPerUnit.toLocaleString()} ₽/шт (с НДС)`
      : '• Доп. обработка: не выбрана';
    
    const { weight, metalCostPerGram, totalCostPerGram, model3DCostWithVAT, additionalCostPerUnit } = calculatePrice();
    const isGold = calculatorData.material === 'gold';
    const currentMetalPrice = isGold ? metalPrices.gold : metalPrices.silver;
    
    let message = `
💰 <b>ЗАПРОС ТОЧНОГО РАСЧЕТА СТОИМОСТИ</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Откуда:</b> Страница калькулятора (${mode === 'manager' ? 'режим менеджера' : 'клиентский режим'})

<b>📊 Параметры заказа:</b>
• Тип: ${isGold ? 'Золото 585' : 'Серебро 925'}
• Форма: ${shapeName}
• Размер: ${calculatorData.width}×${calculatorData.height} мм
• Вес значка: ~${weight} г
• Количество: ${calculatorData.quantity} шт.
• Актуальная цена металла: ${currentMetalPrice?.toLocaleString() || 'не загружена'} ₽/г
• Себестоимость металла: ${metalCostPerGram.toLocaleString()} ₽/г
• Итого себестоимость с работой: ${totalCostPerGram.toLocaleString()} ₽/г
• Стоимость 3D-модели (с НДС): ${model3DCostWithVAT.toLocaleString()} ₽
${processingText}
• Расчетная стоимость (с НДС 22%): ${estimatedPrice.toLocaleString()} ₽
• Цена за штуку (с НДС 22%): ${pricePerUnit.toLocaleString()} ₽

━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Клиент:</b>
• Имя: ${formData.name || 'Не указано'}
• Телефон: ${formData.phone}
• Email: ${formData.email || 'Не указан'}

${formData.comment ? `💬 <b>Комментарий:</b> ${formData.comment}\n` : ''}
⏰ <b>Время отправки (Екатеринбург):</b> ${getEkaterinburgTime()}
    `;

    const payload: any = { text: message };

    // Если есть файл, преобразуем в base64 и добавляем в payload
    if (file) {
      let fileToSend = file;
      
      // Сжимаем только изображения > 1 МБ
      if (file.size > 1024 * 1024 && file.type.startsWith('image/')) {
        try {
          fileToSend = await compressImage(file);
          console.log(`✅ Изображение сжато: ${(fileToSend.size / 1024).toFixed(1)} KB (было ${(file.size / 1024).toFixed(1)} KB)`);
        } catch (error) {
          console.error('Ошибка сжатия:', error);
        }
      }
      
      const base64File = await fileToBase64(fileToSend);
      payload.file = base64File;
      payload.fileName = fileToSend.name;
      payload.fileType = fileToSend.type || 'application/octet-stream';
      
      // Добавляем в сообщение информацию о файле
      message += `\n📎 <b>Прикрепленный эскиз:</b> ${fileToSend.name} (${(fileToSend.size / 1024).toFixed(1)} KB)`;
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
    setSubmitError('');
    setConsentError('');
    setFileError(null);
    
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
        await sendToMax(uploadedFile);
        sendMetrikaGoal('calculator_form_submit_with_file');
      } else {
        await sendToMax();
        sendMetrikaGoal('calculator_form_submit');
      }
      
      sendMetrikaGoal('calculator_lead_generated', {
        orderType: calculatorData.type,
        material: calculatorData.material,
        quantity: calculatorData.quantity,
        estimatedPrice: estimatedPrice,
        mode: mode
      });
      
      navigate('/thanks', { 
        state: { 
          from: '/price-calculator',
          section: 'calculator',
          screenWidth: window.innerWidth,
          mode: mode
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
    setFileError(null);
    
    if (file) {
      // Проверяем размер файла
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимальный размер: 5 МБ`);
        e.target.value = '';
        return;
      }
      
      setUploadedFile(file);
      sendMetrikaEvent('file_uploaded', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type, 
        form: 'calculator' 
      });
      
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
    setFileError(null);
    sendMetrikaEvent('file_removed', { form: 'calculator' });
  };

  useEffect(() => {
    if (showForm) {
      const materialName = calculatorData.material === 'gold' ? 'золота 585' : 'серебра 925';
      const shapeName = calculatorData.shape === 'circle' ? 'круглой' : (calculatorData.shape === 'rounded' ? 'со скругленными углами' : 'с прямыми углами');
      
      let processingText = '';
      const processingList = [];
      if (additionalProcessing.goldPlating) processingList.push('золочение');
      if (additionalProcessing.rhodium) processingList.push('родирование');
      if (additionalProcessing.blackening) processingList.push('чернение');
      if (additionalProcessing.enamel) processingList.push(`эмаль (${additionalProcessing.enamelColors} цв.)`);
      if (processingList.length > 0) {
        processingText = `, доп. обработка: ${processingList.join(', ')}`;
      }
      
      setFormData(prev => ({
        ...prev,
        comment: `Хочу заказать значки ${shapeName} формы размером ${calculatorData.width}×${calculatorData.height} мм из ${materialName}, тираж ${calculatorData.quantity} шт${processingText}. Рассчитайте точную стоимость и подберите скидку под этот заказ.`
      }));
    }
  }, [calculatorData, showForm, additionalProcessing]);

  if (isLoadingMode) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gold text-xl">Загрузка...</div>
      </div>
    );
  }

  const theme = getThemeClasses();

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl mx-auto">
        {mode === 'manager' && (
          <div className="fixed bottom-4 right-4 z-50 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 text-xs text-green-400">
            🔓 Менеджер
          </div>
        )}
        {mode === 'client' && (
          <div 
            onClick={handleClientModeClick}
            className="fixed bottom-4 right-4 z-50 bg-gold/10 border border-gold/30 rounded-full px-3 py-1 text-xs text-gold cursor-pointer hover:bg-gold/20 transition-colors"
          >
            🔒
          </div>
        )}
        
        <div className="text-center mb-12 animate-fade-in-up">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${theme.bgLight} border ${theme.border} rounded-full mb-6`}>
            <Calculator className={`w-4 h-4 ${theme.text}`} />
            <span className={`${theme.text} text-sm`}>Калькулятор стоимости</span>
            <button
              onClick={refreshPrices}
              disabled={isLoadingPrice}
              className="ml-2 p-1 hover:bg-gold/20 rounded-full transition-colors"
              title="Обновить цены на металлы"
            >
              <RefreshCw className={`w-3 h-3 ${theme.text} ${isLoadingPrice ? 'animate-spin' : ''}`} />
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

        {mode === 'manager' && (
          <div className="flex justify-center gap-6 mb-8 animate-fade-in-up">
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.bgLight} rounded-full`}>
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-300 text-sm">Золото 999:</span>
              <span className={`${theme.text} font-medium`}>{getMaterialPriceDisplay('gold')}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.bgLight} rounded-full`}>
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-gray-300 text-sm">Серебро 999:</span>
              <span className={`${theme.text} font-medium`}>{getMaterialPriceDisplay('silver')}</span>
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
        )}

        {priceLoadError && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 text-sm">
              ⚠️ Не удалось загрузить актуальные цены на металлы. Пожалуйста, попробуйте обновить страницу позже или 
              <button onClick={refreshPrices} className="text-gold hover:underline ml-1">нажмите здесь</button>, чтобы повторить попытку.
            </p>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up backdrop-blur-sm">
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-6 text-center">
              Шаг 1. Выберите параметры заказа
            </h2>
            
            {mode === 'manager' ? (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-3">Материал *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleMaterialSelect('gold')}
                    className={`flex-1 p-4 rounded-xl border transition-all duration-300 text-center ${
                      calculatorData.material === 'gold'
                        ? `bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 ${theme.border} ${theme.shadow}`
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
                        ? `bg-gradient-to-r from-gray-400/20 to-gray-600/20 ${theme.border} ${theme.shadow}`
                        : 'bg-dark border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <div className="font-bold text-gray-400">Серебро 925</div>
                    <div className="text-xs text-gray-500 mt-1">{getMaterialPriceDisplay('silver')} (биржа)</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-3">Материал *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleMaterialSelect('gold')}
                    className={`flex-1 p-4 rounded-xl border transition-all duration-300 text-center ${
                      calculatorData.material === 'gold'
                        ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-gold/50'
                        : 'bg-dark border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <div className="font-bold text-yellow-500">Золото 585</div>
                    <div className="text-xs text-gray-500 mt-1">выберите для расчета</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMaterialSelect('silver')}
                    className={`flex-1 p-4 rounded-xl border transition-all duration-300 text-center ${
                      calculatorData.material === 'silver'
                        ? 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-silver/50'
                        : 'bg-dark border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <div className="font-bold text-gray-400">Серебро 925</div>
                    <div className="text-xs text-gray-500 mt-1">выберите для расчета</div>
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2 text-center">Выберите материал для расчета</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Готовые форматы</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('maxi')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'maxi'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  MAXI<br/><span className="text-xs">35×30 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('midi')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'midi'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  MIDI<br/><span className="text-xs">25×22 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('mini')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'mini'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  MINI<br/><span className="text-xs">20×17 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('micro')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'micro'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  MICRO<br/><span className="text-xs">15×12 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('rounded_small')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'rounded_small'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  Скругл. S<br/><span className="text-xs">20×20 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('rounded_medium')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'rounded_medium'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  Скругл. M<br/><span className="text-xs">30×30 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('circle_small')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'circle_small'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  Круглый S<br/><span className="text-xs">⌀20 мм</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('circle_medium')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 text-center ${
                    calculatorData.type === 'circle_medium'
                      ? 'bg-gold text-dark font-medium'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  Круглый M<br/><span className="text-xs">⌀30 мм</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-400 text-sm">Свой размер</label>
                <button
                  type="button"
                  onClick={handleCustomMode}
                  className={`px-3 py-1 rounded-lg text-xs transition-all duration-300 ${
                    calculatorData.type === 'custom'
                      ? 'bg-gold text-dark'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                  }`}
                >
                  Редактировать
                </button>
              </div>
              
              {calculatorData.type === 'custom' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleShapeSelect('rectangle')}
                      className={`p-3 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 ${
                        calculatorData.shape === 'rectangle'
                          ? `${theme.bgLight} ${theme.border}`
                          : 'bg-dark border-gray-700 hover:border-gold/50'
                      }`}
                    >
                      <Square className={`w-5 h-5 ${calculatorData.shape === 'rectangle' ? theme.text : 'text-gray-400'}`} />
                      <span className="text-xs">Прямые углы</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShapeSelect('rounded')}
                      className={`p-3 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 ${
                        calculatorData.shape === 'rounded'
                          ? `${theme.bgLight} ${theme.border}`
                          : 'bg-dark border-gray-700 hover:border-gold/50'
                      }`}
                    >
                      <div className="w-5 h-5 relative">
                        <Square className={`w-5 h-5 absolute ${calculatorData.shape === 'rounded' ? theme.text : 'text-gray-400'}`} style={{ borderRadius: '4px' }} />
                      </div>
                      <span className="text-xs">Скругленные углы</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShapeSelect('circle')}
                      className={`p-3 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 ${
                        calculatorData.shape === 'circle'
                          ? `${theme.bgLight} ${theme.border}`
                          : 'bg-dark border-gray-700 hover:border-gold/50'
                      }`}
                    >
                      <Circle className={`w-5 h-5 ${calculatorData.shape === 'circle' ? theme.text : 'text-gray-400'}`} />
                      <span className="text-xs">Круг</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">
                        {calculatorData.shape === 'circle' ? 'Диаметр, мм' : 'Ширина, мм'}
                      </span>
                      <span className={theme.text}>{calculatorData.width} мм</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={calculatorData.width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5</span>
                      <span>30</span>
                      <span>50</span>
                    </div>
                  </div>

                  {calculatorData.shape !== 'circle' && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Высота, мм</span>
                        <span className={theme.text}>{calculatorData.height} мм</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="1"
                        value={calculatorData.height}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5</span>
                        <span>30</span>
                        <span>50</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <ShapeVisualization />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Количество (шт.) *</label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {mode === 'manager' && (
                  <button
                    type="button"
                    onClick={() => handleQuantityPreset(1)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                      calculatorData.quantity === 1
                        ? 'bg-gold text-dark font-medium'
                        : 'bg-dark border border-gray-700 text-gray-400 hover:border-gold/50'
                    }`}
                  >
                    1 шт.
                  </button>
                )}
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
                    {preset} шт.
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleQuantityMin}
                  className="w-12 h-10 bg-dark border border-gold/50 rounded-lg flex items-center justify-center text-gold hover:bg-gold/10 transition-colors text-sm font-medium"
                >
                  MIN
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-10)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  −10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-5)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  −5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  −1
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={calculatorData.quantity}
                  onChange={handleQuantityInput}
                  min={mode === 'manager' ? 1 : 2}
                  max="10000"
                  step="1"
                  className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white text-center focus:border-gold focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(5)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(10)}
                  className="w-10 h-10 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors text-sm"
                >
                  +10
                </button>
              </div>
              
              <p className="text-gray-400 text-xs mt-2">Вы можете ввести число вручную</p>
              <p className="text-gray-500 text-xs">
                {mode === 'manager' ? 'От 1 до 10 000 штук' : 'От 2 до 10 000 штук'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-3">Дополнительная обработка</label>
              <div className="bg-dark/30 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-500 text-xs mb-3">Выберите варианты дополнительной обработки. Стоимость: 1 500 ₽/шт (без НДС)</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    additionalProcessing.goldPlating
                      ? `${theme.border} ${theme.bgLight}`
                      : 'border-gray-700 hover:border-gold/50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={additionalProcessing.goldPlating}
                      onChange={() => handleProcessingToggle('goldPlating')}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-white text-sm">Золочение</span>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    additionalProcessing.rhodium
                      ? `${theme.border} ${theme.bgLight}`
                      : 'border-gray-700 hover:border-gold/50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={additionalProcessing.rhodium}
                      onChange={() => handleProcessingToggle('rhodium')}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-white text-sm">Родирование</span>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    additionalProcessing.blackening
                      ? `${theme.border} ${theme.bgLight}`
                      : 'border-gray-700 hover:border-gold/50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={additionalProcessing.blackening}
                      onChange={() => handleProcessingToggle('blackening')}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-white text-sm">Чернение</span>
                  </label>
                  
                  <label className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    additionalProcessing.enamel
                      ? `${theme.border} ${theme.bgLight}`
                      : 'border-gray-700 hover:border-gold/50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={additionalProcessing.enamel}
                      onChange={() => handleProcessingToggle('enamel')}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="text-white text-sm">Эмаль</span>
                  </label>
                </div>
                
                {additionalProcessing.enamel && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">Количество цветов эмали:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEnamelColorsChange(-1)}
                          className="w-8 h-8 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                        >
                          −
                        </button>
                        <span className={`${theme.text} font-medium text-lg w-8 text-center`}>
                          {additionalProcessing.enamelColors}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEnamelColorsChange(1)}
                          className="w-8 h-8 bg-dark border border-gray-700 rounded-lg flex items-center justify-center text-white hover:border-gold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-500 text-xs">(от 1 до 5)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} rounded-xl p-6 text-center`}>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 text-sm">
                  {mode === 'manager' ? 'Предварительная стоимость (с НДС 22%)' : 'Расчет стоимости'}
                </p>
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
              ) : mode === 'manager' ? (
                <>
                  <p className={`font-serif text-3xl md:text-4xl font-bold ${priceHighlight ? 'scale-110' : 'scale-100'} transition-all duration-300 text-gold-gradient`}>
                    {estimatedPrice.toLocaleString()} ₽
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    ~ {pricePerUnit.toLocaleString()} ₽ за штуку (с НДС)
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    Вес значка: ~{weight} г | 
                    Стоимость материала: {metalCostPerGram.toLocaleString()} ₽/г
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    3D-модель (единоразово): {model3DCostWithVAT.toLocaleString()} ₽ с НДС
                  </p>
                  {additionalCostPerUnit > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Доп. обработка: {additionalCostPerUnit.toLocaleString()} ₽/шт (с НДС)
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">*Для точного расчета оставьте заявку ниже</p>
                </>
              ) : (
                <>
                  <div className="my-4">
                    <Gift className="w-12 h-12 text-gold mx-auto mb-3" />
                    <p className="text-white text-lg font-medium mb-2">Получите точный расчет!</p>
                    <p className="text-gray-400 text-sm">
                      Заполните форму ниже и наши специалисты рассчитают<br />
                      индивидуальную стоимость с учётом всех пожеланий
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {showForm && (
            <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-6 md:p-8 animate-fade-in-up backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-white">
                    Шаг 2. Получите точный расчет
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {mode === 'manager' 
                      ? 'Заполните форму и получите персональное предложение со скидкой'
                      : 'Оставьте контакты, и мы рассчитаем стоимость заказа'}
                  </p>
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

                {/* Загрузка файла - поддерживает любые файлы */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Прикрепить эскиз <span className="text-gray-600">(необязательно, до 5 МБ)</span>
                  </label>
                  {!uploadedFile ? (
                    <div className="relative">
                      <label className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-3 bg-dark border border-gray-700 border-dashed rounded-lg text-gray-400 hover:text-gold hover:border-gold transition-colors">
                        <Upload className="w-5 h-5" />
                        <span>Выберите файл (изображение, PDF, документ)</span>
                        <input 
                          type="file" 
                          onChange={handleFileChange} 
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                          className="hidden" 
                        />
                      </label>
                      {fileError && (
                        <p className="text-red-500 text-xs mt-1">{fileError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-dark border border-gray-700 rounded-lg">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gold" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{uploadedFile.name}</p>
                        <p className="text-gray-500 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
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
                  className={`w-full py-4 bg-gradient-to-r ${theme.buttonFrom} ${theme.buttonTo} text-dark font-bold rounded-xl hover:shadow-gold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <>Отправка...</>
                  ) : mode === 'manager' ? (
                    <>
                      <Send className="w-5 h-5" />
                      Получить точный расчет
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Отправить заявку на расчет
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

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-light border border-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="text-gold text-2xl mb-2">🔐</div>
              <h3 className="text-white text-xl font-semibold">Вход в режим менеджера</h3>
              <p className="text-gray-400 text-sm mt-1">Введите логин и пароль</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Логин</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                  placeholder="Введите логин"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:border-gold focus:outline-none transition-colors"
                  placeholder="Введите пароль"
                />
              </div>
              
              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLogin('');
                    setPassword('');
                    setLoginError('');
                  }}
                  className="flex-1 py-3 bg-dark border border-gray-700 text-gray-400 rounded-lg hover:border-gold transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 py-3 bg-gradient-to-r from-gold to-yellow-600 text-dark font-bold rounded-lg hover:shadow-gold transition-all duration-300"
                >
                  Войти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
