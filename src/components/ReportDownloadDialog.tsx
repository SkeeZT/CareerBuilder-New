
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Download, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FormData {
  fullName: string;
  nationality: string;
  email: string;
  type: string;
  termsAccepted: boolean;
}

interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit?: (formData: FormData) => void;
}

const ReportDownloadDialog = ({ open, onOpenChange, onFormSubmit }: ReportDownloadDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nationality: "",
    email: "",
    type: "",
    termsAccepted: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const extractReportContent = (responseData): string | null => {
    console.log("Full API response:", responseData);

    // Try different response formats
    try {
      // Format 1: responseData.output.Report (original expected format)
      if (responseData.output && responseData.output.Report) {
        return responseData.output.Report;
      }
      
      // Format 2: responseData is the content string directly
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      // Format 3: responseData.content
      if (responseData.content) {
        return responseData.content;
      }
      
      // Format 4: responseData[0].content (array response)
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].content) {
        return responseData[0].content;
      }
      
      // Format 5: Look for any string property that might contain report data
      for (const key in responseData) {
        if (typeof responseData[key] === 'string' && responseData[key].length > 100) {
          return responseData[key];
        }
      }
      
      // If we can't find content, return null
      return null;
    } catch (e) {
      console.error("Error extracting report content:", e);
      return null;
    }
  };

  const sanitizeFilename = (name: string): string => {
    // Use a default if name is empty or undefined
    if (!name || name.trim() === '') {
      return 'Study_Report';
    }
    
    // Replace invalid filename characters
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  };

  const generateReport = async (data: FormData) => {
    console.log('first')
    try {
      setProgressVisible(true);
      setProgress(10);
      
      const url = `https://api-v3.mindpal.io/api/workflow/run?workflow_id=67f8293957be881abb66f28b`;
      const headers = {
        'accept': 'application/json',
        'x-api-key': 'sk-lYBQaRzqCtycZj-_Q5dKtQ20250411165820',
        'Content-Type': 'application/json'
      };
      
      // Get data from MultiStepForm if available through localStorage
      const storedFormData = localStorage.getItem('multiStepFormData');
      let parsedStoredData = null;
      
      try {
        if (storedFormData) {
          parsedStoredData = JSON.parse(storedFormData);
        }
      } catch (parseError) {
        console.error("Error parsing stored form data:", parseError);
      }
      
      // Create combined data object with fallbacks - using the exact field names expected by MindPal
      const combinedData = {
        "Dream Profession": parsedStoredData?.dreamProfession || "Software Engineer",
        "Student Life": parsedStoredData?.studentLife || "Active campus life with diverse social activities",
        "Upload Resume": "N/A",
        "Full Name": data.fullName || "User",
        "Nationality": data.nationality || "Not specified",
        "Email": data.email || "user@example.com",
        "I am a": data.type || "student",
        "Study Goals": parsedStoredData?.studyGoals || "Career advancement and gaining international experience"
      };

      setProgress(30);
      
      console.log("Sending API request with data:", combinedData);
      
      // Implement local retry loop with increased timeouts
      let apiResponse = null;
      let retryAttempt = 0;
      const maxRetries = 2;
      let lastError = null;
      
      while (retryAttempt <= maxRetries && !apiResponse) {
        try {
          // Increase timeout for each retry
          const timeout = 60000 + (retryAttempt * 30000); // 60s, 90s, 120s
          
          if (retryAttempt > 0) {
            setProgress(30 + (retryAttempt * 5));
            console.log(`Retry attempt ${retryAttempt} with timeout ${timeout}ms`);
          }
          
          const response = await axios.post(url, combinedData, { 
            headers,
            timeout: timeout
          });
          
          apiResponse = response;
          break;
          
        } catch (error) {
          lastError = error;
          retryAttempt++;
          
          // Only await between retries, not after the final attempt
          if (retryAttempt <= maxRetries) {
            // Wait longer between each retry
            await new Promise(resolve => setTimeout(resolve, 3000 * retryAttempt));
          }
        }
      }
      
      // If all retries failed
      if (!apiResponse) {
        console.error("All API requests failed after retries:", lastError);
        throw lastError;
      }
      
      setProgress(80);
      
      // Extract content using the new helper function
      const reportContent = extractReportContent(apiResponse.data);
      
      if (reportContent) {
        // Create a Blob from the report content
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Study_Report_${sanitizeFilename(data.fullName)}.txt`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        
        setProgress(100);
        
        setTimeout(() => {
          setProgressVisible(false);
          setProgress(0);
          
          toast({
            title: "Success",
            description: "Your personalized report has been downloaded.",
            duration: 5000,
          });
        }, 1000);
        
        return true;
      } else {
        console.error("Could not extract report content from response:", apiResponse.data);
        throw new Error("Could not extract report content from the API response.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      
      // Handle different types of errors
      let errorMsg = "Failed to generate report. Please try again.";
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          errorMsg = "Network error: Please check your internet connection and try again.";
        } else if (error.code === 'ECONNABORTED') {
          errorMsg = "The request timed out. The server might be busy, please try again later.";
        } else if (error.response) {
          // Server responded with an error status code
          errorMsg = `Server error (${error.response.status}): ${error.response.data?.message || 'Please try again later.'}`;
          console.log("Full error response:", error.response);
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
      
      setProgressVisible(false);
      setProgress(0);
      
      return false;
    }
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
    
    console.log("1first")
    try {
      if (onFormSubmit) {
        onFormSubmit(formData);
      }
      
      const success = await generateReport(formData);
      
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setErrorDialogOpen(false);
    // Add a slight delay before resubmitting
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 500);
  };

  return (
    <>
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
            
            {progressVisible && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Generating report...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
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
                  Submit <Download className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Failed to Generate Report</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
              <p className="mt-2">
                You can try again or come back later. If the problem persists, please contact our support team.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-wrap gap-2">
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              Close
            </AlertDialogAction>
            <Button 
              onClick={handleRetry} 
              className="bg-blue hover:bg-blue-dark"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReportDownloadDialog;
