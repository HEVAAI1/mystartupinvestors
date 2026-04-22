// app/llms/route.ts
export async function GET() {
  return new Response(
    JSON.stringify({
      name: "MyFundingList",
      description: "Investor discovery and fundraising tools",
      resources: [
        "/llms/index.md",
        "/llms/tools.md",
        "/llms/investors.md"
      ]
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}