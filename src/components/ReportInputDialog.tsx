
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import axios from "axios";

interface FormData {
  fullName: string;
  nationality: string;
  email: string;
  type: string;
  termsAccepted: boolean;
}

interface ReportInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit?: (formData: Omit<FormData, 'termsAccepted'>) => void;
  isLoading?: boolean;
}

const ReportInputDialog = ({
  open,
  onOpenChange,
  onFormSubmit,
  isLoading = false
}: ReportInputDialogProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nationality: "",
    email: "",
    type: "student",
    termsAccepted: false,
  });
  const [storedFormData, setStoredFormData] = useState<any>(null);

  // Load stored form data on component mount
  useEffect(() => {
    try {
      const formData = localStorage.getItem('multiStepFormData');
      if (formData) {
        const parsedData = JSON.parse(formData);
        setStoredFormData(parsedData);
      }
    } catch (error) {
      console.error("Error loading stored form data:", error);
    }
  }, []);

  // Load stored form data
  useEffect(() => {
    if (open) {
      try {
        const storedData = localStorage.getItem('multiStepFormData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          if (parsedData.personalInfo) {
            setFormData(prev => ({
              ...prev,
              fullName: parsedData.personalInfo.name || "",
              nationality: parsedData.personalInfo.nationality || "",
              email: parsedData.personalInfo.email || ""
            }));
          }
        }
      } catch (error) {
        console.error("Error loading stored form data:", error);
      }
    }
  }, [open]);

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
        
    if (onFormSubmit) {
      const { termsAccepted, ...submitData } = formData;

      onFormSubmit(submitData);
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
                href="https://studyinasia.co/terms"
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
                Submit <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportInputDialog;
