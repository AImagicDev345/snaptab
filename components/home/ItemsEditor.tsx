"use client";

import { Trash2, Users } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";

export type ItemDraft = {
  key: string;
  name: string;
  price: string;
  is_shared: boolean;
};

type Props = {
  items: ItemDraft[];
  onChange: (items: ItemDraft[]) => void;
  currencySymbol: string;
};

export function ItemsEditor({ items, onChange, currencySymbol }: Props) {
  const uid = useId();

  function update(index: number, patch: Partial<ItemDraft>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function add() {
    onChange([
      ...items,
      { key: `${uid}-${items.length}-${Date.now()}`, name: "", price: "", is_shared: false },
    ]);
  }

  function remove(index: number) {
    if (items.length === 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.key}
          className="rounded-2xl border border-line bg-surface p-3"
        >
          <div className="grid grid-cols-[1fr_110px_44px] gap-2">
            <Input
              placeholder="Item name"
              value={item.name}
              onChange={(e) => update(index, { name: e.target.value })}
              aria-label={`Item ${index + 1} name`}
              maxLength={60}
            />
            <NumberInput
              placeholder="0.00"
              value={item.price}
              onChange={(e) => update(index, { price: e.target.value })}
              prefix={currencySymbol}
              aria-label={`Item ${index + 1} price`}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={items.length === 1}
              aria-label={`Remove item ${index + 1}`}
              className="press flex items-center justify-center rounded-xl border border-line bg-surface-strong text-fg-muted hover:text-danger disabled:opacity-30"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={item.is_shared}
              onChange={(e) => update(index, { is_shared: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            <Users className="h-4 w-4" />
            Shared by everyone
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="press w-full rounded-2xl border border-dashed border-line-strong py-3 text-sm font-medium text-fg-muted hover:border-accent hover:text-accent"
      >
        + Add item
      </button>
    </div>
  );
}
