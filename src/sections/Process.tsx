import { useEffect, useRef } from 'react';
import { 
  FileText, 
  ScrollText, 
  CreditCard, 
  Box, 
  Hammer, 
  Camera, 
  CheckCircle, 
  Truck 
} from 'lucide-react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Анализ ТЗ',
    description: 'Обсуждаем размеры, крепление, количество, варианты исполнения, сроки и стоимость. Если у вас нет ТЗ — составим его.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Договор',
    description: 'Согласовываем техническое задание, устанавливаем график выдачи и оплаты, фиксируем сроки и цену.',
    icon: ScrollText,
  },
  {
    number: '03',
    title: 'Предоплата',
    description: 'Выставляем счёт согласно подписанному договору и ожидаем получение установленной предоплаты.',
    icon: CreditCard,
  },
  {
    number: '04',
    title: '3D-моделирование',
    description: 'Создаём детализированную 3D-модель, передаём на согласование или доработку до полного утверждения.',
    icon: Box,
  },
  {
    number: '05',
    title: 'Производство',
    description: 'Запускаем производство по согласованной модели. При необходимости изготавливаем пилотный образец.',
    icon: Hammer,
  },
  {
    number: '06',
    title: 'Фото',
    description: 'Проводим профессиональную фотосессию готовой партии и отправляем снимки для согласования.',
    icon: Camera,
  },
  {
    number: '07',
    title: 'Постоплата',
    description: 'После согласования готовой партии ожидаем оплату оставшейся части суммы по договору.',
    icon: CheckCircle,
  },
  {
    number: '08',
    title: 'Доставка',
    description: 'Аккуратно упаковываем партию, передаём транспортной компании со страховкой и отправляем трек-номер.',
    icon: Truck,
  },
];

const Process = () => {
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
      id="process"
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Процесс работы
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Как мы <span className="text-gold-gradient">работаем</span>
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Прозрачный процесс от заявки до доставки. 
            Каждый этап контролируется опытными специалистами
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Process Steps - Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className={`reveal opacity-0 animation-delay-${(index + 2) * 100} relative group`}
            >
              <div className="p-6 bg-dark-light rounded-lg border border-gray-800 hover:border-gold/30 transition-all duration-300 h-full flex flex-col">
                {/* Header with icon and number */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <step.icon className="w-6 h-6 text-gold" />
                  </div>
                  <span className="font-serif text-3xl font-bold text-gold-gradient">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                  {step.description}
                </p>

                {/* Decorative line on hover */}
                <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gold/30 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
