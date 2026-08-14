import { Leaf, Recycle, Heart } from 'lucide-react';

export function Benefits() {
    return (
        <section className="py-16 bg-[#fcf9f2]">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-12">Why Choose CircuCity</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mb-6">
                            <Leaf className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">100% Organic</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            All products are certified organic, free from harmful chemicals and pesticides.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mb-6">
                            <Recycle className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Recyclable</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Sustainable packaging that can be recycled or composted completely.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center mb-6">
                            <Heart className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Eco-Conscious</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Every purchase helps reduce carbon footprint and supports sustainable practices.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
