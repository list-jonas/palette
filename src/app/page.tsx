"use client";

import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react"; // Import icons

import colorsData from "./colors.json";
import SidebarPanel from "../components/SidebarPanel";
import ColorDisplay from "../components/ColorDisplay";
import CustomPaletteForm from "../components/CustomPaletteForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false); // State for fullscreen mode

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

    toast.success("Custom palette saved!");

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

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else if ((element as any).mozRequestFullScreen) {
      /* Firefox */
      (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      /* IE/Edge */
      (element as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      /* Firefox */
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      /* Chrome, Safari & Opera */
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      /* IE/Edge */
      (document as any).msExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  // Effect to listen for fullscreen changes (e.g., ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
          !!(document as any).webkitFullscreenElement ||
          !!(document as any).mozFullScreenElement ||
          !!(document as any).msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // Safari, Chrome
    document.addEventListener("mozfullscreenchange", handleFullscreenChange); // Firefox
    document.addEventListener("MSFullscreenChange", handleFullscreenChange); // IE/Edge

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const currentBgColor = palettes[currentPaletteIndex]?.bgColor || "#ffffff";
  const currentDisplayColors = palettes[currentPaletteIndex]?.colors || [];

  return (
    <div
      className="relative min-h-screen transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* Container for top-right buttons */}
      {!isFullscreen && (
        <div className="fixed left-4 top-4 z-50 flex space-x-2">
          {/* Fullscreen Toggle Button */}
          <Button variant="ghost" onClick={toggleFullscreen} size="icon">
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </Button>
          {/* Sidebar Panel Trigger - Now inside the conditional container */}
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
            {/* Pass the trigger button explicitly if needed or adjust SidebarPanel */}
            {/* The default trigger is now part of SidebarPanel, ensure it's styled correctly or passed */}
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
        </div>
      )}

      {/* Rest of the page content */}
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
