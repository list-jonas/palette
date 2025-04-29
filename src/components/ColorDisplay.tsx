"use client";

import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <AnimatePresence>
        {colors.map((color, index) => (
          <motion.div
            layout
            key={`${color}-${index}`}
            style={getStyles(style, color, index, colors.length)}
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{
              duration: 0.2,
              delay: index * 0.01,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ scale: 1.1 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
