
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-400 ${
        isScrolled ? 'bg-white/80 shadow-subtle' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link to="/">
            <span className="text-dream-text font-semibold text-xl cursor-pointer">
              Career<span className="text-blue">Builder</span>
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button 
            className="bg-blue hover:bg-blue-dark text-white w-full md:w-auto"
            onClick={() => window.open('https://studyinasia.co/register', '_blank')}
          >
            I want to Apply Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;

