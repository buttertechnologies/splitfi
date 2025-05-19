export interface GroupSummary {
  uuid: string;
  name: string;
  members: MemberSummary[];
}

export interface MemberSummary {
  uuid: string;
  address: string;
  expenses: ExpenseSummary[];
  payments: PaymentInfo[];
}

export interface ExpenseSummary {
  uuid: string;
  description: string;
  amount: string;
  timestamp: string;
  debtors: { [address: string]: string };
}

export interface InvitationList {
  invitations: Invitation[];
}

export interface Invitation {
  uuid: string;
  group: GroupSummary;
}

export interface PaymentInfo {
  timestamp: string;
  recipients: { [address: string]: string };
}
