"use client";

import { QrCode, Users } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { InitialsBadge } from "@/components/ui/InitialsBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { track } from "@/lib/analytics";
import type { Participant, Session } from "@/types";

type Props = {
  session: Session;
  participants: Participant[];
  inviteUrl: string;
  onOpenQr: () => void;
};

export function RoomHeader({ session, participants, inviteUrl, onOpenQr }: Props) {
  return (
    <header className="space-y-3 pb-1 safe-pt">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg font-black lg:h-10 lg:w-10">
            S
          </span>
          <div>
            <div className="text-lg font-bold text-fg lg:text-xl">{session.title}</div>
            <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <Users className="h-3.5 w-3.5" />
              <span>{participants.length} joined</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              track("qr_opened");
              onOpenQr();
            }}
            aria-label="Show QR code"
            className="press flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-fg hover:text-accent"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-2">
        <div className="flex -space-x-2 pl-1">
          {participants.slice(0, 6).map((p) => (
            <InitialsBadge key={p.id} nickname={p.nickname} size="sm" />
          ))}
          {participants.length > 6 ? (
            <span className="ml-2 rounded-full bg-surface-strong px-2 text-xs text-fg-muted">
              +{participants.length - 6}
            </span>
          ) : null}
        </div>
        <CopyButton value={inviteUrl} label="Invite" />
      </div>
    </header>
  );
}
