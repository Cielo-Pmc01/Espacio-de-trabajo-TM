const SUPABASE_URL = "https://mrovdtkeckxgknkoeqva.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY";

const IDS = [
  "8bc4f081-3296-4d36-8e28-71bc4bbe9996", // Logística
  "2a2b04f0-be84-4f37-ba7b-74586a4ee3e6", // Metodología
];

for (const id of IDS) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lessons?id=eq.${id}&select=id,title,content_json`, {
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Accept-Profile": "capacitacion_tm",
    },
  });
  const [lesson] = await res.json();
  console.log(`\n=== ${lesson.title} (${lesson.id}) ===`);
  console.log(JSON.stringify(lesson.content_json, null, 2));
}
