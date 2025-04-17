
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateReportAPI } from "@/pages/api/generate-report";
import ReportInputDialog from "@/components/ReportInputDialog";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportGeneratorProps {
  userData: {
    fullName: string;
    email: string;
    nationality: string;
    type: string;
    dreamProfession?: string;
    studentLife?: string;
    studyGoals?: string;
  };
  onSuccess?: () => void;
  className?: string;
}

const ReportGenerator = ({ userData, onSuccess, className = "" }: ReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [storedFormData, setStoredFormData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFormData, setLastFormData] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  // Create a reference to an invisible anchor element for downloading
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

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

  // Function to handle downloading a base64 PDF
  const downloadBase64PDF = (base64Data: string, fileName: string) => {
    try {
      const linkSource = `data:application/pdf;base64,${base64Data}`;

      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = linkSource;
        downloadLinkRef.current.download = fileName;
        downloadLinkRef.current.click();
      } else {
        // Fallback if the ref isn't ready
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      }

      toast({
        title: "Report Generated!",
        description: "Your personalized study report has been downloaded.",
        duration: 8000,
      });

      if (onSuccess) onSuccess();
      setRetryCount(0);
      setIsGenerating(false);
      setProgress(100);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "We couldn't download your PDF. Please try again later.",
        variant: "destructive",
        duration: 8000,
      });
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const [pdfContent, setPdfContent] = useState<any>(null);
  const divRef = useRef();

  const generateReport = async (formData: {
    fullName: string;
    nationality: string;
    email: string;
    type: string;
  }) => {
    setIsGenerating(true);
    setLastFormData(formData);
    setProgress(10); // Start progress at 10%

    const statusToast = toast({
      title: "Generating Report",
      description: "Creating your personalized study report... This may take a few minutes.",
      duration: 300000,
    });

    const requestBody = {
      "Full Name": formData.fullName || "Anonymous User",
      "Email": formData.email || "not-provided@example.com",
      "Nationality": formData.nationality || "Not specified",
      "I am a": formData.type || "student",
      "Dream Profession": storedFormData?.dreamProfession || "Not specified",
      "Student Life": storedFormData?.studentLife || "Not specified",
      "Study Goals": storedFormData?.studyGoals || "Not specified",
      "Upload Resume": "" // This is the format MindPal expects when no resume
    };
    const data = JSON.stringify(requestBody)
    console.log(data)
    submitFormData(data)

    // try {
    //   // Prepare data in the proper format expected by MindPal
    //   const requestBody = {
    //     "Full Name": formData.fullName || userData.fullName || "Anonymous User",
    //     "Email": formData.email || userData.email || "not-provided@example.com",
    //     "Nationality": formData.nationality || userData.nationality || "Not specified",
    //     "I am a": formData.type || userData.type || "student",
    //     "Dream Profession": storedFormData?.dreamProfession || userData.dreamProfession || "Not specified",
    //     "Student Life": storedFormData?.studentLife || userData.studentLife || "Not specified", 
    //     "Study Goals": storedFormData?.studyGoals || userData.studyGoals || "Not specified",
    //     "Upload Resume": "N/A" // This is the format MindPal expects when no resume
    //   };

    //   // console.log("Sending report request with data:", requestBody);

    //   // Update progress to indicate we've started the generation process
    //   setProgress(30);

    //   // Make the API call
    //   // const result = await generateReportAPI(requestBody);

    //   // Dismiss the status toast since we have a result
    //   statusToast.dismiss();

    //   if (result.success && result.base64) {
    //     // We have a completed report with base64 data, download it right away
    //     console.log("Received base64 PDF data");
    //     setProgress(90);
    //     const pdfName = `Study_Report_${sanitizeFilename(formData.fullName || userData.fullName)}.pdf`;
    //     downloadBase64PDF(result.base64, pdfName);

    //     // If we have a message, show it
    //     if (result.message) {
    //       toast({
    //         title: "Report Status",
    //         description: result.message,
    //         duration: 10000,
    //       });
    //     }

    //     setDialogOpen(false);
    //     setProgress(100);
    //     return;
    //   } else if (result.success && result.content) {
    //     // We need to create a PDF from the text content
    //     console.log("Received text content, creating PDF");
    //     try {
    //       // Use dynamic import to load jspdf
    //       const { jsPDF } = await import('jspdf');
    //       const doc = new jsPDF();

    //       const pageWidth = doc.internal.pageSize.getWidth();
    //       const margin = 20;
    //       const textWidth = pageWidth - (margin * 2);

    //       doc.setFontSize(16);
    //       doc.text("Study in Asia - Personalized Report", margin, margin);

    //       doc.setFontSize(11);
    //       const splitTitle = doc.splitTextToSize(result.content as string, textWidth);
    //       doc.text(splitTitle, margin, margin + 10);

    //       const pdfName = `Study_Report_${sanitizeFilename(formData.fullName || userData.fullName)}.pdf`;
    //       doc.save(pdfName);

    //       toast({
    //         title: "Report Generated!",
    //         description: "Your personalized study report has been downloaded.",
    //         duration: 8000,
    //       });

    //       setIsGenerating(false);
    //       setProgress(100);
    //       setDialogOpen(false);

    //       if (onSuccess) onSuccess();
    //     } catch (pdfError) {
    //       console.error("Error generating PDF client-side:", pdfError);
    //       toast({
    //         title: "Download Issue",
    //         description: "We couldn't create a PDF from your report. Please try again.",
    //         variant: "destructive", 
    //         duration: 8000,
    //       });
    //       setIsGenerating(false);
    //       setProgress(0);
    //     }

    //     return;
    //   }

    //   // If we get here, something went wrong
    //   console.error("API error response:", result.error);

    //   toast({
    //     title: "Report Generation Failed",
    //     description: result.error || "We couldn't generate your report at this time. Please try again.",
    //     variant: "destructive",
    //     duration: 8000,
    //   });
    //   setRetryCount(prev => prev + 1);
    //   setIsGenerating(false);
    //   setProgress(0);
    // } catch (error) {
    //   statusToast.dismiss();
    //   console.error("Report generation error:", error);

    //   const errorMessage = error instanceof Error ? error.message : String(error);
    //   toast({
    //     title: "Report Generation Failed",
    //     description: `There was an error generating your report: ${errorMessage}`,
    //     variant: "destructive",
    //     duration: 8000,
    //   });
    //   setRetryCount(prev => prev + 1);
    //   setIsGenerating(false);
    //   setProgress(0);
    // } finally {
    //   // If we're still showing progress but it's not 100%, reset it
    //   if (progress > 0 && progress < 100) {
    //     setProgress(0);
    //   }
    // }
  };

  const submitFormData = (data) => {
    axios.post("https://mindpal-api.vercel.app/api/run-workflow", { data }
    ).then((res) => {
      if (res.data) {
        setProgress(30);
        waitingForResponse(res.data)
      }
    }).catch((err) => {
      console.error("Error fetching result:", err);
    })
  }

  const waitingForResponse = (resp) => {
    setTimeout(() => {
      const run_id = resp.workflow_run_id
      getResposeData(run_id)
      setProgress(90);
    }, 20000)
  }

  const getResposeData = (run_id, attempt = 0) => {
    axios.get("https://mindpal-api.vercel.app/api/workflow-result", {
      params: { run_id: run_id }
    })
      .then((res) => {
        const outputs = res.data.workflow_run_output;
        const firstOutput = outputs?.[0]?.content;

        if (firstOutput) {
          console.log(firstOutput);
          handleDownloadPDF(firstOutput);
          setPdfContent(firstOutput)
          setIsGenerating(false);
          setDialogOpen(false);
          setProgress(100);
          toast({
            title: "Report Generated!",
            description: "Your personalized study report has been ready! Download Now.",
            duration: 8000,
          });
        } else if (attempt < 5) {
          // Retry after 3 seconds
          setTimeout(() => getResposeData(run_id, attempt + 1), 5000);
        }
      })
      .catch((err) => {
        console.error("Error fetching result:", err);
      });
  }

  const handleDownloadPDF = (content) => {
    const doc = new jsPDF();
    const text = content

    const lines = doc.splitTextToSize(text, 180); // 180 = page width - margins
    doc.text(lines, 10, 10);
    doc.save("study-report.pdf");
  };

  const handleRetry = () => {
    if (lastFormData) {
      generateReport(lastFormData);
    } else {
      setDialogOpen(true);
    }
  };

  const sanitizeFilename = (name?: string): string => {
    if (!name || name.trim() === '') {
      return 'Study_Report';
    }
    return name.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
  };

  return (
    <>
      {/* Hidden download link */}
      <a
        ref={downloadLinkRef}
        style={{ display: 'none' }}
        download="report.pdf"
        href="#"
      />

      <div className="flex flex-col items-center">
        {progress > 0 && progress < 100 && (
          <div className="w-full mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Generating report...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={() => setDialogOpen(true)}
          disabled={isGenerating}
          className={className}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              Download Your Report
              <Download className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {retryCount > 0 && !isGenerating && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="mt-2 text-sm"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry Report Generation
          </Button>
        )}
      </div>

      <ReportInputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onFormSubmit={generateReport}
        isLoading={isGenerating}
      />
    </>
  );
};

export default ReportGenerator;
