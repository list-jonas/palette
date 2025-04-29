"use client";

import { useState, useEffect } from "react";

import colorsData from "./colors.json";
import SidebarPanel from "../components/SidebarPanel";
import ColorDisplay from "../components/ColorDisplay";
import CustomPaletteForm from "../components/CustomPaletteForm";

// Define the Palette type
interface Palette {
  name: string;
  bgColor: string;
  colors: string[];
}

const STYLES = [
  "circles",
  "cubes",
  "medium-circles",
  "big-circles",
  "big-pills",
];

export default function Home() {
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("custom-palettes");
      if (stored) return JSON.parse(stored);
    }
    return colorsData.palettes;
  });
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const [currentStyle, setCurrentStyle] = useState(STYLES[0]);
  const [isPanelOpen, setIsPanelOpen] = useState(true); // State for Sheet component

  // State for custom palette creation
  const [customPaletteName, setCustomPaletteName] = useState("");
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [customColors, setCustomColors] = useState<string[]>(["#000000"]);

  // Function to add a new color input field
  const addCustomColorInput = () => {
    setCustomColors([...customColors, "#000000"]);
  };

  // Function to update a specific color input
  const handleCustomColorChange = (index: number, value: string) => {
    const newColors = [...customColors];
    newColors[index] = value;
    setCustomColors(newColors);
  };

  // Function to remove a color input field
  const removeCustomColorInput = (index: number) => {
    if (customColors.length > 1) {
      // Keep at least one color
      const newColors = customColors.filter((_, i) => i !== index);
      setCustomColors(newColors);
    }
  };

  // Function to save the custom palette
  const saveCustomPalette = () => {
    if (!customPaletteName.trim()) {
      alert("Please enter a name for your custom palette.");
      return;
    }
    const newPalette: Palette = {
      name: customPaletteName,
      bgColor: customBgColor,
      colors: customColors,
    };
    const updatedPalettes = [...palettes, newPalette];
    setPalettes(updatedPalettes);
    localStorage.setItem("custom-palettes", JSON.stringify(updatedPalettes));

    setCurrentPaletteIndex(updatedPalettes.length - 1);

    setCustomPaletteName("");
    setCustomBgColor("#ffffff");
    setCustomColors(["#cccccc"]);

    setIsPanelOpen(false);
  };

  // Ensure currentPaletteIndex is valid when palettes change
  useEffect(() => {
    if (currentPaletteIndex >= palettes.length) {
      setCurrentPaletteIndex(palettes.length > 0 ? 0 : -1); // Reset if out of bounds
    }
  }, [palettes, currentPaletteIndex]);

  const getStyles = (
    style: string,
    color: string,
    index?: number,
    size?: number
  ) => {
    if (!size) {
      size = 5;
    }

    switch (style) {
      case "circles":
        return {
          zIndex: index ? index + 10 : undefined,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: color,
        };
      case "cubes":
        return {
          zIndex: index ? index + 10 : undefined,
          width: "50px",
          height: "50px",
          borderRadius: "10px",
          backgroundColor: color,
        };
      case "medium-circles":
        return {
          zIndex: index ? index + 10 : undefined,
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: color,
        };
      case "big-circles":
        return {
          zIndex: index ? index + 10 : undefined,
          marginLeft: "-5vw",
          marginRight: "-5vw",
          width: "30vh",
          aspectRatio: "1/1",
          borderRadius: "50%",
          backgroundColor: color,
        };
      case "big-pills":
        return {
          zIndex: index ? index + 10 : undefined,
          marginLeft: "-5vw",
          marginRight: "-5vw",
          width: `${20 - size / 2}vw`,
          height: "80vh",
          borderRadius: "10vw",
          backgroundColor: color,
        };
      default:
        return {};
    }
  };

  const currentBgColor = palettes[currentPaletteIndex]?.bgColor || "#ffffff";
  const currentDisplayColors = palettes[currentPaletteIndex]?.colors || [];

  return (
    <div
      className="relative min-h-screen transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* Sidebar Panel Component using shadcn/ui Sheet */}
      <SidebarPanel
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        styles={STYLES}
        currentStyle={currentStyle}
        palettes={palettes}
        currentPaletteIndex={currentPaletteIndex}
        onStyleChange={setCurrentStyle}
        onPaletteChange={setCurrentPaletteIndex}
      >
        <CustomPaletteForm
          customPaletteName={customPaletteName}
          setCustomPaletteName={setCustomPaletteName}
          customBgColor={customBgColor}
          setCustomBgColor={setCustomBgColor}
          customColors={customColors}
          handleCustomColorChange={handleCustomColorChange}
          removeCustomColorInput={removeCustomColorInput}
          addCustomColorInput={addCustomColorInput}
          saveCustomPalette={saveCustomPalette}
        />
      </SidebarPanel>

      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-16">
        <ColorDisplay
          colors={currentDisplayColors}
          style={currentStyle}
          getStyles={getStyles}
          paletteIndex={currentPaletteIndex}
        />
      </div>
    </div>
  );
}
