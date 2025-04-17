
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import MultiStepForm from '@/components/MultiStepForm';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* 3D Background using Spline - now with higher z-index */}
      <div className="spline-container">
        <spline-viewer url="https://prod.spline.design/0wSFcBkiQ-eT2fKo/scene.splinecode"></spline-viewer>
      </div>
      
      {/* Content positioned with higher z-index to appear above the 3D element */}
      <div className="relative z-20">
        <Header />
        
        {/* Form Section */}
        <section id="form-section" className="py-20 px-6">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dream-text mb-4">
                Build Your Career Path in Asia
              </h1>
              <p className="text-xl text-dream-muted max-w-2xl mx-auto">
                Discover the perfect educational path to achieve your dream profession.
              </p>
            </motion.div>
            
            <MultiStepForm />
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 px-6 bg-dream-card mt-20">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center gap-4">
              <a href="https://studyinasia.co" target="_blank" rel="noopener noreferrer" 
                className="block transition-transform hover:scale-105">
                <img 
                  src="/lovable-uploads/290e7a2a-71e5-4e7e-bd38-cabd21fb0c1b.png" 
                  alt="Study in Asia - The World's Student Portal to Asia" 
                  className="h-10 md:h-12" 
                />
              </a>
              <p className="text-dream-muted text-center">&copy; 2024 STUDY IN ASIA. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
