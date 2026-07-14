"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onJoin: (nickname: string) => Promise<void> | void;
  submitting: boolean;
};

export function JoinTableModal({ open, onJoin, submitting }: Props) {
  const [nickname, setNickname] = useState("");
  return (
    <Modal open={open} onClose={() => {}} title="Join this bill" hideClose>
      <p className="mb-4 text-sm text-fg-muted">
        Pick a nickname so everyone knows which items are yours. No account needed.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!nickname.trim() || submitting) return;
          void onJoin(nickname.trim());
        }}
        className="space-y-3"
      >
        <Input
          autoFocus
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength={24}
          placeholder="e.g. Sam"
          aria-label="Your nickname"
        />
        <Button type="submit" disabled={!nickname.trim() || submitting} fullWidth>
          {submitting ? "Joining..." : "Join"}
        </Button>
      </form>
    </Modal>
  );
}
