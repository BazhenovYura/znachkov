// Объявляем тип для ym функции
declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: any[]) => void;
  }
}

// Отправка просмотра страницы в Яндекс.Метрику
export const sendMetrikaHit = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(107277809, 'hit', url);
    console.log('📊 Metrika hit sent:', url);
  }
};
