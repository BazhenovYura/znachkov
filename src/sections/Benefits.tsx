import { useEffect, useRef } from 'react';
import { PiggyBank, Heart, Gift, Handshake } from 'lucide-react';

interface Benefit {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const benefits: Benefit[] = [
  {
    number: '01',
    title: 'Экономия',
    description: 'Экономия времени, сил и материальных ресурсов на поиск подходящих подарков для сотрудников, партнёров и ключевых клиентов. Готовое решение для выделения лучших сотрудников и мотивации остальных.',
    icon: PiggyBank,
  },
  {
    number: '02',
    title: 'Лояльность',
    description: 'Повышение лояльности к вашей компании и бренду. Качественно изготовленные значки, которые соответствуют вашему бренду или существующему брендбуку, создают положительный имидж.',
    icon: Heart,
  },
  {
    number: '03',
    title: 'Забота',
    description: 'Каждый значок упакован в индивидуальную бархатную ювелирную коробочку. Партия значков отправлена самым надёжным перевозчиком прямо к вам в офис с полным комплектом документов.',
    icon: Gift,
  },
  {
    number: '04',
    title: 'Надёжность',
    description: 'Надёжный партнёр на долгие годы, готовый в любой момент взять на себя задачу по изготовлению корпоративной символики. Готовый макет сохраняется для повторных заказов.',
    icon: Handshake,
  },
];

const Benefits = () => {
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
      className="py-20 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-gold/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Ваши выгоды
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Что вы <span className="text-gold-gradient">получаете</span>
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Результат сотрудничества с нашей компанией — 
            это не просто значки, а инструмент развития вашего бизнеса
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`reveal opacity-0 animation-delay-${(index + 2) * 100} group`}
            >
              <div className="h-full relative p-6 lg:p-8 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/30 transition-all duration-300 hover:-translate-y-2">
                {/* Large number background */}
                <span className="absolute top-4 right-4 font-serif text-6xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors">
                  {benefit.number}
                </span>

                {/* Icon */}
                <div className="relative w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors group-hover:shadow-gold">
                  <benefit.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Content */}
                <div className="relative">
                  <span className="text-gold text-sm font-medium mb-2 block">
                    {benefit.number}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
