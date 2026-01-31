export const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsResponse(body, options = {}) {
  return new Response(
    JSON.stringify(body),
    {
      ...options,
      headers: {
        ...corsHeaders,
        ...(options.headers || {}),
      },
    }
  );
}
