import { jsonOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  return jsonOk({ user: await getSessionUser() });
}
