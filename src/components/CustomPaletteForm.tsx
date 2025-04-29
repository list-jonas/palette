"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, SaveIcon, XIcon } from "lucide-react";

interface CustomPaletteFormProps {
  customPaletteName: string;
  setCustomPaletteName: (name: string) => void;
  customBgColor: string;
  setCustomBgColor: (color: string) => void;
  customColors: string[];
  handleCustomColorChange: (index: number, value: string) => void;
  removeCustomColorInput: (index: number) => void;
  addCustomColorInput: () => void;
  saveCustomPalette: () => void;
}

export default function CustomPaletteForm({
  customPaletteName,
  setCustomPaletteName,
  customBgColor,
  setCustomBgColor,
  customColors,
  handleCustomColorChange,
  removeCustomColorInput,
  addCustomColorInput,
  saveCustomPalette,
}: CustomPaletteFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="paletteName">Palette Name</Label>
        <Input
          type="text"
          id="paletteName"
          value={customPaletteName}
          onChange={(e) => setCustomPaletteName(e.target.value)}
          placeholder="My Awesome Palette"
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="bgColor">Background Color</Label>
        <Input
          type="color"
          id="bgColor"
          value={customBgColor}
          onChange={(e) => setCustomBgColor(e.target.value)}
          className="w-full h-10 p-1 cursor-pointer"
        />
      </div>
      <div className="space-y-3">
        <Label>Colors</Label>
        <div className="space-y-2">
          {customColors.map((color, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => handleCustomColorChange(index, e.target.value)}
                className="w-full h-8 p-1 cursor-pointer"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCustomColorInput(index)}
                disabled={customColors.length <= 1}
                aria-label="Remove color"
              >
                <XIcon />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomColorInput}
            className="w-full mt-2 border-dashed"
          >
            <PlusIcon className="mr-2" /> Add Color
          </Button>
        </div>
      </div>
      <Button onClick={saveCustomPalette} className="w-full mt-4">
        <SaveIcon className="mr-2" /> Save Custom Palette
      </Button>
    </div>
  );
}
