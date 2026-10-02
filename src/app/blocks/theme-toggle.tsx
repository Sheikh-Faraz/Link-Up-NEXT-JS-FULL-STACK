"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {

  const { setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2">

      <Button 
        className="bg-card"
        variant="outline" 
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
      </Button>

      <Button 
        variant="outline" 
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
      </Button>

    </div>
  );
}