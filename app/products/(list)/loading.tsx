export default function ProductsLoading() {
    return (
        <div className="min-h-screen bg-[#f8f5f2]">
            <div className="bg-[#2D5F3F] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="h-4 w-32 bg-white/20 rounded mb-4 animate-pulse" />
                    <div className="h-10 w-64 bg-white/20 rounded mb-2 animate-pulse" />
                    <div className="h-5 w-48 bg-white/20 rounded animate-pulse" />
                </div>
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 animate-pulse">
                            <div className="h-6 w-16 bg-gray-200 rounded" />
                            <div className="h-4 w-full bg-gray-200 rounded" />
                            <div className="h-4 w-3/4 bg-gray-200 rounded" />
                            <div className="h-8 w-full bg-gray-200 rounded" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-in fade-in duration-200" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                                        <div className="aspect-[4/5] bg-gray-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                                            <div className="h-5 bg-gray-200 rounded w-1/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
