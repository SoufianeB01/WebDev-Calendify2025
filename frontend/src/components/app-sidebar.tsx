// import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { CalendarDays, CircleUserIcon, DoorOpen, LayoutDashboard, LogOut, ShieldUser, UserCheck, Users } from "lucide-react";
// import { useState } from "react";
import { useState } from "react";
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
        title: "Admin",
        url: "/admin",
        icon: ShieldUser,
    },
];

export default function AppSidebar() {
    // const userQuery = useQuery(trpc.user.get.queryOptions({ userId: session?.user?.id }));

    const location = useLocation();
    const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);

    return (
        <>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup className="h-full">
                        <SidebarGroupLabel className="h-fit flex justify-center">
                            <img
                                src={logo}
                                className="h-[8rem] max-w-[8rem] pointer-events-none select-none"
                                alt="logo"
                            />
                        </SidebarGroupLabel>
                        <SidebarGroupContent className="h-full">
                            <SidebarMenu className="gap-2 h-full">
                                {items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.url); // startsWith to imitate activeOptions.exact: false behavior instead of "===" for exact: true
                                    return (
                                        <SidebarMenuItem key={item.title} className="mx-1">
                                            <SidebarMenuButton className="h-full w-full px-3 py-2 rounded-sm font-semibold outline-none border-1 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground" asChild>
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
                                                    {/* HACK: Comment back in this subsidy indicator when customer agrees on subsidy and fix indicator to only apply on items where necessary */}
                                                    {/* <div
                                                        className={cn("ml-auto", {
                                                            hidden: index > 1,
                                                        })}
                                                    >
                                                        <div
                                                            className={cn("bg-sidebar-primary-label text-bg-sidebar-primary-label-foreground h-5 w-5 rounded-full flex justify-center items-center", {
                                                                "bg-sidebar-active-foreground": isActive,
                                                                "text-sidebar-active-label-foreground": isActive,
                                                            })}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                    </div> */}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                                <SidebarMenuItem className="mt-auto mb-4 mx-1">
                                    <SidebarMenuButton asChild>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="bg-popover p-3 rounded-sm data-[state=open]:rounded-tl-none data-[state=open]:rounded-tr-none cursor-pointer outline-none border-1 focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground">
                                                <button type="button" className="w-full flex items-center gap-4 font-semibold">
                                                    {/* {!!userQuery.data?.image && (
                                                        <img src={userQuery.data?.image || undefined} className="h-[3rem] w-[3rem] object-cover pointer-events-none select-none rounded-xs" />
                                                    )}
                                                    {!userQuery.data?.image && (
                                                        <div className="flex justify-center items-center h-[3rem] w-[3rem] bg-card-background rounded-sm border-2 border-card">
                                                            <User className="size-6" />
                                                        </div>
                                                    )} */}
                                                    <h4 className="text-sm">Test gebruiker</h4>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-[var(--radix-dropdown-menu-trigger-width)] m-0 px-3 pt-2 pb-0 rounded-none rounded-tl-sm rounded-tr-sm border-0 shadow-none font-semibold"
                                                align="start" // always align to the left
                                                side="top" // always expand to the top
                                                sideOffset={0} // offset from the trigger
                                            >
                                                <DropdownMenuItem
                                                    className="px-2 py-3 flex items-center gap-2 w-full h-full cursor-pointer"
                                                    onSelect={() => setUserProfileDialogOpen(true)}
                                                >
                                                    <CircleUserIcon className="size-5! text-popover-foreground" />
                                                    {/* HACK: Create: translation(s) */}
                                                    <h3 className="text-base">Account bijwerken</h3>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="px-2 py-3 flex items-center gap-2 w-full h-full cursor-pointer"
                                                    onSelect={async () => {
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
            {/* Modal must be outside sidebar & triggered with states to prevent scope issues when opening the dialog via mouse and via keyboard interaction (tab) */}
            {/* <DialogModal
                open={userProfileDialogOpen}
                setOpen={setUserProfileDialogOpen}
            > */}
            {/* <DialogModal.Header title="Account bijwerken" />
                <UserProfileDialogForm
                    onClose={() => setUserProfileDialogOpen(false)}
                    data={userQuery.data}
                /> */}
            {/* </DialogModal> */}
        </>
    );
}

// function UserProfileDialogForm({
//     onClose,
//     data,
// }: {
//     onClose: () => void;
//     data: UserType | undefined;
// }) {
//     const userUpdateMutation = useMutation({
//         ...trpc.user.update.mutationOptions(),
//         onSettled: () => {
//             queryClient.invalidateQueries(trpc.user.get.queryOptions({ userId: data?.id || "" }));
//             queryClient.invalidateQueries(trpc.user.list.queryOptions());
//         },
//     });

//     const defaultValues: UserUpdateSchemaType = {
//         firstName: data?.firstName || "",
//         middleName: data?.middleName || null,
//         lastName: data?.lastName || "",
//         contactTitle: data?.contactTitle || "",
//         email: data?.email || "",
//         phone: data?.phone || "",
//         fileId: data?.fileId || undefined,
//         contactPreferences: data?.contactPreferences || [],
//     };

//     const form = useAppForm({
//         defaultValues,
//         onSubmit: async ({ value }) => {
//             if (!data)
//                 return;

//             await userUpdateMutation.mutateAsync({
//                 userId: data.id,
//                 firstName: value.firstName,
//                 middleName: value.middleName || null,
//                 lastName: value.lastName,
//                 contactTitle: value.contactTitle,
//                 email: value.email,
//                 fileId: value.fileId || undefined,
//                 phone: value.phone,
//                 contactPreferences: value.contactPreferences,
//                 role: data.role,
//                 objects: value.objects,
//             }, {
//                 onSuccess: () => {
//                     // HACK: Create: translation(s)
//                     toast.success("Uw account is succesvol bijgewerkt.");
//                     onClose();
//                 },
//                 onError: () => {
//                     // HACK: Create: translation(s)
//                     toast.error("Uw account kon niet worden bijgewerkt. Er is een onverwachte fout opgetreden.");
//                 },
//             });
//         },
//         onSubmitInvalid: () => {
//             // HACK: Create: translation(s)
//             toast.error("Uw account kon niet worden bijgewerkt. Controleer de invoer en probeer het opnieuw.");
//         },
//         validators: {
//             onSubmit: userUpdateSchema,
//         },
//     });

//     function handleSubmit(event: FormEvent<HTMLFormElement>) {
//         event.preventDefault();
//         form.handleSubmit();
//     }

//     return (
//         <form.AppForm>
//             <DialogModal.Content>
//                 <form
//                     id="user-profile-update-form"
//                     onSubmit={handleSubmit}
//                     className="flex flex-col gap-4 h-full"
//                     noValidate
//                 >
//                     <div className="flex flex-row gap-2">
//                         <form.AppField
//                             name="firstName"
//                             children={field => (
//                                 <div className="w-3/5">
//                                     {/* HACK: Create: translation(s) */}
//                                     <field.TextField
//                                         placeholder="Voornaam *"
//                                     />
//                                     <field.ValidationError maxToShow={1} />
//                                 </div>
//                             )}
//                         />
//                         <form.AppField
//                             name="middleName"
//                             children={field => (
//                                 <div className="w-2/5">
//                                     {/* HACK: Create: translation(s) */}
//                                     <field.TextField
//                                         placeholder="Tussenvoegsel"
//                                     />
//                                     <field.ValidationError maxToShow={1} />
//                                 </div>
//                             )}
//                         />
//                     </div>
//                     <div className="flex flex-row gap-2">
//                         <form.AppField
//                             name="lastName"
//                             children={field => (
//                                 <div className="w-3/5">
//                                     {/* HACK: Create: translation(s) */}
//                                     <field.TextField
//                                         placeholder="Achternaam *"
//                                     />
//                                     <field.ValidationError maxToShow={1} />
//                                 </div>
//                             )}
//                         />
//                         <form.AppField
//                             name="contactTitle"
//                             children={field => (
//                                 <div className="w-2/5">
//                                     {/* HACK: Create: translation(s) */}
//                                     <field.TextField
//                                         placeholder="Functie titel *"
//                                     />
//                                     <field.ValidationError maxToShow={1} />
//                                 </div>
//                             )}
//                         />
//                     </div>
//                     <form.AppField
//                         name="email"
//                         children={field => (
//                             <div className="flex flex-col">
//                                 {/* HACK: Create: translation(s) */}
//                                 <field.TextField
//                                     placeholder="E-mailadres *"
//                                     type="email"
//                                 />
//                                 <field.ValidationError maxToShow={1} />
//                             </div>
//                         )}
//                     />
//                     <form.AppField
//                         name="phone"
//                         children={field => (
//                             <div className="flex flex-col">
//                                 {/* HACK: Create: translation(s) */}
//                                 <field.TextField
//                                     placeholder="Mobiele telefoonnummer *"
//                                     type="tel"
//                                 />
//                                 <field.ValidationError maxToShow={1} />
//                             </div>
//                         )}
//                     />
//                     <form.AppField
//                         name="contactPreferences"
//                         children={field => (
//                             <Label asChild className="w-full">
//                                 <div>
//                                     {/* HACK: Create: translation(s) */}
//                                     <Label.Text>Kies uw contactvoorkeuren</Label.Text>
//                                     <field.CheckboxGroupField
//                                         className="w-full"
//                                         field={field}
//                                         options={CONTACT_PREFERENCES_OPTIONS as unknown as Array<Option<ContactPreferenceType>>}
//                                         orientation="horizontal"
//                                         labelContainerClassName="flex-1 mt-2"
//                                         customLabel={({ checked, onChange, option }) => (
//                                             <Button
//                                                 type="button"
//                                                 variant={checked ? "success" : "success-outline"}
//                                                 className="w-full p-5"
//                                                 onClick={() => onChange(!checked)}
//                                             >
//                                                 {typeof option.label === "string"
//                                                     ? option.label
//                                                     : <option.label className="size-5" />}
//                                             </Button>
//                                         )}
//                                     />
//                                     <field.ValidationError maxToShow={1} />
//                                 </div>
//                             </Label>
//                         )}
//                     />
//                     <form.AppField
//                         name="fileId"
//                         children={field => (
//                             <Label className="w-full">
//                                 {/* HACK: Create: translation(s) */}
//                                 <Label.Text>Foto</Label.Text>
//                                 <field.UploadDropzoneField
//                                     allowedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
//                                     maxFileSize={5}
//                                     uploader={trpc.user.upload}
//                                 >
//                                     {local => (
//                                         <>
//                                             {(local?.url || data?.image) && (
//                                                 <img src={local?.url ?? data?.image ?? undefined} alt="Afbeelding" className="max-h-24 w-auto object-cover rounded-lg" />
//                                             )}
//                                         </>
//                                     )}
//                                 </field.UploadDropzoneField>
//                                 <field.ValidationError maxToShow={1} />
//                             </Label>
//                         )}
//                     />
//                 </form>
//             </DialogModal.Content>
//             <DialogModal.Footer>
//                 <div className="flex flex-col h-full w-full">
//                     <div className="flex flex-row gap-4 mt-auto">
//                         <Button
//                             type="button"
//                             variant="outline"
//                             className="w-full flex-1 uppercase p-5"
//                             onClick={onClose}
//                         >
//                             {/* HACK: Create: translation(s) */}
//                             Annuleren
//                         </Button>
//                         <form.SubmitButton
//                             form="user-profile-update-form"
//                             className="w-full flex-1 uppercase p-5"
//                             variant="success"
//                         >
//                             {/* HACK: Create: translation(s) */}
//                             Opslaan
//                         </form.SubmitButton>
//                     </div>

//                     {/* Dev helper for forms, only shows on DEV enviroment */}
//                     <form.DevHelper className="static w-full mt-4" />
//                 </div>
//             </DialogModal.Footer>
//         </form.AppForm>
//     );
// }
