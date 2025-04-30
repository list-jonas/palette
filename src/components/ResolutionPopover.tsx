"use client";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { useState } from "react";
import { Badge } from "./ui/badge";

const PRESETS = [
  { label: "4K", width: 3840, height: 2160 },
  { label: "8K", width: 7680, height: 4320 },
  { label: "Full HD", width: 1920, height: 1080 },
  { label: "Portrait", width: 1080, height: 1920 },
  { label: "HD", width: 1280, height: 720 },
];

export default function ResolutionPopover({
  onSelect,
  children,
}: {
  onSelect: (width: number, height: number) => void;
  children: React.ReactNode;
}) {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const handleSelect = () => {
    onSelect(width, height);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Resolution</h4>
            <p className="text-sm text-muted-foreground">
              Set the desired dimensions.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex flex-row gap-2">
              {PRESETS.map((preset) => (
                <Badge
                  key={preset.label}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setWidth(preset.width);
                    setHeight(preset.height);
                  }}
                >
                  {preset.label}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="width">Width</label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="height">Height</label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="col-span-2"
              />
            </div>
            <Button onClick={handleSelect}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
