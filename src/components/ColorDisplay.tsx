"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ColorDisplayProps {
  colors: string[];
  style: string;
  getStyles: (
    style: string,
    color: string,
    index?: number
  ) => React.CSSProperties;
  paletteIndex: number;
}

export default function ColorDisplay({
  colors,
  style,
  getStyles,
  paletteIndex,
}: ColorDisplayProps) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <AnimatePresence>
        {colors.map((color, index) => (
          <motion.div
            layout
            key={`${paletteIndex}-${style}-${color}-${index}`}
            style={getStyles(style, color, index)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
