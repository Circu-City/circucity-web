import { Sidebar } from "@/components/seller/Sidebar";
import { TopBar } from "@/components/seller/TopBar";

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#fcf9f2]">
            <Sidebar />

            <main className="flex-1 w-full min-w-0 md:ml-64 flex flex-col min-h-screen">
                <TopBar />

                <div className="p-6 md:p-8 flex-1 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
