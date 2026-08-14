'use client';

import { useState } from 'react';
import { 
    MessageSquare, 
    AlertTriangle, 
    Lightbulb, 
    TrendingDown, 
    Smile, 
    Meh, 
    Frown, 
    CheckCircle2
} from 'lucide-react';
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { submitSellerFeedback } from '@/app/actions/feedback';

export default function SellerFeedbackPanel() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [feedbackType, setFeedbackType] = useState<string>('friction');
    const [frictionPoint, setFrictionPoint] = useState<string>('');
    const [comment, setComment] = useState('');
    const [satisfaction, setSatisfaction] = useState<{ [key: string]: number }>({
        listing: 0,
        shipping: 0,
        payouts: 0
    });

    const handleRating = (category: string, value: number) => {
        setSatisfaction(prev => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await submitSellerFeedback({
                feedbackType,
                frictionPoint,
                satisfaction,
                comment
            });
            setSubmitted(true);
            setFeedbackType('problem');
            setFrictionPoint('');
            setComment('');
            setSatisfaction({ listing: 0, shipping: 0, payouts: 0 });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <Card className="bg-white border-[#2D5F3F]/10 shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
                <CardContent className="pt-10 pb-10 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#fcf9f2] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-[#2D5F3F]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#2D5F3F]">Thank You!</h3>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm">
                            Your feedback helps us make CircuCity better for every seller. We'll look into this right away.
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => setSubmitted(false)}
                        className="mt-4 border-[#2D5F3F]/20 text-[#2D5F3F] hover:bg-[#fcf9f2]"
                    >
                        Send More Feedback
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#fcf9f2]/50 border-b border-gray-50 pb-6">
                <CardTitle className="text-lg font-bold text-[#2D5F3F] flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Give us feedback
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Tell us what's on your mind. We're listening!
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                    {/* Feedback Type Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFeedbackType('problem')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                feedbackType === 'problem' 
                                ? 'bg-[#2D5F3F] text-white border-[#2D5F3F] shadow-md' 
                                : 'bg-white text-[#2D5F3F] border-gray-100 hover:border-[#2D5F3F]/30'
                            }`}
                        >
                            <AlertTriangle className={`h-5 w-5 mb-2 ${feedbackType === 'problem' ? 'text-white' : 'text-red-500'}`} />
                            <span className="text-xs font-semibold">Report Problem</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFeedbackType('feature')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                feedbackType === 'feature' 
                                ? 'bg-[#2D5F3F] text-white border-[#2D5F3F] shadow-md' 
                                : 'bg-white text-[#2D5F3F] border-gray-100 hover:border-[#2D5F3F]/30'
                            }`}
                        >
                            <Lightbulb className={`h-5 w-5 mb-2 ${feedbackType === 'feature' ? 'text-white' : 'text-yellow-500'}`} />
                            <span className="text-xs font-semibold">Suggest Feature</span>
                        </button>
                    </div>

                    {/* Sales Friction Section */}
                    <div className="space-y-3">
                        <Label className="text-[#2D5F3F] font-bold text-sm flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                            What’s slowing down your sales?
                        </Label>
                        <RadioGroup 
                            value={frictionPoint} 
                            onValueChange={setFrictionPoint}
                            className="grid grid-cols-1 gap-2"
                        >
                            {[
                                { id: 'low-visibility', label: 'Low Visibility' },
                                { id: 'weak-analytics', label: 'Weak Analytics' },
                                { id: 'confusing-shipping', label: 'Confusing Shipping' },
                                { id: 'slow-payouts', label: 'Slow Payout Confidence' },
                                { id: 'unclear-fees', label: 'Unclear Fees' }
                            ].map((option) => (
                                <div key={option.id} className="flex items-center space-x-2 bg-gray-50/50 p-2 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="text-xs text-gray-700 cursor-pointer flex-1">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Satisfaction Ratings */}
                    <div className="space-y-4 pt-2 border-t border-gray-50">
                        <p className="text-[#2D5F3F] font-bold text-sm">How satisfied are you with...</p>
                        
                        {['listing', 'shipping', 'payouts'].map((cat) => (
                            <div key={cat} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{cat} Experience</Label>
                                    <span className="text-[10px] text-[#2D5F3F] font-medium">
                                        {satisfaction[cat] === 1 ? 'Poor' : satisfaction[cat] === 2 ? 'Neutral' : satisfaction[cat] === 3 ? 'Great' : 'Not rated'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleRating(cat, val)}
                                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${
                                                satisfaction[cat] === val 
                                                ? 'bg-[#2D5F3F] text-white border-[#2D5F3F]' 
                                                : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                                            }`}
                                        >
                                            {val === 1 && <Frown className="h-4 w-4" />}
                                            {val === 2 && <Meh className="h-4 w-4" />}
                                            {val === 3 && <Smile className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Optional Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-xs font-bold text-gray-500">Anything else?</Label>
                        <Textarea 
                            id="comment" 
                            placeholder="Write your thoughts here..."
                            className="bg-gray-50/30 border-gray-100 resize-none h-20 text-xs focus:bg-white transition-colors"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50/50 pt-6 pb-6 border-t border-gray-100">
                    <Button 
                        disabled={isSubmitting} 
                        className="w-full bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-[#2D5F3F]/10"
                    >
                        {isSubmitting ? 'Sending feedback...' : 'Submit Feedback'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
