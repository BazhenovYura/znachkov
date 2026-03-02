import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface PortfolioItem {
  id: number;
  image: string;
  title: string;
  description: string;
  material: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    image: '/images/portfolio-1.jpg',
    title: 'Золотой значок с эмалью',
    description: 'Корпоративный значок с цветной эмалью',
    material: 'Золото 585 пробы',
  },
  {
    id: 2,
    image: '/images/portfolio-2.jpg',
    title: 'Серебряный значок',
    description: 'Минималистичный дизайн с синей эмалью',
    material: 'Серебро 925 пробы',
  },
  {
    id: 3,
    image: '/images/portfolio-3.jpg',
    title: 'Коллекция значков',
    description: 'Разнообразие форм и дизайнов',
    material: 'Золото и серебро',
  },
  {
    id: 4,
    image: '/images/portfolio-4.jpg',
    title: 'VIP значок с рубином',
    description: 'Эксклюзивный дизайн с драгоценным камнем',
    material: 'Золото 585 пробы, рубин',
  },
  {
    id: 5,
    image: '/images/portfolio-5.jpg',
    title: 'Серебряный значок',
    description: 'Современный корпоративный стиль',
    material: 'Серебро 925 пробы',
  },
  {
    id: 6,
    image: '/images/portfolio-6.jpg',
    title: 'Золотой значок с бриллиантом',
    description: 'Премиум класс с драгоценным камнем',
    material: 'Золото 585 пробы, бриллиант',
  },
];

const Portfolio = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

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
      id="portfolio"
      ref={sectionRef}
      className="py-20 lg:py-32"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="reveal opacity-0 inline-block text-gold text-sm uppercase tracking-widest mb-4">
            Наши работы
          </span>
          <h2 className="reveal opacity-0 animation-delay-100 section-title">
            Примеры <span className="text-gold-gradient">изготовленных</span> значков
          </h2>
          <p className="reveal opacity-0 animation-delay-200 section-subtitle max-w-2xl mx-auto">
            Каждый значок — это уникальное произведение ювелирного искусства, 
            созданное с вниманием к деталям
          </p>
          <div className="reveal opacity-0 animation-delay-300 gold-line mt-6" />
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <div
              key={item.id}
              className={`reveal opacity-0 animation-delay-${(index % 5) * 100 + 200} group relative`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-dark-light cursor-pointer card-hover">
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content on hover */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-gold text-sm mb-2">{item.material}</span>
                  <h3 className="text-white font-serif text-xl mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                {/* Zoom icon */}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="absolute top-4 right-4 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold hover:text-dark"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Border on hover */}
                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 rounded-lg transition-colors duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/95 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-dark-light rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center hover:bg-gold hover:text-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="grid md:grid-cols-2">
              <div className="aspect-square">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-gold text-sm uppercase tracking-wider mb-4">
                  {selectedItem.material}
                </span>
                <h3 className="font-serif text-3xl text-white mb-4">
                  {selectedItem.title}
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                  {selectedItem.description}
                </p>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary w-fit"
                >
                  Заказать похожий
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
