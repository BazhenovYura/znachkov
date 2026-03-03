import { useEffect, useRef } from 'react';
import { ArrowRight, Calendar, Clock, Shield, Truck } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

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

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    { icon: Calendar, text: 'Работаем с 1972 года' },
    { icon: Clock, text: 'От 14 дней' },
    { icon: Shield, text: 'Проверка в УГИПН' },
    { icon: Truck, text: 'Доставка по РФ' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-gold/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column - Text */}
          <div className="space-y-6">
            <div className="reveal opacity-0">
              <span className="inline-block px-4 py-2 border border-gold/30 text-gold text-sm uppercase tracking-widest mb-4">
                Премиум качество
              </span>
            </div>

            <h1 className="reveal opacity-0 animation-delay-100">
              <span className="block font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                ЮВЕЛИРНЫЕ
              </span>
              <span className="block font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold-gradient leading-tight mt-1">
                ЗНАЧКИ
              </span>
              <span className="block font-serif text-2xl sm:text-3xl lg:text-4xl text-white/90 mt-2">
                из золота и серебра
              </span>
            </h1>

            <p className="reveal opacity-0 animation-delay-200 text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
              Корпоративная символика премиум-класса для вашего бренда. 
              Собственное производство с 1972 года. Индивидуальное изготовление 
              значков с логотипом вашей компании.
            </p>

            <div className="reveal opacity-0 animation-delay-300 flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToContact}
                className="btn-primary flex items-center justify-center gap-2 group animate-pulse-gold"
              >
                <span>ПОЛУЧИТЬ БЕСПЛАТНЫЙ МАКЕТ</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToPortfolio}
                className="btn-outline"
              >
                Смотреть портфолио
              </button>
            </div>

            {/* Benefits */}
            <div className="reveal opacity-0 animation-delay-400 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <benefit.icon className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Image (cropped to square) */}
          <div className="reveal opacity-0 animation-delay-300 relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl transform scale-75" />
              
              {/* Image container with crop */}
              <div className="relative z-10 w-full h-full overflow-hidden rounded-lg shadow-2xl">
                <img
                  src="/images/hero-badges.jpg"
                  alt="Ювелирные значки премиум класса"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 border border-gold/30 rounded-lg" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 border border-gold/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:block">
        <div className="w-5 h-8 border-2 border-gold/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-gold rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
