import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImages(images: any): string[] {
  if (Array.isArray(images)) {
    return images.filter((img): img is string => typeof img === 'string');
  }
  return [];
}
