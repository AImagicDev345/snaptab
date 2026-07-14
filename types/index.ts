// SnapTab shared types. Kept in one file so client + server + tests stay in sync.

export type PaymentHandles = {
  venmo?: string;
  cashapp?: string;
  upi?: string;
  paypal?: string;
};

export type SessionStatus = "active" | "closed";

export type Session = {
  id: string;
  title: string;
  total_tax: number;
  total_tip: number;
  total_delivery_fee: number;
  currency_code: string;
  status: SessionStatus;
  host_participant_id: string | null;
  payment_handles: PaymentHandles;
  created_at: string;
};

export type Item = {
  id: string;
  session_id: string;
  name: string;
  price: number;
  is_shared: boolean;
  created_at?: string;
};

export type Participant = {
  id: string;
  session_id: string;
  nickname: string;
  paid_at: string | null;
  created_at: string;
};

export type ItemClaim = {
  id: string;
  item_id: string;
  participant_id: string;
  session_id: string;
  created_at?: string;
};

export type ParticipantShare = {
  participantId: string;
  subtotal: number;
  feeShare: number;
  total: number;
  residualCents: number;
};

// Input types used by the homepage form and the createSession action.
export type NewItemInput = {
  name: string;
  price: number;
  is_shared: boolean;
};

export type CreateSessionInput = {
  title: string;
  tax: number;
  tip: number;
  deliveryFee: number;
  currencyCode: string;
  hostNickname: string;
  paymentHandles: PaymentHandles;
  items: NewItemInput[];
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
