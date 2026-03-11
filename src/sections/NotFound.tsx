import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Скролл наверх при загрузке страницы
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  const goHome = () => {
    navigate('/'); // Переход на главную
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-20">
      {/* Декоративный градиент */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Иконка ошибки */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center border-2 border-gold/30">
              <span className="font-serif text-6xl font-bold text-gold-gradient">404</span>
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="mb-8 animate-fade-in-up animation-delay-100">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Страница не{' '}
            <span className="text-gold-gradient">найдена</span>
          </h1>
          <div className="w-24 h-0.5 bg-gold/30 mx-auto mb-6" />
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Возможно, она была удалена или вы перешли по неверной ссылке. 
            Давайте вернём вас на главную, где всё начинается.
          </p>
        </div>

        {/* Блок с предложениями */}
        <div className="bg-dark-light/50 border border-gray-800 rounded-2xl p-8 md:p-10 mb-8 animate-fade-in-up animation-delay-200 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gold" />
            </div>
            
            <h2 className="font-serif text-xl md:text-2xl text-white mb-3">
              Что можно сделать?
            </h2>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Вы можете вернуться на предыдущую страницу или перейти на главную, 
              чтобы продолжить знакомство с нашими работами.
            </p>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={goBack}
                className="flex-1 px-6 py-3 bg-dark border border-gray-700 text-white rounded-lg hover:border-gold/50 hover:text-gold transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Назад</span>
              </button>
              
              <button
                onClick={goHome}
                className="flex-1 px-6 py-3 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <Home className="w-5 h-5" />
                <span>На главную</span>
              </button>
            </div>
          </div>
        </div>

        {/* Дополнительные ссылки */}
        <div className="animate-fade-in-up animation-delay-300">
          <p className="text-gray-500 text-sm mb-3">
            Или посмотрите наши популярные разделы:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a 
              href="/#portfolio" 
              className="text-gray-400 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/30"
              onClick={(e) => {
                e.preventDefault();
                navigate('/', { state: { scrollTo: 'portfolio' } });
              }}
            >
              Портфолио
            </a>
            <span className="text-gray-700">•</span>
            <a 
              href="/#types" 
              className="text-gray-400 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/30"
              onClick={(e) => {
                e.preventDefault();
                navigate('/', { state: { scrollTo: 'types' } });
              }}
            >
              Виды значков
            </a>
            <span className="text-gray-700">•</span>
            <a 
              href="/#process" 
              className="text-gray-400 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/30"
              onClick={(e) => {
                e.preventDefault();
                navigate('/', { state: { scrollTo: 'process' } });
              }}
            >
              Процесс
            </a>
            <span className="text-gray-700">•</span>
            <a 
              href="/#contact" 
              className="text-gray-400 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/30"
              onClick={(e) => {
                e.preventDefault();
                navigate('/', { state: { scrollTo: 'contact' } });
              }}
            >
              Контакты
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
