import { useState, useEffect } from 'react';
import { Phone, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'Процесс', href: '#process' },
    { name: 'О нас', href: '#why-us' },
    { name: 'Контакты', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-dark/95 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="font-serif text-2xl md:text-3xl font-bold text-gold-gradient">
              ЗНАЧКОВ.РФ
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-300 hover:text-gold transition-colors duration-300 text-sm uppercase tracking-wider"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Contact & CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <a
              href="tel:+79227474474"
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">+7 (922) 74-74-4-74</span>
            </a>
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-primary text-sm"
            >
              Получить макет
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-dark/98 backdrop-blur-md transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left text-gray-300 hover:text-gold transition-colors py-2 text-lg"
            >
              {link.name}
            </button>
          ))}
          <div className="pt-4 border-t border-gray-800">
            <a
              href="tel:+79227474474"
              className="flex items-center gap-2 text-gold mb-4"
            >
              <Phone className="w-4 h-4" />
              <span>+7 (922) 74-74-4-74</span>
            </a>
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-primary w-full text-center"
            >
              Получить макет
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
