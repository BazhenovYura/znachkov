import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'Процесс', href: '#process' },
    { name: 'О нас', href: '#why-us' },
    { name: 'Контакты', href: '#contact' },
  ];

  return (
    <footer className="py-12 lg:py-16 border-t border-gray-800" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold text-gold-gradient">
                ЗНАЧКОВ.РФ
              </span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Производство ювелирных значков из золота и серебра с 1972 года. 
              Собственное производство полного цикла. Индивидуальное изготовление 
              корпоративной символики премиум-класса.
            </p>
            <div className="flex items-center gap-2 text-gold text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Принимаем заказы онлайн</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-medium mb-4">Навигация</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-gold transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-medium mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+79227474474"
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>+7 (922) 74-74-4-74</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:znachkoff@gmail.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>znachkoff@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://yandex.ru/maps/org/uralskiy_yuvelir/1119071637/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Челябинская область, г.Озерск, пр.Победы, 55</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ЗНАЧКОВ.РФ — Все права защищены
          </p>
          <div className="flex flex-col items-center sm:items-end gap-2">
            {/* Privacy Policy Link */}
            <a
              href="https://disk.yandex.ru/i/SUN1UhIcS4pW7Q"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gold transition-colors text-xs"
            >
              Политика конфиденциальности
            </a>
            <div className="text-gray-500 text-xs text-center sm:text-right">
              <p>ИП Баженов Юрий Николаевич</p>
              <p>ИНН: 667115263758</p>
              <p>ТПК "Уральский ювелир"</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
