"use client";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ColorDisplayProps {
  colors: string[];
  style: string;
  getStyles: (
    style: string,
    color: string,
    index?: number,
    size?: number
  ) => React.CSSProperties;
  paletteIndex: number;
}

export default function ColorDisplay({
  colors,
  style,
  getStyles,
}: ColorDisplayProps) {
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      toast.success("Color copied to clipboard");
      console.log(`Copied ${color} to clipboard`);
    });
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <AnimatePresence>
        {colors.map((color, index) => (
          <motion.div
            layout
            key={`${index}`}
            style={getStyles(style, color, index, colors.length)}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.01,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ scale: 1.1 }}
            onClick={() => copyToClipboard(color)}
            className="cursor-pointer"
            title={`Click to copy ${color}`}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
