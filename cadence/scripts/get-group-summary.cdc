import "Divy"

access(all) struct MemberExpenseDto {
    access(all) let name: String
    access(all) let amount: UFix64
    access(all) let date: UFix64

    init(expense: &Divy.MemberExpense) {
        self.name = expense.description
        self.amount = expense.amount
        self.date = expense.timestamp
    }
}

access(all) struct MembershipDto {
    access(all) let uuid: UInt64
    access(all) let expenses: [MemberExpenseDto]

    init(memberRef: &Divy.Membership) {
        self.uuid = memberRef.uuid
        
        let expenses: [MemberExpenseDto] = []
        for expenseUuid in memberRef.expenses.keys {
            let expenseDto = MemberExpenseDto(expense: memberRef.expenses[expenseUuid]!)
            expenses.append(expenseDto)
        }
        self.expenses = expenses
    }
}

access(all) struct GroupSummaryDto {
    access(all) let name: String
    access(all) let uuid: UInt64
    access(all) let members: [MembershipDto]

    init(groupRef: &Divy.Group) {
        self.name = groupRef.name
        self.uuid = groupRef.uuid

        let members: [MembershipDto] = []
        for memberUuid in groupRef.members.keys {
            let memberRef = groupRef.members[memberUuid]!.borrow()
            if memberRef == nil {
                continue
            }
            let memberDto = MembershipDto(memberRef: memberRef!)
            members.append(memberDto)
        }

        self.members = members
    }
}

/**
 * Returns all of the unsorted expenses incurred by members of a group.
 */
access(all) fun getGroupInfo(groupId: UInt64): GroupSummaryDto {
    // Get the group from the contract
    let groupRef = Divy.borrowGroup(groupId: groupId)
        ?? panic("Group not found")

    // Return the group summary
    return GroupSummaryDto(groupRef: groupRef)
}