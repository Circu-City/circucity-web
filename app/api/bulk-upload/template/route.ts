import { NextResponse } from 'next/server';

export async function GET() {
  const csv = [
    'name,price,description,category,stock,weight,image_url,co2_saved',
    'Organic Cotton T-Shirt,299,Soft organic cotton t-shirt in navy blue,Sustainable Fashion,50,0.3,https://example.com/shirt.jpg,2.5',
    'Bamboo Toothbrush Set,89,Pack of 4 biodegradable bamboo toothbrushes,Eco Home,100,0.1,,1.2',
    'Recycled Glass Vase,199,Hand-blown from 100% recycled glass,Recycled Items,25,1.2,,3.8',
    'Solar Powered Garden Light,349,Motion sensor solar light for outdoor,Green Gadgets,30,0.5,,5.0',
    'Natural Face Serum,249,Organic rosehip and jojoba oil serum 50ml,Skincare,40,0.15,,1.5',
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="circucity_bulk_product_template.csv"',
    },
  });
}
