import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { MessageSquare, AlertTriangle, Lightbulb, User } from "lucide-react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: 'Seller Feedback',
    description: 'Review feedback submitted by sellers on CircuCity',
};

export default async function AdminFeedbackPage() {
    // Fetch feedback
    const feedbackList = await prisma.sellerFeedback.findMany({
        include: {
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2D5F3F] to-[#2a5242]">
                    Seller Feedback
                </h1>
                <Badge variant="outline" className="border-[#2D5F3F]/20 text-[#2D5F3F] px-3 py-1">
                    {feedbackList.length} Total Submissions
                </Badge>
            </div>
            
            <p className="text-gray-500">
                Review problems, features, and friction points reported by sellers on the platform.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-700">Type</TableHead>
                            <TableHead className="font-semibold text-gray-700">Seller</TableHead>
                            <TableHead className="font-semibold text-gray-700">Friction</TableHead>
                            <TableHead className="font-semibold text-gray-700">Satisfaction</TableHead>
                            <TableHead className="font-semibold text-gray-700 w-1/3">Comment</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feedbackList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                    No feedback submitted yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            feedbackList.map((entry) => (
                                <TableRow key={entry.id} className={!entry.isRead ? 'bg-[#fcf9f2]/30' : ''}>
                                    <TableCell>
                                        {entry.feedbackType === 'problem' ? (
                                            <Badge variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Problem
                                            </Badge>
                                        ) : entry.feedbackType === 'feature' ? (
                                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200 gap-1">
                                                <Lightbulb className="h-3 w-3" />
                                                Feature
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                General
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {entry.user.image ? (
                                                    <img src={entry.user.image} alt={entry.user.name || ''} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{entry.user.name || 'Unknown User'}</span>
                                                <span className="text-xs text-gray-500">{entry.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {entry.frictionPoint ? (
                                            <span className="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">
                                                {entry.frictionPoint.replace('-', ' ')}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs">
                                            {(() => {
                                                const sat = entry.satisfaction as Record<string, number>;
                                                if (!sat || Object.values(sat).every(v => v === 0)) return <span className="text-gray-400">Not rated</span>;
                                                
                                                return Object.entries(sat).map(([key, value]) => {
                                                    if (value === 0) return null;
                                                    const label = value === 1 ? 'Poor' : value === 2 ? 'Neutral' : 'Great';
                                                    const color = value === 1 ? 'text-red-600' : value === 2 ? 'text-yellow-600' : 'text-green-600';
                                                    return (
                                                        <div key={key} className="flex justify-between w-24">
                                                            <span className="capitalize">{key}:</span>
                                                            <span className={`font-semibold ${color}`}>{label}</span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {entry.comment ? (
                                            <p className="text-sm text-gray-600 line-clamp-2" title={entry.comment}>
                                                {entry.comment}
                                            </p>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No comment provided</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-gray-500">
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
