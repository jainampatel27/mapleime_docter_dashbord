import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { WallpaperProvider } from "@/hooks/use-wallpaper";
import { DashboardBackground } from "@/components/dashboard-background";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <WallpaperProvider>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" user={session.user} />
                <SidebarInset>
                    <SiteHeader />
                    <DashboardBackground>
                        <main className="flex-1 overflow-y-auto px-4 py-4 md:py-6 lg:px-6">
                            {children}
                        </main>
                    </DashboardBackground>
                </SidebarInset>
            </SidebarProvider>
        </WallpaperProvider>
    );
}
