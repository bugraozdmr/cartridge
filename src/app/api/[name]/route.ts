import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  switch (name) {
    case "taha":
      return Response.json({ message: "Muşspor maçı izlemeyi sever. " });
    case "deniz":
      return Response.json({ message: "Nohut dürüm sever." });
    default:
      return Response.json({ error: "Endpoint bulunamadı" }, { status: 404 });
  }
}
