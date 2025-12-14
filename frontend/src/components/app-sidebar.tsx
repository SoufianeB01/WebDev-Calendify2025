import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CircleUserIcon, DoorOpen, LayoutDashboard, LogOut, ShieldUser, UserCheck, Users } from "lucide-react";
import type { ComponentType } from "react";

import logo from "@/assets/logo.png";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";


type MenuItem = {
    title: string;
    url: string;
    icon: ComponentType<any>;
};

// HACK: Create: translation(s) for sidebar items
const items: Array<MenuItem> = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Evenementen",
        url: "/events",
        icon: CalendarDays,
    },
    {
        title: "Kantoor aanwezigheid",
        url: "/office-attendance",
        icon: UserCheck,
    },
    {
        title: "Kamers",
        url: "/rooms",
        icon: DoorOpen,
    },
    {
        title: "Gebruikers",
        url: "/users",
        icon: Users,
    },
    {
        title: "Admin dashboard",
        url: "/admin",
        icon: ShieldUser,
    },
];

export default function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup className="h-full">
                        <SidebarGroupLabel className="h-fit flex justify-center">
                            <img
                                src={logo}
                                className="h-32 max-w-32 pointer-events-none select-none"
                                alt="logo"
                            />
                        </SidebarGroupLabel>
                        <SidebarGroupContent className="h-full">
                            <SidebarMenu className="gap-2 h-full">
                                {items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.url); // startsWith to imitate activeOptions.exact: false behavior instead of "===" for exact: true
                                    return (
                                        <SidebarMenuItem key={item.title} className="mx-1">
                                            <SidebarMenuButton className="h-full w-full px-3 py-2 rounded-sm font-semibold outline-none border focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground" asChild>
                                                <Link
                                                    to={item.url}
                                                    className={cn("bg-sidebar-primary hover:bg-sidebar-primary-hover active:bg-sidebar-primary-hover text-bg-sidebar-primary-foreground", {
                                                        "cursor-auto": isActive,
                                                        "bg-sidebar-active": isActive,
                                                        "text-sidebar-active-foreground": isActive,
                                                        // Hover & active styles to overwrite Link behavior
                                                        "hover:bg-sidebar-active": isActive,
                                                        "hover:text-sidebar-active-foreground": isActive,
                                                        "active:bg-sidebar-active": isActive,
                                                        "active:text-sidebar-active-foreground": isActive,
                                                    })}
                                                >
                                                    <item.icon className="size-5!" />
                                                    <h3 className="text-base">{item.title}</h3>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                                <SidebarMenuItem className="mt-auto mb-4 mx-1">
                                    <SidebarMenuButton asChild>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="bg-popover p-3 rounded-sm data-[state=open]:rounded-tl-none data-[state=open]:rounded-tr-none cursor-pointer outline-none border focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground">
                                                <button type="button" className="w-full flex items-center gap-4 font-semibold">
                                                    {/* TODO: put current user here */}
                                                    <h4 className="text-sm">Test gebruiker</h4>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-(--radix-dropdown-menu-trigger-width) m-0 px-3 pt-2 pb-0 rounded-none rounded-tl-sm rounded-tr-sm border-0 shadow-none font-semibold"
                                                align="start" // always align to the left
                                                side="top" // always expand to the top
                                                sideOffset={0} // offset from the trigger
                                            >
                                                <DropdownMenuItem
                                                    className="px-2 py-3 flex items-center gap-2 w-full h-full cursor-pointer"
                                                    onSelect={() => navigate({ to: "/profile" })}
                                                >
                                                    <CircleUserIcon className="size-5! text-popover-foreground" />
                                                    {/* HACK: Create: translation(s) */}
                                                    <h3 className="text-base">Mijn profiel</h3>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="px-2 py-3 flex items-center gap-2 w-full h-full cursor-pointer"
                                                    onSelect={() => {
                                                        // const response = await authClient.signOut();

                                                        // if (response.error) {
                                                        //     toast.error("U kon niet worden uitgelogd. Er is een onverwachte fout opgetreden.");
                                                        // }
                                                        // else {
                                                        // window.location.href = "/login";
                                                        // }

                                                        localStorage.removeItem('isAuthenticated');
                                                        window.location.href = "/login"
                                                    }}
                                                >
                                                    <LogOut className="size-5! text-popover-foreground" />
                                                    {/* HACK: Create: translation(s) */}
                                                    <h3 className="text-base">Uitloggen</h3>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    );
}