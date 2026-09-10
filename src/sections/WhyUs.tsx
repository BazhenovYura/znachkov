import { useEffect, useRef } from 'react';
import { 
  Palette, 
  Factory, 
  Award, 
  Scan, 
  ShieldCheck, 
  Package 
} from 'lucide-react';

interface Advantage {
  icon: React.ElementType;
  title: string;
  description: string;
}

const advantages: Advantage[] = [
  {
    icon: Palette,
    title: 'Бесплатный макет',
    description: 'Создаём детализированную 3D-визуализацию вашего значка до начала производства',
  },
  {
    icon: Factory,
    title: 'Полный цикл',
    description: 'От дизайна до доставки — собственное производство, срок от 14 дней',
  },
  {
    icon: Award,
    title: '50 лет опыта',
    description: 'С 1972 года создаём ювелирные изделия высочайшего качества',
  },
  {
    icon: Scan,
    title: 'Идеальная точность',
    description: 'Современное 3D-моделирование и компьютерная визуализация 360°',
  },
  {
    icon: ShieldCheck,
    title: '100% соответствие ГОСТ',
    description: 'Проверка сплава в УГИПН, клеймо пробы на каждом изделии',
  },
  {
    icon: Package,
    title: 'Доставка в офис',
    description: 'Надёжная доставка по всей России с полной страховкой',
  },
];

const WhyUs = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="py-20 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Преимущества
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Почему <span className="text-gold-gradient">выбирают</span> нас
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Пятьдесят лет опыта в ювелирном производстве — 
            гарантия качества и безупречного сервиса
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Advantages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group`}
            >
              <div className="h-full p-6 lg:p-8 bg-dark-light/50 rounded-lg border border-gray-800/50 hover:border-gold/30 transition-all duration-300 hover:bg-dark-light">
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors group-hover:shadow-gold">
                  <advantage.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-white mb-3">
                  {advantage.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="reveal opacity-0 animation-delay-500 mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '50+', label: 'Лет опыта' },
            { value: '1000+', label: 'Довольных клиентов' },
            { value: '50000+', label: 'Изготовленных значков' },
            { value: '14', label: 'Дней минимальный срок' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-serif text-4xl lg:text-5xl font-bold text-gold-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
