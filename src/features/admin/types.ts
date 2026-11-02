export type HistoryEntry = {
  from?: string;
  to: string;
  at: Date | string;
  by: string;
  note?: string;
};

type ReviewStep = {
  reviewed?: boolean;
  reviewedAt?: Date | string | null;
  reviewedBy?: string;
  note?: string;
};

export type RequestDoc = {
  _id: { toString(): string };
  referenceCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  preferredChannel?: string;
  assignedTo?: string;
  assignmentHistory?: HistoryEntry[];
  goal: string;
  currentLevel: string;
  concerns?: string[];
  format: string;
  startTime?: string;
  budgetMax?: number | null;
  availabilitySlots?: string[];
  availability: string;
  location?: string;
  notes?: string;
  consentAt: Date | string;
  createdAt: Date | string;
  status?: string;
  statusUpdatedAt?: Date | string | null;
  statusUpdatedBy?: string;
  contactedAt?: Date | string | null;
  statusHistory?: HistoryEntry[];
  internalNote?: string;
  internalNoteUpdatedAt?: Date | string | null;
  internalNoteUpdatedBy?: string;
};

export type TutorDoc = {
  _id: { toString(): string };
  referenceCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  preferredChannel: string;
  otherTeachingArea?: string;
  acceptingStudents?: boolean;
  teachingAreas: string[];
  learnerLevels: string[];
  experience: string;
  experienceNote: string;
  certificates?: string;
  certificateList?: {
    type: string;
    name?: string;
    score?: string;
    year?: number | null;
  }[];
  education?: string;
  school?: string;
  major?: string;
  phoneHasZalo?: boolean;
  headline?: string;
  hasPhoto?: boolean;
  format: string;
  area?: string;
  availabilitySlots: string[];
  expectedFee?: number | null;
  consentAt: Date | string;
  createdAt: Date | string;
  status?: string;
  statusUpdatedAt?: Date | string | null;
  statusUpdatedBy?: string;
  statusHistory?: HistoryEntry[];
  reviews?: {
    identity?: ReviewStep;
    certificates?: ReviewStep;
    experience?: ReviewStep;
  };
  internalNote?: string;
  internalNoteUpdatedAt?: Date | string | null;
  internalNoteUpdatedBy?: string;
};

export type ConnectionDoc = {
  _id: { toString(): string };
  request: { toString(): string };
  tutor: { toString(): string };
  requestCode: string;
  tutorCode: string;
  status?: string;
  statusUpdatedAt: Date | string;
  statusUpdatedBy: string;
  operationsRevision?: number;
  learnerConfirmedAt?: Date | string | null;
  tutorConfirmedAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  feeAmount?: number;
  paymentStatus?: string;
  paidAt?: Date | string | null;
  paymentMethod?: string;
  paymentReference?: string;
  operationsHistory?: HistoryEntry[];
  introducedAt?: Date | string | null;
  startedAt?: Date | string | null;
  createdBy: string;
  createdAt: Date | string;
  history?: HistoryEntry[];
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
  /** 1-based index of the first/last row on this page (0 when empty). */
  first: number;
  last: number;
};

/** One item in the header notification menu (plain values only). */
export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  /** Reference code(s) the item is about. */
  context: string;
  href: string;
  /** ISO time the item happened; also orders and marks items as read. */
  at: string;
};
