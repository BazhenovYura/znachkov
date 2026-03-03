import { useEffect } from 'react';
import { CheckCircle, Phone, Mail, ArrowRight, MessageSquare, Sparkles, Package, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThanksPage = () => {
  useEffect(() => {
    // Скролл наверх при загрузке страницы
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20">
      {/* Декоративный градиент */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-7xl mx-auto">
        {/* Иконка успеха */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center border-2 border-gold/30">
              <CheckCircle className="w-12 h-12 text-gold" />
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-12 animate-fade-in-up animation-delay-100">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Спасибо за{' '}
            <span className="text-gold-gradient">заявку!</span>
          </h1>
          <div className="w-24 h-0.5 bg-gold/30 mx-auto mb-6" />
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Ваш запрос принят. Наш специалист свяжется с вами в ближайшее время 
            для уточнения деталей.
          </p>
        </div>

        {/* Основной блок с ботом */}
        <div className="max-w-4xl mx-auto animate-fade-in-up animation-delay-200">
          <div className="bg-dark-light/50 border border-gray-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center mb-8">
              {/* Иконка бота */}
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gold" />
              </div>
              
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
                Наш бот работает{' '}
                <span className="text-gold-gradient">24/7</span>
              </h2>
              
              <p className="text-gray-400 max-w-2xl">
                Пока вы ждете звонка, наш Telegram-бот уже готов помочь вам с 
                предварительным расчетом и ответить на вопросы
              </p>
            </div>

            {/* Преимущества бота */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-dark border border-gray-800 rounded-xl p-4 hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-medium text-sm">Мгновенный расчет</h3>
                    <p className="text-gray-500 text-xs">Любой партии значков</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark border border-gray-800 rounded-xl p-4 hover:border-gold/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Percent className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-medium text-sm">Акции и новости</h3>
                    <p className="text-gray-500 text-xs">Персональные предложения</p>
                  </div>
                </div>
              </div>

              <div className="bg-dark border border-gray-800 rounded-xl p-4 hover:border-gold/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-medium text-sm">Технологии и работы</h3>
                    <p className="text-gray-500 text-xs">Разборы и демонстрация</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка перехода в бота */}
            <a
              href="https://t.me/BazhenovYuri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center w-full bg-gradient-to-r from-gold/20 to-gold/5 hover:from-gold/30 hover:to-gold/10 border-2 border-gold/30 rounded-xl px-8 py-5 overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-all duration-300" />
              <div className="relative flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-gold" />
                <span className="text-gold font-medium text-lg">
                  Перейти в Telegram бота
                </span>
                <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <p className="text-center text-gray-500 text-sm mt-4">
              Бот доступен круглосуточно и всегда готов помочь с расчетами
            </p>
          </div>
        </div>

        {/* Дополнительные контакты */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-300">
          <p className="text-gray-500 text-sm mb-4">
            Если хотите связаться напрямую:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a
              href="tel:+79227474474"
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors group"
            >
              <Phone className="w-4 h-4 group-hover:text-gold" />
              <span>+7 (922) 74-74-4-74</span>
            </a>
            <a
              href="mailto:znachkoff@gmail.com"
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors group"
            >
              <Mail className="w-4 h-4 group-hover:text-gold" />
              <span>znachkoff@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Кнопка возврата на главную */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-400">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition-colors group"
          >
            <span>Вернуться на главную</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThanksPage;
