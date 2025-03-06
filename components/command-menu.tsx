'use client';

import { useEffect, useState } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog as DialogRoot, DialogContent as DialogContentRoot, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Database, ToggleLeft, ToggleRight } from 'lucide-react';

// Key for localStorage
export const DB_SEEDING_ENABLED_KEY = 'db_seeding_enabled';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [dbSeedingEnabled, setDbSeedingEnabled] = useState(true);

  // Initialize state from localStorage
  useEffect(() => {
    const storedValue = localStorage.getItem(DB_SEEDING_ENABLED_KEY);
    if (storedValue !== null) {
      setDbSeedingEnabled(storedValue === 'true');
    }
  }, []);

  // Update localStorage when the flag changes
  useEffect(() => {
    localStorage.setItem(DB_SEEDING_ENABLED_KEY, dbSeedingEnabled.toString());
    console.log(`Database seeding ${dbSeedingEnabled ? 'enabled' : 'disabled'}`);
  }, [dbSeedingEnabled]);

  // Listen for cmd+k to open the menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const toggleDbSeeding = () => {
    setDbSeedingEnabled(!dbSeedingEnabled);
    setOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="fixed right-4 top-4 md:right-8 md:top-8 z-40"
        onClick={() => setOpen(true)}
      >
        Press ⌘K
      </Button>

      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContentRoot className="p-0 max-w-[450px]">
          <DialogTitle className="sr-only">Command Menu</DialogTitle>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Database">
                <CommandItem
                  onSelect={toggleDbSeeding}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span>Database Seeding</span>
                    </div>
                    {dbSeedingEnabled ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContentRoot>
      </DialogRoot>
    </>
  );
} 