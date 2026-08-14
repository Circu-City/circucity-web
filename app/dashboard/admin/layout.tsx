import { AdminSidebar, AdminSidebarContent } from "@/components/admin/Sidebar";
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminFooter } from "@/components/admin/AdminFooter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <AdminSidebar />
            <main className="flex-1 w-full min-w-0 md:ml-64 flex flex-col min-h-screen">
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
                    <h1 className="font-bold text-gray-800">Admin Dashboard</h1>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2">
                                <Menu className="h-5 w-5 text-gray-600" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <AdminSidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="p-6 md:p-8 flex-1 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {children}
                </div>
                <div className="px-6 md:px-8 pb-6 max-w-[1600px] mx-auto w-full">
                    <AdminFooter />
                </div>
            </main>
        </div>
    );
}
