export interface GroupSummary {
  uuid: string;
  name: string;
  members: MemberSummary[];
}

export interface MemberSummary {
  uuid: string;
  address: string;
  expenses: ExpenseSummary[];
}

export interface ExpenseSummary {
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
