import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        text: "CircuCity has transformed how I shop. I love knowing exactly how much CO2 I save with every purchase!",
        author: "Jessica Thompson",
        role: "Eco Enthusiast",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    },
    {
        id: 2,
        text: "The eco-token rewards system is genius. It actually incentivizes sustainable choices.",
        author: "David Chen",
        role: "Sustainable Living Blogger",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
        id: 3,
        text: "Quality products and fast shipping. Plus, I feel good about every purchase I make here.",
        author: "Maria Gonzalez",
        role: "Green Consumer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
];

export function Testimonials() {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">What Our Community Says</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers making a difference.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#F4D35E]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#2D5F3F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl hover:-translate-y-2 transition-transform duration-300 relative z-10">
                            <div className="text-[#F4D35E] mb-6">
                                <Quote className="w-10 h-10 opacity-50" />
                            </div>

                            <div className="flex text-[#F4D35E] mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                &quot;{testimonial.text}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <div className="font-bold text-neutral-900">{testimonial.author}</div>
                                    <div className="text-sm text-[#2D5F3F] font-medium">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
