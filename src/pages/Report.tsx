import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Globe, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import ReportGenerator from '@/components/ReportGenerator';

const Report = () => {
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState<any>({
    fullName: '',
    email: '',
    nationality: '',
    type: 'student',
    dreamProfession: '',
    studentLife: '',
    studyGoals: ''
  });
  
  useEffect(() => {
    // Try to get user's data from localStorage if available
    const storedFormData = localStorage.getItem('multiStepFormData');
    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData);
        
        // Set the user's name
        if (parsedData.personalInfo && parsedData.personalInfo.name) {
          setUserName(parsedData.personalInfo.name);
        }
        
        // Prepare full user data for report generation
        setUserData({
          fullName: parsedData.personalInfo?.name || '',
          email: parsedData.personalInfo?.email || '',
          nationality: parsedData.personalInfo?.nationality || '',
          type: 'student',
          dreamProfession: parsedData.dreamProfession || '',
          studentLife: parsedData.studentLife || '',
          studyGoals: parsedData.studyGoals || ''
        });
      } catch (e) {
        console.error('Error parsing stored form data:', e);
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen relative">
      <div className="spline-container">
        <spline-viewer url="https://prod.spline.design/0wSFcBkiQ-eT2fKo/scene.splinecode"></spline-viewer>
      </div>
      
      <div className="relative z-20">
        <Header />
        
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-8 md:p-10 max-w-4xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-dream-text">
                {userName ? `${userName}'s Study Report` : 'Get Your Personalized Study Report'}
              </h1>
              
              <div className="bg-white/20  rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue">Your Personalized Report Generator</h3>
                <p className="text-dream-text mb-4">
                  Use our AI-powered tool to generate a personalized report based on your preferences and goals.
                  Click the button below to download your custom study recommendations.
                </p>
                
                <div className="flex justify-center mt-8">
                  <ReportGenerator 
                    userData={userData}
                    className="bg-blue hover:bg-blue-dark text-white font-medium"
                  />
                </div>
              </div>
              
              <div className="bg-white/20  rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue">Search More Programs in Asia</h3>
                <p className="text-dream-text">
                  Looking for more programs? Whatever you are looking for, Study in Asia is your portal to Asia's foremost universities, colleges, and language institutes.
                </p>
                <div className="mt-6">
                  <Button 
                    className="bg-blue hover:bg-blue-dark text-white font-medium"
                    onClick={() => window.open('https://studyinasia.co/search', '_blank')}
                  >
                    Explore Programs in Asia
                    <Globe className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white/20  rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue">Next Steps</h3>
                <p className="text-dream-text">
                  Get our limited offer if you apply today, or let us know if you need more help from an education counsellor with expertise in Asia.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-[#ea384c] hover:bg-[#d32b3d] text-white font-medium"
                    onClick={() => window.open('https://studyinasia.co/register', '_blank')}
                  >
                    Limited Offer: Apply Now!
                  </Button>
                  <Button 
                    className="bg-blue hover:bg-blue-dark text-white font-medium"
                    onClick={() => {
                      try {
                        console.log("Counsellor request sent to Study in Asia");
                        
                        toast({
                          title: "Request Sent",
                          description: "Your request for an education counsellor has been sent. Someone will contact you shortly.",
                          duration: 10000,
                        });
                      } catch (error) {
                        console.error("Error sending counsellor request:", error);
                        
                        toast({
                          title: "Request Failed",
                          description: "There was a problem sending your request. Please try again later.",
                          variant: "destructive",
                          duration: 10000,
                        });
                      }
                    }}
                  >
                    I Need an Education Counsellor
                    <Headset className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center">
                <Link to="/">
                  <Button 
                    className="bg-blue hover:bg-blue-dark text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
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

export default Report;
