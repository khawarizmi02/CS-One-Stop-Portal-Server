import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loadingVariants = cva(
  "animate-spin rounded-full border-gray-300 border-t-foreground",
  {
    variants: {
      variant: {
        default: "",
        section: "",
        item: "",
      },
      size: {
        default: "w-20 h-20 border-8",
        md: "w-10 h-10 border-6",
        sm: "w-6 h-6 border-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface LoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof loadingVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loadingVariants({ size, variant, className }))}
      />
    );
  },
);

export default Loading;
