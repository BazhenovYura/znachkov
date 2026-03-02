import { useEffect, useRef } from 'react';
import { ArrowRight, Phone } from 'lucide-react';

const CTA = () => {
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

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-32 relative overflow-hidden"
    >
      {/* Gold gradient background */}
      <div className="absolute inset-0 bg-gold-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-dark/20 via-transparent to-gold-dark/20" />
      </div>

      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="reveal opacity-0 inline-block text-dark/70 text-sm uppercase tracking-widest mb-4">
            Специальное предложение
          </span>
          
          <h2 className="reveal opacity-0 animation-delay-100 font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-dark mb-6">
            ПОЛУЧИТЕ БЕСПЛАТНЫЙ<br />
            МАКЕТ ЗНАЧКА
          </h2>
          
          <p className="reveal opacity-0 animation-delay-200 text-dark/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Оставьте заявку и мы создадим 3D-визуализацию вашего значка 
            абсолютно бесплатно — без обязательств и скрытых условий
          </p>

          <div className="reveal opacity-0 animation-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToContact}
              className="px-8 py-4 bg-dark text-gold font-semibold rounded-sm hover:bg-dark-light transition-all duration-300 flex items-center gap-2 group animate-pulse-gold"
            >
              <span>ОСТАВИТЬ ЗАЯВКУ</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="tel:+79227474474"
              className="flex items-center gap-2 text-dark font-semibold hover:text-dark/80 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>+7 (922) 74-74-4-74</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
