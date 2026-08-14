
import Link from 'next/link';

export function AdminFooter() {
    return (
        <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>&copy; {new Date().getFullYear()} CircuCity Admin.</span>
                    <span className="hidden md:inline">&bull;</span>
                    <span className="text-gray-400">v2.1.0</span>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <Link href="/dashboard/admin/system-status" className="hover:text-gray-900 transition-colors">
                        System Status
                    </Link>
                    <Link href="/dashboard/admin/support" className="hover:text-gray-900 transition-colors">
                        Internal Support
                    </Link>
                    <Link href="/dashboard/admin/privacy" className="hover:text-gray-900 transition-colors">
                        Data Privacy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
