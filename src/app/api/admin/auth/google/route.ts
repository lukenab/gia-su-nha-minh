export async function GET() {
  return Response.json(
    { error: "The MVP only supports signing in with email and password." },
    { status: 410 },
  );
}
