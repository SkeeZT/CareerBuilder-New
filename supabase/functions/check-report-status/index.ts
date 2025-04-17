
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  
  // This endpoint is no longer used - return a deprecation notice
  return new Response(
    JSON.stringify({
      success: false,
      error: "This endpoint is deprecated. Reports are now generated directly by the generate-report endpoint."
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
