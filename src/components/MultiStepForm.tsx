
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ChevronRight, ChevronLeft, Briefcase, Users, Target, FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FormData {
  dreamProfession: string;
  studentLife: string;
  studyGoals: string;
  resume: File | null;
  personalInfo: {
    name: string;
    nationality: string;
    email: string;
  };
}

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    dreamProfession: '',
    studentLife: '',
    studyGoals: '',
    resume: null,
    personalInfo: {
      name: '',
      nationality: '',
      email: '',
    }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData({ ...formData, resume: file });
    }
  };

  const handleUploadFile = (file: File) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('document_file', file);

    return fetch('https://api-v3.mindpal.io/api/document/upload', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': import.meta.env.MINDPAL_API_KEY || ''
      },
      body: formDataObj
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: {
        value: {
          title: string;
          s3_file_path: string
          document_id: string
          size: number
        }[]
      }) => {
        console.log('Upload successful:', data);

        return data;
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: "There was an error uploading your file",
          variant: "destructive",
        });
      });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    console.log('Form submitted:', formData);
    
    const resumeLink = await handleUploadFile(formData.resume);
    toast({
      title: "Resume uploaded",
      description: "Resume uploaded successfully",
    });

    // Save form data to localStorage for report generation
    localStorage.setItem('multiStepFormData', JSON.stringify({
      dreamProfession: formData.dreamProfession,
      studentLife: formData.studentLife,
      studyGoals: formData.studyGoals,
      resume: resumeLink,
      personalInfo: formData.personalInfo
    }));

    toast({
      title: "Success!",
      description: "Your information has been submitted successfully.",
    });

    // Redirect to the report page after a short delay
    setTimeout(() => {
      navigate('/report');
    }, 1000);
  };

  const handleNext = () => {
    // Validate form fields if needed
    if (currentStep === 1 && !formData.dreamProfession.trim()) {
      toast({
        title: "Required field",
        description: "Please enter your dream profession",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2 && !formData.studentLife.trim()) {
      toast({
        title: "Required field",
        description: "Please tell us about your ideal student life",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && !formData.studyGoals.trim()) {
      toast({
        title: "Required field",
        description: "Please tell us about your study goals",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(current => (current + 1));
  };

  const handlePrevious = () => {
    setCurrentStep(current => Math.max(1, current - 1));
  };

  const renderStepIcon = (step: number) => {
    const icons = {
      1: <Briefcase className="w-6 h-6" />,
      2: <Users className="w-6 h-6" />,
      3: <Target className="w-6 h-6" />,
      4: <FileText className="w-6 h-6" />,
      5: <User className="w-6 h-6" />
    };
    return icons[step as keyof typeof icons];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 text-blue mb-4">
              {renderStepIcon(1)}
              <h3 className="text-xl font-semibold">Dream Profession</h3>
            </div>
            <p className="text-gray-700 mb-4">What's your ultimate dream or profession? (Example: AI Engineer, Entrepreneur, Doctor, etc.)</p>
            <Textarea
              placeholder="Type your answer here..."
              className="glass-input min-h-[150px] bg-white/40  border border-white/30 text-dream-text"
              value={formData.dreamProfession}
              onChange={(e) => setFormData({ ...formData, dreamProfession: e.target.value })}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 text-blue mb-4">
              {renderStepIcon(2)}
              <h3 className="text-xl font-semibold">Student Life</h3>
            </div>
            <p className="text-gray-700 mb-4">Describe your ideal student life. Think about lifestyle, campus environment, activities, etc.</p>
            <Textarea
              placeholder="Type your answer here..."
              className="glass-input min-h-[150px] bg-white/40  border border-white/30 text-dream-text"
              value={formData.studentLife}
              onChange={(e) => setFormData({ ...formData, studentLife: e.target.value })}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 text-blue mb-4">
              {renderStepIcon(3)}
              <h3 className="text-xl font-semibold">Study Goals</h3>
            </div>
            <p className="text-gray-700 mb-4">What would you like to achieve by studying abroad? Consider personal growth, career opportunities, cultural exposure, etc.</p>
            <Textarea
              placeholder="Type your answer here..."
              className="glass-input min-h-[150px] bg-white/40  border border-white/30 text-dream-text"
              value={formData.studyGoals}
              onChange={(e) => setFormData({ ...formData, studyGoals: e.target.value })}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 text-blue mb-4">
              {renderStepIcon(4)}
              <h3 className="text-xl font-semibold">Upload Resume</h3>
            </div>
            <p className="text-gray-700 mb-4">Upload Resume or Profile (Optional)</p>
            <div className="glass-input flex flex-col items-center justify-center min-h-[200px] cursor-pointer relative bg-white/40  border border-white/30">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-blue mb-2" />
              <p className="text-dream-text mb-1">
                {formData.resume ? formData.resume.name : "Drop your resume here (optional)"}
              </p>
              <p className="text-gray-700 text-sm">
                PDF, DOC or DOCX (max. 5MB)
              </p>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 text-blue mb-4">
              {renderStepIcon(5)}
              <h3 className="text-xl font-semibold">Personal Information</h3>
            </div>
            <p className="text-gray-700 mb-4">Fill in your contact details so we can prepare your personalized career path.</p>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Full Name"
                  className="glass-input bg-white/40  border border-white/30 text-dream-text"
                  value={formData.personalInfo.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      name: e.target.value
                    }
                  })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Nationality"
                  className="glass-input bg-white/40  border border-white/30 text-dream-text"
                  value={formData.personalInfo.nationality}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      nationality: e.target.value
                    }
                  })}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="glass-input bg-white/40  border border-white/30 text-dream-text"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: {
                      ...formData.personalInfo,
                      email: e.target.value
                    }
                  })}
                  required
                />
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-transparent border border-white/20 rounded-2xl p-8 w-full max-w-2xl mx-auto shadow-glass">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* <Button type='button' onClick={() => {
          console.log(">>> FORM DATA", formData)
        }}>
          CHECK DATA
        </Button> */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <div className="text-black">
            STEP : {currentStep}
          </div>

          {/* Only show the Previous button if we're not on the first step */}
          {currentStep !== 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center space-x-2 bg-transparent  border border-white/30 text-dream-text hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
          )}

          {/* If on first step, add a div to maintain the flex layout */}
          {currentStep === 1 && <div></div>}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentStep(current => Math.min(5, current + 1))
              }}
              className="flex items-center space-x-2 bg-blue/90 hover:bg-blue-light/90 "
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-blue/90 hover:bg-blue-light/90 "
            >
              Submit
            </Button>
          )}
        </div>

        <div className="flex justify-center space-x-2 pt-4">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === currentStep ? 'bg-blue scale-125' : 'bg-white/30'
                }`}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
