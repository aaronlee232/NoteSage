import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isEmpty(items: any[]) {
  return items.length == 0
}

export function isEmptyObject(obj: any): obj is {} {
  return typeof obj === 'object' && Object.keys(obj).length === 0
}
