
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Download, FileText, Loader2 } from "lucide-react";

interface FormData {
  fullName: string;
  nationality: string;
  email: string;
  type: string;
  termsAccepted: boolean;
}

interface ReportFallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: string;
  userData: {
    fullName: string;
    nationality: string;
    email?: string; // Added email as optional property to match type
    dreamProfession?: string;
    studentLife?: string;
    studyGoals?: string;
  };
  onFormSubmit?: (formData: FormData) => void;
}

const ReportFallbackDialog = ({ open, onOpenChange, content, userData, onFormSubmit }: ReportFallbackDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: userData?.fullName || "",
    nationality: userData?.nationality || "",
    email: "",
    type: "student",
    termsAccepted: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const generateFallbackReport = () => {
    // Use the content if provided, otherwise generate a fallback report
    const reportContent = content || `
STUDY IN ASIA - PERSONALIZED REPORT
Generated on: ${new Date().toLocaleDateString()}

PERSONAL INFORMATION
-------------------
Name: ${formData.fullName || "User"}
Nationality: ${formData.nationality || "Not specified"}
Email: ${formData.email || "Not provided"}
User Type: ${formData.type || "Not specified"}

STUDY PREFERENCES
----------------
Dream Profession: ${userData?.dreamProfession || "Not specified"}
Student Life Preferences: ${userData?.studentLife || "Not specified"}
Study Goals: ${userData?.studyGoals || "Not specified"}

RECOMMENDATIONS
--------------
Based on your preferences, we recommend the following study options in Asia:

1. TOP UNIVERSITIES FOR YOUR FIELD
   - National University of Singapore (NUS), Singapore
   - The University of Tokyo, Japan
   - Peking University, China
   - Seoul National University, South Korea
   - Tsinghua University, China
   - Indian Institute of Technology (IIT), India

2. STUDENT LIFE
   Our recommended universities offer extensive opportunities for:
   - Cultural immersion
   - International student communities
   - Language learning
   - Industry connections
   - Research opportunities

3. SCHOLARSHIP OPPORTUNITIES
   Many Asian universities offer scholarships specifically for international students:
   - MEXT Scholarship (Japan)
   - Chinese Government Scholarship
   - Korean Government Scholarship Program (KGSP)
   - Singaporean Ministry of Education Scholarship
   - Taiwan Scholarship Program

4. NEXT STEPS
   To pursue your study goals in Asia, we recommend:
   - Researching specific programs at recommended universities
   - Checking application deadlines (typically 6-12 months in advance)
   - Preparing language proficiency tests if required
   - Contacting university admissions offices for specific requirements
   - Connecting with an education counselor for personalized guidance

For more information and assistance with your application process, please visit studyinasia.co or request an education counselor through our website.
`;

    // Create a Blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Study_Report_${sanitizeFilename(formData.fullName)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    
    toast({
      title: "Report Generated",
      description: "Your report has been created based on your information.",
      duration: 5000,
    });
    
    onOpenChange(false);
  };

  const sanitizeFilename = (name: string): string => {
    // Use a default if name is empty or undefined
    if (!name || name.trim() === '') {
      return 'Study_Report';
    }
    
    // Replace invalid filename characters
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.nationality || !formData.email || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (!formData.termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (onFormSubmit) {
        onFormSubmit(formData);
      }
      
      // Generate and download the fallback report
      generateFallbackReport();
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Fill out your details</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Complete this form to download your personalized report
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-background"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="bg-background"
              placeholder="Enter your nationality"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background"
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">I am a</Label>
            <Select
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              value={formData.type}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select your type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, termsAccepted: checked as boolean })
              }
            />
            <div className="flex items-center space-x-2">
              <Label htmlFor="terms" className="text-sm font-normal">I agree to the</Label>
              <a 
                href="https://bumpy-target-d2d.notion.site/Terms-of-Use-182afca182c08019a44fc1664e77faca" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue hover:underline text-sm"
              >
                Terms and Conditions
              </a>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue hover:bg-blue-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Report <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFallbackDialog;
