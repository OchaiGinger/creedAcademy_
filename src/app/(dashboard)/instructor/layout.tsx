import { AppSidebar } from "@/components/sidebar/app-sidebar";

import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const InstructorLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // 1. Get Session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Check if logged in
  if (!session) {
    return redirect("/auth/signin");
  }

  // 3. Check Role (Allow ADMINs to see it too if you want)
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    return redirect("/"); // Redirect unauthorized users to home
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 md:px-4 lg:px-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default InstructorLayout;
