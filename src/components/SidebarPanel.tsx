"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface Palette {
  name: string;
  bgColor: string;
  colors: string[];
}

interface SidebarPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  styles: string[];
  currentStyle: string;
  palettes: Palette[];
  currentPaletteIndex: number;
  onStyleChange: (style: string) => void;
  onPaletteChange: (index: number) => void;
  children?: React.ReactNode;
}

export default function SidebarPanel({
  isOpen,
  onOpenChange,
  styles,
  currentStyle,
  palettes,
  currentPaletteIndex,
  onStyleChange,
  onPaletteChange,
  children,
}: SidebarPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="fixed right-4 top-4 z-50">
          <MenuIcon className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Customize Palette</SheetTitle>
          <SheetDescription>
            Select styles, palettes, or create your own.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 mb-auto">
          <Accordion
            type="multiple"
            defaultValue={["styles", "palettes"]}
            className="w-full"
          >
            {/* Styles Section */}
            <AccordionItem value="styles">
              <AccordionTrigger className="text-lg font-medium">
                Styles
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {styles.map((style, index) => (
                    <Button
                      key={index}
                      variant={currentStyle === style ? "secondary" : "ghost"}
                      onClick={() => onStyleChange(style)}
                      className="w-full justify-start"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Predefined Palettes Section */}
            <AccordionItem value="palettes">
              <AccordionTrigger className="text-lg font-medium">
                Palettes
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {palettes.map((palette, index) => (
                    <Button
                      key={palette.name + index}
                      variant={
                        currentPaletteIndex === index ? "secondary" : "ghost"
                      }
                      onClick={() => onPaletteChange(index)}
                      className="w-full justify-start"
                    >
                      {palette.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="custom">
              <AccordionTrigger className="text-lg font-medium">
                Custom Palette
              </AccordionTrigger>
              <AccordionContent>{children}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
