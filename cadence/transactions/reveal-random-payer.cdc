import "Divy"

/**
 * Reveals the payer of a random expense.
 */
transaction(
    groupId: UInt64,
    memberAddress: Address,
    expenseUuid: UInt64,
) {
    var membershipCollectionRef: &Divy.Membership

    prepare(acct: &Account) {
        // Get a reference to the membership
        let groupRef = Divy.borrowGroup(groupId: groupId)
            ?? panic("Group not found")

        self.membershipCollectionRef = groupRef.borrowMembership(address: memberAddress)        
    }
    
    execute {
        (self.membershipCollectionRef.expenses[expenseUuid]!.debtAllocation as! &Divy.RandomDebtAllocation).revealPayer()
    }
}