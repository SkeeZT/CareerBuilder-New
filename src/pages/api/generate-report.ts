
export interface RequestBody {
  [key: string]: any;
}

export interface APIResponse {
  success: boolean;
  content?: string;
  base64?: string;
  error?: string;
  message?: string;
  reportStatus?: 'pending' | 'complete';
  reportId?: string;
}

// Function to handle report generation requests
export async function generateReportAPI(requestBody: RequestBody): Promise<APIResponse> {
  try {
    console.log("Submitting report request with data:", JSON.stringify(requestBody));
    
    // Call our Supabase Edge Function
    const edgeFunctionUrl = "https://wfidhsdsghntioeyhypp.supabase.co/functions/v1/generate-report";
    
    // Get anon key - using a hardcoded value since process.env is not available in browser
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmaWRoc2RzZ2hudGlvZXloeXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA2NTAsImV4cCI6MjA1OTcwNjY1MH0.Mkm2Gd39nswnqgB4RengfUIsoCxGXYzg9CEM3AuzRUs";
    
    // Use fetch API with proper timeout and retry mechanism
    const maxRetries = 2;
    let retryCount = 0;
    let lastError;
    
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute timeout
        
        // Send the request to the Edge Function with proper auth headers
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle different response statuses
        if (!response.ok) {
          // Special handling for 546 error (function resource exceeded)
          if (response.status === 546) {
            console.error("Function timeout error (546)");
            return {
              success: false,
              error: "The report generation is taking longer than expected due to high demand. Please try again in a few minutes."
            };
          }
          
          // Try to get more detailed error info
          const errorText = await response.text();
          console.error(`Error from edge function: ${response.status} - ${errorText}`);
          
          // For 500+ errors, we can retry
          if (response.status >= 500 && retryCount < maxRetries) {
            lastError = `Server error: ${response.status} - ${errorText || 'Unknown error'}`;
            retryCount++;
            console.log(`Retrying request (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
            continue;
          }
          
          return {
            success: false,
            error: `Error generating report: ${response.status} - ${errorText || 'Unknown error'}`
          };
        }
        
        // Process the response
        const responseData = await response.json();
        console.log("Received response from edge function:", responseData);
        
        // Return the response data directly
        return responseData;
      } catch (fetchError: any) {
        // If fetch failed due to abortion, provide a timeout message
        if (fetchError.name === 'AbortError') {
          console.error("Request timed out", fetchError);
          return {
            success: false,
            error: "Request timed out. The report generation is taking longer than expected. Please try again."
          };
        }
        
        // For network errors, we can retry
        if (retryCount < maxRetries) {
          lastError = fetchError.message;
          retryCount++;
          console.log(`Network error, retrying request (${retryCount}/${maxRetries})...`, fetchError);
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
          continue;
        }
        
        // If we've exhausted retries, return the error
        console.error("API connection error after retries:", fetchError);
        return {
          success: false,
          error: `Connection error: ${fetchError.message}. Please check your internet connection and try again.`
        };
      }
    }
    
    // If we get here, all retries failed
    return {
      success: false,
      error: `Failed to connect after ${maxRetries} attempts. Last error: ${lastError}`
    };
    
  } catch (error: any) {
    // For other errors
    console.error("Unexpected error in generateReportAPI:", error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
}
