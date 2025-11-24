import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { createSkin } from "@/graphql/mutations";
import { MarketItem } from "@/types/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

interface AddSkinSheetProps {
  item: MarketItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const client = generateClient();

export function AddSkinSheet({
  item,
  isOpen,
  onOpenChange,
}: AddSkinSheetProps) {
  const [quantity, setQuantity] = useState<string>("1");
  const [isSaving, setIsSaving] = useState(false);

  // Reset quantity when the sheet opens for a new item
  useEffect(() => {
    if (isOpen) {
      setQuantity("1");
    }
  }, [isOpen, item]);

  const handleSave = async () => {
    if (!item) return;

    const qtyInt = parseInt(quantity, 10);
    if (isNaN(qtyInt) || qtyInt <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    setIsSaving(true);

    try {
      await client.graphql({
        query: createSkin,
        variables: {
          input: {
            market_hash_name: item.market_hash_name,
            image: item.image,
            quantity: qtyInt,
            wear: item.wear,
            statTrak: item.statTrak,
          },
        },
      });
      console.log("Skin added to inventory.");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving skin:", error);
      alert("Failed to save skin. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {/* 'side="right"' makes it slide in from the right. You can also use 'bottom', 'left', 'top' */}
      <SheetContent
        side="right"
        className="bg-zinc-950 border-l-zinc-800 text-white sm:max-w-md flex flex-col"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-white">
            Add to Portfolio
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Configure details for <strong>{item.market_hash_name}</strong>{" "}
            before saving.
          </SheetDescription>
        </SheetHeader>

        {/* Main content area - flex-grow pushes footer to the bottom */}
        <div className="flex-grow">
          <div className="flex flex-col items-center mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            {item.image ? (
              <img
                src={item.image}
                alt={item.market_hash_name}
                className="h-40 object-contain drop-shadow-md"
              />
            ) : (
              <div className="h-40 w-40 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500">
                No Image
              </div>
            )}
            <p className="mt-4 text-xl font-semibold text-white">
              {item.suggested_price
                ? `$${item.suggested_price.toFixed(2)}`
                : "N/A"}
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-zinc-300 font-medium">
                Quantity Owned
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white h-12 text-lg focus-visible:ring-brand-theme"
                min="1"
              />
            </div>
            {/* You could add a 'buyPrice' input here in the future if you wanted */}
          </div>
        </div>

        <SheetFooter className="mt-auto sm:justify-start">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-brand-theme text-black hover:bg-brand-theme-hover h-12 text-lg font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save to Portfolio
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
