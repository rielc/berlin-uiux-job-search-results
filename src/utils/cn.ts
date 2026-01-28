import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ClassNameValue = string | null | undefined | boolean;

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(clsx(inputs));
}
