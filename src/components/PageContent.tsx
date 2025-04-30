"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { useRouter, useSearchParams } from "next/navigation";
import { Maximize, Minimize, Download } from "lucide-react";
import ResolutionPopover from "./ResolutionPopover";

import colorsData from "../app/colors.json";
import SidebarPanel from "./SidebarPanel";
import ColorDisplay from "./ColorDisplay";
import CustomPaletteForm from "./CustomPaletteForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

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
  "diamonds",
  "vertical-pills",
  "big-diamonds",
];

export default function PageContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load initial palettes, including custom ones from local storage
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    let initialPalettes = [...colorsData.palettes]; // Start with predefined
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("custom-palettes");
      if (stored) {
        try {
          const customPalettes: Palette[] = JSON.parse(stored);
          // Filter out any potential duplicates or invalid entries if necessary
          initialPalettes = [...initialPalettes, ...customPalettes];
        } catch (error) {
          console.error(
            "Failed to parse custom palettes from localStorage:",
            error
          );
          // Optionally clear invalid storage
          // localStorage.removeItem("custom-palettes");
        }
      }
    }
    return initialPalettes;
  });

  // Initialize state from URL or defaults
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(() => {
    const urlCustomData = searchParams.get("customData");
    const urlPaletteIndexStr = searchParams.get("palette");

    if (urlCustomData) {
      try {
        const decodedString = decompressFromEncodedURIComponent(urlCustomData);
        if (!decodedString) throw new Error("Decoded string is null");
        const customPalette: Palette = JSON.parse(decodedString);

        // Find if this exact custom palette exists
        const existingIndex = palettes.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(customPalette)
        );

        if (existingIndex !== -1) {
          return existingIndex;
        } else {
          // If not found, add it (temporary, won't persist unless saved)
          // This scenario is less likely if saving adds to localStorage first
          // But handles direct URL sharing of unsaved palettes
          console.warn(
            "Custom palette from URL not found in state, adding temporarily."
          );
          // We can't modify state here directly, handle in useEffect
          return -2; // Special flag to indicate adding from URL
        }
      } catch (error) {
        console.error("Failed to decode custom palette data from URL:", error);
        // Fallback to default if decoding fails
        return 0;
      }
    } else if (urlPaletteIndexStr) {
      const index = parseInt(urlPaletteIndexStr, 10);
      return index >= 0 && index < palettes.length ? index : 0;
    } else {
      return 0; // Default to the first palette
    }
  });

  const [currentStyle, setCurrentStyle] = useState(() => {
    const urlStyle = searchParams.get("style");
    return urlStyle && STYLES.includes(urlStyle) ? urlStyle : STYLES[0];
  });

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(
    searchParams.get("fullscreen") === "true"
  );

  const handleDownload = async (targetW: number, targetH: number) => {
    const wrapper = wrapperRef.current!;

    // 1) Hide interactive bits
    const hidden = [...wrapper.querySelectorAll("button, .bg-popover")].map(
      (el) => {
        const prev = (el as HTMLElement).style.display;
        (el as HTMLElement).style.display = "none";
        return { el: el as HTMLElement, prev };
      }
    );

    // 2) compute scale to fit wrapper into target box
    const rect = wrapper.getBoundingClientRect();
    const scaleX = targetW / rect.width;
    const scaleY = targetH / rect.height;
    const scale = Math.min(scaleX, scaleY);

    // 3) apply CSS transform
    wrapper.style.transformOrigin = "top left";
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;

    // 4) wait a tick for layout to settle
    await new Promise((r) => requestAnimationFrame(r));

    // 5) capture that wrapper at devicePixelRatio
    const canvas = await html2canvas(wrapper, {
      scale: window.devicePixelRatio,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true,
    });

    // 6) restore everything
    hidden.forEach(({ el, prev }) => (el.style.display = prev));
    wrapper.style.transform = "";
    wrapper.style.transformOrigin = "";
    wrapper.style.width = "";
    wrapper.style.height = "";

    // 7) download
    const link = document.createElement("a");
    link.download = "palette-screenshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

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
      toast.error("Please enter a name for your custom palette.");
      return;
    }
    const newPalette: Palette = {
      name: customPaletteName,
      bgColor: customBgColor,
      colors: customColors,
    };

    // Check if a palette with the same content already exists
    const existingIndex = palettes.findIndex(
      (p) =>
        JSON.stringify(p.colors) === JSON.stringify(newPalette.colors) &&
        p.bgColor === newPalette.bgColor
      // Optionally check name too, or allow same content with different names
      // p.name === newPalette.name
    );

    let updatedPalettes;
    let newIndex;

    if (existingIndex !== -1) {
      // Palette content exists, maybe update name or just select it
      toast.info("Palette with similar colors already exists.");
      // Decide if you want to overwrite or just switch to the existing one
      // For now, let's just switch to it
      updatedPalettes = [...palettes]; // No change to the array itself
      newIndex = existingIndex;
    } else {
      // Palette is new, add it
      updatedPalettes = [...palettes, newPalette];
      setPalettes(updatedPalettes);
      localStorage.setItem(
        "custom-palettes",
        JSON.stringify(updatedPalettes.slice(colorsData.palettes.length))
      ); // Store only custom ones
      toast.success("Custom palette saved!");
      newIndex = updatedPalettes.length - 1;
    }

    setCurrentPaletteIndex(newIndex);

    // Reset form
    setCustomPaletteName("");
    setCustomBgColor("#ffffff");
    setCustomColors(["#cccccc"]);

    setIsPanelOpen(false); // Close panel after saving
  };

  // Handler for changing the style
  const handleStyleChange = (style: string) => {
    setCurrentStyle(style);
  };

  // Handler for changing the palette
  const handlePaletteChange = (index: number) => {
    setCurrentPaletteIndex(index);
  };

  // Effect to handle adding custom palette from URL if flagged
  useEffect(() => {
    if (currentPaletteIndex === -2) {
      const urlCustomData = searchParams.get("customData");
      if (urlCustomData) {
        try {
          const decodedString =
            decompressFromEncodedURIComponent(urlCustomData);
          if (!decodedString) throw new Error("Decoded string is null");
          const customPalette: Palette = JSON.parse(decodedString);

          // Double-check it's not already added
          const existingIndex = palettes.findIndex(
            (p) => JSON.stringify(p) === JSON.stringify(customPalette)
          );

          if (existingIndex === -1) {
            const updatedPalettes = [...palettes, customPalette];
            setPalettes(updatedPalettes);
            // Don't save to localStorage here, it's just from URL
            setCurrentPaletteIndex(updatedPalettes.length - 1);
          } else {
            // Already exists (maybe added between initial state and effect), just set index
            setCurrentPaletteIndex(existingIndex);
          }
        } catch (error) {
          console.error(
            "Failed to process custom palette from URL in effect:",
            error
          );
          setCurrentPaletteIndex(0); // Fallback
        }
      } else {
        // Flag was set but no customData found? Fallback.
        setCurrentPaletteIndex(0);
      }
    }
  }, [currentPaletteIndex, palettes, searchParams]); // Add palettes and searchParams

  // Ensure currentPaletteIndex is valid when palettes change
  useEffect(() => {
    // Skip validation if index is the special flag -2
    if (currentPaletteIndex === -2) return;

    if (currentPaletteIndex < 0 || currentPaletteIndex >= palettes.length) {
      console.warn(
        `Invalid palette index ${currentPaletteIndex} detected, resetting.`
      );
      setCurrentPaletteIndex(palettes.length > 0 ? 0 : -1); // Reset to 0 or -1 if empty
    }
    // No need to read from URL here again, initial state handles that.
    // This effect purely validates the current index against the current palettes array.
  }, [palettes, currentPaletteIndex]);

  // Update URL when palette, style or fullscreen changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Handle palette parameter
    if (currentPaletteIndex >= 0 && currentPaletteIndex < palettes.length) {
      const selectedPalette = palettes[currentPaletteIndex];
      const isCustom = currentPaletteIndex >= colorsData.palettes.length;

      if (isCustom) {
        try {
          const dataToEncode = JSON.stringify(selectedPalette);
          const encodedData = compressToEncodedURIComponent(dataToEncode);
          params.set("customData", encodedData);
          params.delete("palette"); // Remove index param for custom
        } catch (error) {
          console.error("Failed to encode custom palette data:", error);
          // Fallback: maybe set index anyway?
          params.set("palette", currentPaletteIndex.toString());
          params.delete("customData");
        }
      } else {
        // Predefined palette
        params.set("palette", currentPaletteIndex.toString());
        params.delete("customData"); // Remove custom data param if switching back
      }
    } else {
      // Handle invalid index (e.g., -1 if palettes is empty)
      params.delete("palette");
      params.delete("customData");
    }

    // Handle style parameter
    params.set("style", currentStyle);
    params.set("fullscreen", isFullscreen.toString());

    // Use replace to avoid adding to browser history for every change
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPaletteIndex, currentStyle, palettes, router, searchParams]); // Add palettes dependency

  const getStyles = (
    style: string,
    color: string,
    index?: number,
    size?: number
  ): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      zIndex: index ? index + 10 : undefined,
      backgroundColor: color,
    };

    const effectiveSize = size || 5;

    switch (style) {
      case "circles":
        return {
          ...baseStyle,
          width: "50px",
          height: "50px",
          borderRadius: "50%",
        };
      case "cubes":
        return {
          ...baseStyle,
          width: "50px",
          height: "50px",
          borderRadius: "10px",
        };
      case "medium-circles":
        return {
          ...baseStyle,
          width: "80px",
          height: "80px",
          borderRadius: "50%",
        };
      case "big-circles":
        return {
          ...baseStyle,
          marginLeft: "-5vw",
          marginRight: "-5vw",
          width: "30vh",
          aspectRatio: "1/1",
          borderRadius: "50%",
        };
      case "big-pills":
        return {
          ...baseStyle,
          marginLeft: "-5vw",
          marginRight: "-5vw",
          width: `${20 - effectiveSize / 2}vw`,
          height: "80vh",
          borderRadius: "10vw",
        };
      case "diamonds":
        return {
          ...baseStyle,
          width: "60px",
          height: "60px",
          rotate: "45deg",
          borderRadius: "10px",
        };
      case "big-diamonds":
        return {
          ...baseStyle,
          marginLeft: "-2vw",
          marginRight: "-2vw",
          width: "30vh",
          aspectRatio: "1/1",
          rotate: "45deg",
          borderRadius: "10px",
        };
      case "vertical-pills":
        return {
          ...baseStyle,
          width: "30px",
          height: "80px",
          borderRadius: "15px",
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

  const currentBgColor =
    (currentPaletteIndex >= 0 && palettes[currentPaletteIndex]?.bgColor) ||
    "#ffffff";
  const currentDisplayColors =
    (currentPaletteIndex >= 0 && palettes[currentPaletteIndex]?.colors) || [];

  return (
    <div
      className="relative min-h-screen transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* Container for top-right buttons */}
      {!isFullscreen && (
        <div className="fixed left-4 top-4 z-50 flex space-x-2">
          <Button variant="secondary" onClick={toggleFullscreen} size="icon">
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </Button>
          <ResolutionPopover onSelect={handleDownload}>
            <Button variant="secondary" size="icon">
              <Download />
            </Button>
          </ResolutionPopover>
          {/* Sidebar Panel Trigger - Now inside the conditional container */}
          <SidebarPanel
            isOpen={isPanelOpen}
            onOpenChange={setIsPanelOpen}
            styles={STYLES}
            currentStyle={currentStyle}
            palettes={palettes}
            currentPaletteIndex={currentPaletteIndex}
            onStyleChange={handleStyleChange} // Use handler
            onPaletteChange={handlePaletteChange} // Use handler
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
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8 pt-16"
        ref={wrapperRef}
        style={{ backgroundColor: currentBgColor }}
      >
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
