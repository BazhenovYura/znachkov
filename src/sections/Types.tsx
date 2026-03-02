import { useEffect, useRef } from 'react';
import { Gem, Crown, Circle, Dot } from 'lucide-react';

interface BadgeType {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  size: string;
}

const badgeTypes: BadgeType[] = [
  {
    id: 'maxi',
    name: 'MAXI',
    icon: Gem,
    description: 'Максимальная детализация для премиальных брендов',
    features: [
      'Полный логотип с названием',
      'Девиз и лозунг компании',
      'Цветовая палитра бренда',
      'Драгоценные камни',
      'Сложная эмаль и гравировка',
    ],
    size: '25-35 мм',
  },
  {
    id: 'midi',
    name: 'MIDI',
    icon: Crown,
    description: 'Оптимальный баланс размера и детализации',
    features: [
      'Основной символ компании',
      'Цветовая палитра бренда',
      'Цветная эмаль',
      'Лазерная гравировка',
      'Гальваника (родирование, золочение)',
    ],
    size: '20-25 мм',
  },
  {
    id: 'mini',
    name: 'MINI',
    icon: Circle,
    description: 'Компактный формат для повседневного использования',
    features: [
      'Компактный символ бренда',
      'Минимальный набор техник',
      'Лазерная гравировка',
      'Чернение и родирование',
      'Экономичное решение',
    ],
    size: '15-20 мм',
  },
  {
    id: 'micro',
    name: 'MICRO',
    icon: Dot,
    description: 'Минимальный размер для массовых мероприятий',
    features: [
      'Упрощённый символ',
      'Базовое исполнение',
      'Минимальная цена',
      'Быстрое производство',
      'Идеально для конференций',
    ],
    size: '10-15 мм',
  },
];

const Types = () => {
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
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Виды значков
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Выберите <span className="text-gold-gradient">формат</span> для вашего бренда
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            От компактных до премиальных — найдите идеальный вариант 
            для ваших задач и бюджета
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Types Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badgeTypes.map((type, index) => (
            <div
              key={type.id}
              className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group`}
            >
              <div className="h-full p-6 lg:p-8 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-gold">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <type.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Name & Size */}
                <div className="flex items-baseline gap-3 mb-4">
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {type.name}
                  </h3>
                  <span className="text-gold text-sm">{type.size}</span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6">
                  {type.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {type.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-2 text-gray-300 text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Types;
