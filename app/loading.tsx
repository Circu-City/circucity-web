export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-[#E7F0E9] border-t-[#2D5F3F] rounded-full animate-spin" />
                </div>
                <p className="text-[#2D5F3F] font-medium">Loading...</p>
            </div>
        </div>
    );
}
