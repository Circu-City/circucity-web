'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface Order {
    id: string;
    createdAt: Date;
    total: number;
    status: string;
    shippingName?: string | null;
    shippingAddressLine1?: string | null;
    shippingAddressLine2?: string | null;
    shippingCity?: string | null;
    shippingState?: string | null;
    shippingPostalCode?: string | null;
    shippingCountry?: string | null;
    feeGross?: number | null;
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: {
            name: string;
            description: string;
        };
    }>;
}

interface ReceiptPrinterProps {
    order: Order;
}

export function ReceiptPrinter({ order }: ReceiptPrinterProps) {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
        setTimeout(() => setIsPrinting(false), 500);
    };

    const handleDownloadPDF = async () => {
        // Create a printable HTML version
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const receiptHTML = generateReceiptHTML(order);
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="flex gap-2">
            <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                disabled={isPrinting}
                className="flex items-center gap-2"
            >
                <Printer className="w-4 h-4" />
                Print Receipt
            </Button>
            <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
            >
                <Download className="w-4 h-4" />
                Download PDF
            </Button>
        </div>
    );
}

function generateReceiptHTML(order: Order): string {
    const itemSubtotal = order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const feeGross = Number(order.feeGross || 0);
    const total = Number(order.total);
    const shipping = total - itemSubtotal - feeGross;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - Order #${order.id.slice(-6).toUpperCase()}</title>
            <style>
                @media print {
                    @page { margin: 0.5in; }
                    body { margin: 0; }
                }
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #2D5F3F;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2D5F3F;
                    margin-bottom: 5px;
                }
                .receipt-title {
                    font-size: 18px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .order-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .info-section {
                    background: #f8f5f2;
                    padding: 15px;
                    border-radius: 8px;
                }
                .info-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .info-value {
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th {
                    background: #2D5F3F;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-size: 14px;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    font-size: 14px;
                }
                .total-row {
                    background: #f8f5f2;
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">CircuCity</div>
                <div class="receipt-title">Order Receipt</div>
            </div>

            <div class="order-info">
                <div class="info-section">
                    <div class="info-label">Order Number</div>
                    <div class="info-value">#${order.id.slice(-6).toUpperCase()}</div>
                </div>
                <div class="info-section">
                    <div class="info-label">Order Date</div>
                    <div class="info-value">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="info-section">
                    <div class="info-label">Status</div>
                    <div class="info-value">${order.status}</div>
                </div>
                <div class="info-section">
                    <div class="info-label">Total Amount</div>
                <div class="info-value">${Number(order.total).toFixed(2)} kr</div>
            </div>
        </div>

        ${order.shippingName ? `
            <div class="info-section" style="margin-bottom: 30px;">
                <div class="info-label">Shipping Address</div>
                <div class="info-value">
                    ${order.shippingName}<br/>
                    ${order.shippingAddressLine1}<br/>
                    ${order.shippingAddressLine2 ? order.shippingAddressLine2 + '<br/>' : ''}
                    ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br/>
                    ${order.shippingCountry}
                </div>
            </div>
        ` : ''}

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.product.name}</td>
                        <td>${item.quantity}</td>
                        <td>${Number(item.price).toFixed(2)} kr</td>
                        <td>${(Number(item.price) * item.quantity).toFixed(2)} kr</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="3" style="text-align: right; border-bottom: none; font-size: 13px; color: #666;">Item Subtotal:</td>
                    <td style="border-bottom: none; font-size: 13px; color: #333;">${itemSubtotal.toFixed(2)} kr</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right; border-bottom: none; font-size: 13px; color: #666;">Shipping & Handling:</td>
                    <td style="border-bottom: none; font-size: 13px; color: #333;">${Math.max(0, shipping).toFixed(2)} kr</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right; font-size: 13px; color: #666;">Shield Fee:</td>
                    <td style="font-size: 13px; color: #333;">${feeGross.toFixed(2)} kr</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total Paid:</td>
                    <td>${Number(order.total).toFixed(2)} kr</td>
                </tr>
                </tbody>
            </table>

            <div class="footer">
                <p>Thank you for shopping with CircuCity!</p>
                <p>For questions about your order, please contact support@circucity.com</p>
            </div>
        </body>
        </html>
    `;
}
