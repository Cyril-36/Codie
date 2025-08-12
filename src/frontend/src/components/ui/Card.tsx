import { motion } from "framer-motion";
import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "interactive";
  hoverEffect?: "elevate" | "glow" | "scale" | "none";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  variant = "default",
  hoverEffect = "elevate",
  children,
  className = "",
  onClick,
  ...props
}: CardProps) {
  const baseClasses = `
    bg-bg-tertiary border border-border-default rounded-lg
    transition-all duration-300 ease-out
    ${onClick ? "cursor-pointer" : ""}
  `;

  const variantClasses = {
    default: "shadow-sm",
    elevated: "shadow-md hover:shadow-lg",
    glass: "glass-card backdrop-blur-md",
    interactive: "hover:bg-bg-hover hover:border-border-hover",
  };

  const hoverEffectClasses = {
    elevate: "hover:-translate-y-2 hover:shadow-lg",
    glow: "hover:shadow-glow hover:border-brand-primary/30",
    scale: "hover:scale-105 hover:shadow-md",
    none: "",
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverEffectClasses[hoverEffect]}
    ${className}
  `.trim();

  const CardContent = (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: hoverEffect === "scale" ? 1.05 : 1 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
        onClick={onClick}
      >
        {CardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {CardContent}
    </motion.div>
  );
}

// Card sub-components with premium styling
export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-border-default ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold text-text-primary ${className}`} {...props} />
);

export const CardDescription = ({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-text-secondary ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className}`} {...props} />
);

export const CardFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-border-default ${className}`} {...props} />
);
