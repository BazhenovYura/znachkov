// Объявляем тип для ym функции
declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: any[]) => void;
  }
}

// Отправка просмотра страницы
export const sendMetrikaHit = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(107277809, 'hit', url);
    console.log('📊 Metrika hit sent:', url);
  }
};

// Отправка цели
export const sendMetrikaGoal = (goalName: string, params?: any) => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(107277809, 'reachGoal', goalName, params);
    console.log('🎯 Metrika goal sent:', goalName, params);
  }
};

// Отправка произвольного события
export const sendMetrikaEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(107277809, 'params', { event: eventName, ...data });
    console.log('📌 Metrika event sent:', eventName, data);
  }
};
