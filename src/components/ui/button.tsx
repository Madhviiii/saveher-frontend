import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.3)] hover:shadow-lg hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_8px_40px_-8px_hsl(var(--destructive)/0.5)] hover:shadow-lg",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_4px_20px_-4px_hsl(var(--secondary)/0.3)] hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sos: "bg-gradient-to-br from-[hsl(0,84%,55%)] to-[hsl(0,84%,45%)] text-white shadow-[0_8px_40px_-8px_hsl(0,84%,60%,0.5)] hover:shadow-lg hover:scale-105 active:scale-95",
        doubt: "bg-gradient-to-br from-[hsl(38,92%,50%)] to-[hsl(38,92%,40%)] text-white shadow-[0_4px_20px_-4px_hsl(38,92%,50%,0.3)] hover:shadow-lg hover:scale-105 active:scale-95",
        audio: "bg-gradient-to-br from-[hsl(174,60%,40%)] to-[hsl(174,60%,30%)] text-white shadow-[0_4px_20px_-4px_hsl(174,60%,40%,0.3)] hover:shadow-lg hover:scale-105 active:scale-95",
        hero: "bg-gradient-to-r from-[hsl(347,77%,50%)] via-[hsl(347,77%,55%)] to-[hsl(174,60%,45%)] text-white shadow-[0_0_60px_hsl(347,77%,50%,0.3)] hover:shadow-lg hover:scale-105 active:scale-95 text-base",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-lg": "h-16 w-16 rounded-2xl",
        "icon-xl": "h-24 w-24 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
