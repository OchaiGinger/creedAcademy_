"server only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireInstructor() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/login");
  }
  if (session.user.role !== "INSTRUCTOR") {
    return redirect("/not-instructor");
  }
  return session;
}
