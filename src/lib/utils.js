import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * @param {...string} inputs - Class names to merge
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
	return twMerge(clsx(inputs));
}
