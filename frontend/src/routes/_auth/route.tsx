import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import AppSidebar from "@/components/app-sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5143';

export const Route = createFileRoute("/_auth")({
    beforeLoad: async ({ context, location }) => {
        const authData = await context.queryClient.ensureQueryData({
            queryKey: ['auth', 'me'],
            queryFn: async () => {
                try {
                    const response = await fetch(`${API_BASE}/api/auth/me`, {
                        credentials: 'include',
                    });
                    if (!response.ok) return null;
                    return response.json();
                } catch (err) {
                    console.error('Auth check failed:', err);
                    return null;
                }
            },
            staleTime: 5 * 60 * 1000,
        });

        if (!authData) {
            throw redirect({
                to: '/login',
                search: {
                    redirectPath: location.href,
                },
            });
        }
    },
    component: RouteComponent,
});

export default function RouteComponent() {
    const { toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <>
            <AppSidebar />
            <main className={cn("flex items-start w-full px-8 py-10 min-h-screen", {
                "ps-0": isMobile,
            })}
            >
                {isMobile && (
                    <button type="button" onClick={toggleSidebar} className="p-1 m-2">
                        <h1 className="text-4xl flex items-center">
                            <MenuIcon className="size-5" />
                        </h1>
                    </button>
                )}
                <div className="grow">
                    <Outlet />
                </div>
            </main>
        </>
    )
}
