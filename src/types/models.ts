export interface GroupSummary {
    uuid: string;
    name: string;
    members: MemberSummary[];
}

export interface MemberSummary {
    uuid: string;
    name: string;
    expenses: Expense[];
}

export interface Expense {
    description: string;
    amount: number;
    timestamp: number;
}