
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get('MINDPAL_API_KEY');
    
    // Use the workflow ID from environment variables
    const workflowId = Deno.env.get('MINDPAL_WORKFLOW_ID') || "67f8293957be881abb66f28b";
    
    if (!apiKey) {
      console.error('Missing API configuration: MINDPAL_API_KEY');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing API key configuration. Please check your environment variables."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const rawBody = await req.json();
    console.log("Received request body:", JSON.stringify(rawBody));
    
    // Process resume data in the proper format
    const requestBody = { ...rawBody };
    
    // Properly format the resume data if it exists and isn't already formatted
    if (requestBody.resume && typeof requestBody.resume === 'object' && !Array.isArray(requestBody.resume)) {
      // Properly format the resume for MindPal
      requestBody["Upload Resume"] = [{
        title: requestBody.resume.name || "Resume.pdf",
        documentId: requestBody.resume.id || "",
        s3FilePath: requestBody.resume.path || "N/A",
        size: requestBody.resume.size || 0
      }];
      delete requestBody.resume;
    } else if (requestBody.resume === null || requestBody.resume === undefined) {
      // Handle case where resume is not provided
      requestBody["Upload Resume"] = "N/A";
      delete requestBody.resume;
    }
    
    // Ensure all required fields exist
    if (!requestBody["Full Name"] && requestBody.personalInfo?.name) {
      requestBody["Full Name"] = requestBody.personalInfo.name;
    }
    
    if (!requestBody["Nationality"] && requestBody.personalInfo?.nationality) {
      requestBody["Nationality"] = requestBody.personalInfo.nationality;
    }
    
    if (!requestBody["Email"] && requestBody.personalInfo?.email) {
      requestBody["Email"] = requestBody.personalInfo.email;
    }
    
    if (!requestBody["I am a"] && requestBody.type) {
      requestBody["I am a"] = requestBody.type;
    }
    
    // Clean up nested objects after extracting data
    if (requestBody.personalInfo) {
      delete requestBody.personalInfo;
    }
    
    console.log("Formatted request body:", JSON.stringify(requestBody));

    // Define MindPal API endpoint with the correct workflow ID
    const mindPalUrl = `https://api-v3.mindpal.io/api/workflow/run?workflow_id=${workflowId}`;
    
    // Create proper headers
    const headers = {
      'accept': 'application/json',
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    };
    
    console.log(`Calling MindPal API at ${mindPalUrl}`);
    
    // Start the workflow run
    const response = await fetch(mindPalUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      // Try to get more detailed error info
      const errorText = await response.text();
      console.error(`MindPal API error: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Authentication failed. Please check your API key."
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `MindPal API error: ${response.status} - ${errorText || 'Unknown error'}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the initial response
    const responseData = await response.json();
    console.log("Initial API response:", JSON.stringify(responseData));
    
    // Check if we have a workflow run ID to track
    const runId = responseData.workflow_run_id || responseData.id;
    if (!runId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No workflow run ID returned from MindPal"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Poll for the final output
      const reportContent = await waitForMindPalOutput(runId, apiKey);
      console.log("Received report content successfully");
      
      // Generate PDF from the report content
      try {
        const pdf = new jsPDF();
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const textWidth = pageWidth - (margin * 2);
        
        pdf.setFontSize(16);
        pdf.text("Study in Asia - Personalized Report", margin, margin);
        
        pdf.setFontSize(11);
        const splitText = pdf.splitTextToSize(reportContent, textWidth);
        pdf.text(splitText, margin, margin + 10);
        
        // Convert to base64
        const pdfBytes = pdf.output("arraybuffer");
        const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
        
        console.log("PDF generated successfully");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            reportStatus: 'complete',
            base64: base64PDF
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        
        // Fallback: Return text content if PDF generation fails
        return new Response(
          JSON.stringify({ 
            success: true, 
            content: reportContent 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error retrieving workflow result:", error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error retrieving report: ${error instanceof Error ? error.message : String(error)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error handling report generation: ${error instanceof Error ? error.message : String(error)}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to poll for MindPal workflow completion and return the output
async function waitForMindPalOutput(runId: string, apiKey: string): Promise<string> {
  const url = `https://api-v3.mindpal.io/api/workflow/get-run?run_id=${runId}`;
  
  const headers = {
    'accept': 'application/json',
    'x-api-key': apiKey
  };

  const start = Date.now();
  const timeout = 180000; // 3 minute timeout
  const pollInterval = 5000; // Poll every 5 seconds
  
  console.log(`Polling for workflow completion: ${url}`);
  
  while (Date.now() - start < timeout) {
    try {
      console.log(`Checking workflow status: ${new Date().toISOString()}`);
      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        const errorText = await res.text();
        
        if (res.status === 404) {
          console.log("Workflow not found yet, waiting...");
          await new Promise(r => setTimeout(r, pollInterval));
          continue;
        } else if (res.status === 401) {
          throw new Error("Invalid API key during polling");
        }
        
        throw new Error(`API error during polling: ${res.status} - ${errorText}`);
      }
      
      const json = await res.json();
      console.log(`Workflow status: ${json.status || 'unknown'}`);

      if (json.status === "completed") {
        console.log("Workflow completed successfully");
        // Extract content using various possible formats
        const output = json.output;
        
        if (typeof output === "string") {
          return output;
        }
        
        if (Array.isArray(output)) {
          const contentItem = output.find(i => i?.content);
          if (contentItem?.content) return contentItem.content;
        }
        
        if (output?.Final_Report) {
          return output.Final_Report;
        }
        
        if (output?.Report) {
          return output.Report;
        }
        
        if (output?.content) {
          return output.content;
        }
        
        // Last resort: stringify the output object
        return JSON.stringify(output, null, 2);
      }
      
      if (json.status === "failed") {
        throw new Error("MindPal workflow failed");
      }

      // Wait before checking again
      await new Promise(r => setTimeout(r, pollInterval));
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        await new Promise(r => setTimeout(r, pollInterval));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error("Timed out waiting for workflow to complete");
}
