// link/api/clerk/webhook

export const POST = async (req: Request) => {
  const { data } = await req.json();
  console.log("Received event", event);
  return new Response("New webhook event received", { status: 200 });
};
