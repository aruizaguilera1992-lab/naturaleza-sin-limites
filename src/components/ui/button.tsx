import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-w-0 items-center justify-center gap-2 whitespace-normal rounded-lg text-center text-sm font-semibold leading-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-heading uppercase tracking-wider active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:brightness-110",
        hero: 
          "bg-gradient-to-r from-adventure-orange to-adventure-orange-light text-primary-foreground shadow-glow hover:shadow-xl hover:scale-105 hover:brightness-110 active:scale-100",
        heroOutline:
          "border-2 border-foreground/80 text-foreground bg-transparent hover:bg-foreground/10 hover:border-foreground hover:scale-105 backdrop-blur-sm active:scale-100",
        adventure:
          "bg-adventure-forest text-foreground hover:bg-adventure-forest-light shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110",
      },
      size: {
        default: "min-h-12 px-5 py-2.5 sm:px-6",
        sm: "min-h-11 rounded-md px-3 py-2 text-xs sm:px-4",
        lg: "min-h-12 rounded-xl px-6 py-3 text-sm sm:min-h-14 sm:px-8 sm:text-base",
        xl: "min-h-13 rounded-xl px-6 py-3 text-sm sm:min-h-16 sm:px-10 sm:text-lg",
        icon: "h-11 w-11 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
