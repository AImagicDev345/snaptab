"use client";

import { QrCode, Users } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { InitialsBadge } from "@/components/ui/InitialsBadge";
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
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 font-black">
            S
          </span>
          <div>
            <div className="text-lg font-bold text-neutral-100">{session.title}</div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Users className="h-3.5 w-3.5" />
              <span>{participants.length} joined</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            track("qr_opened");
            onOpenQr();
          }}
          aria-label="Show QR code"
          className="press flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-200 hover:text-amber-400"
        >
          <QrCode className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2">
        <div className="flex -space-x-2 pl-1">
          {participants.slice(0, 6).map((p) => (
            <InitialsBadge key={p.id} nickname={p.nickname} size="sm" />
          ))}
          {participants.length > 6 ? (
            <span className="ml-2 rounded-full bg-neutral-800 px-2 text-xs text-neutral-300">
              +{participants.length - 6}
            </span>
          ) : null}
        </div>
        <CopyButton value={inviteUrl} label="Invite" />
      </div>
    </header>
  );
}
