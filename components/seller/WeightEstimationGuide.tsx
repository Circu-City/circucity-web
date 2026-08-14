
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

interface WeightEstimationGuideProps {
    onSelect?: (weight: string) => void;
}

export function WeightEstimationGuide({ onSelect }: WeightEstimationGuideProps) {
    const commonWeights = [
        { category: "Clothing", item: "T-Shirt / Top", weight: "0.15 - 0.20 kg", value: "0.2" },
        { category: "Clothing", item: "Jeans / Trousers", weight: "0.40 - 0.70 kg", value: "0.6" },
        { category: "Clothing", item: "Dress", weight: "0.30 - 0.50 kg", value: "0.4" },
        { category: "Clothing", item: "Jacket / Coat", weight: "0.80 - 1.50 kg", value: "1.2" },
        { category: "Clothing", item: "Shoes (Pair)", weight: "0.60 - 1.20 kg", value: "0.9" },
        { category: "Electronics", item: "Smartphone", weight: "0.15 - 0.25 kg", value: "0.2" },
        { category: "Electronics", item: "Tablet", weight: "0.40 - 0.60 kg", value: "0.5" },
        { category: "Electronics", item: "Laptop", weight: "1.20 - 2.50 kg", value: "1.8" },
        { category: "Home", item: "Book (Paperback)", weight: "0.20 - 0.40 kg", value: "0.3" },
        { category: "Home", item: "Book (Hardcover)", weight: "0.50 - 1.00 kg", value: "0.8" },
        { category: "Kitchen", item: "Mug / Cup", weight: "0.30 - 0.40 kg", value: "0.35" },
        { category: "Accessories", item: "Handbag", weight: "0.50 - 1.00 kg", value: "0.75" },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3" />
                    Not sure? See weight guide
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Common Item Weights</DialogTitle>
                    <DialogDescription>
                        Click on an item to use its estimated average weight.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Est. Weight</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commonWeights.map((item, index) => (
                                <TableRow
                                    key={index}
                                    className="cursor-pointer hover:bg-green-50 transition-colors"
                                    onClick={() => onSelect && onSelect(item.value)}
                                >
                                    <TableCell className="font-medium text-xs text-gray-500">{item.category}</TableCell>
                                    <TableCell className="text-sm font-medium text-gray-800">{item.item}</TableCell>
                                    <TableCell className="text-right text-sm font-mono text-gray-600">{item.weight}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
