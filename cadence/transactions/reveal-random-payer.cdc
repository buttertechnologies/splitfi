import "SplitFi"

/**
 * Reveals the payer of a random expense.
 */
transaction(
    groupId: UInt64,
    memberAddress: Address,
    expenseUuid: UInt64,
) {
    var membershipCollectionRef: &SplitFi.Membership

    prepare(acct: &Account) {
        // Get a reference to the membership
        let groupRef = SplitFi.borrowGroup(groupId: groupId)
            ?? panic("Group not found")

        self.membershipCollectionRef = groupRef.borrowMembership(address: memberAddress)        
    }
    
    execute {
        (self.membershipCollectionRef.expenses[expenseUuid]!.debtAllocation as! &SplitFi.RandomDebtAllocation).revealPayer()
    }
}