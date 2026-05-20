const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © 2025 QuetzalShip. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="hover:text-primary-400 transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
