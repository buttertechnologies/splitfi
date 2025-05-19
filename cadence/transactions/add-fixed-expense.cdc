import "Divy"

/**
 * Adds an expense to the group.
 */
transaction(
    groupId: UInt64,
    amount: UFix64,
    debtors: {Address: UFix64},
    description: String,
    timestamp: UFix64,
) {
    var membershipRef: auth(Divy.Owner) &Divy.Membership?

    prepare(account: auth(SaveValue, BorrowValue, PublishCapability, UnpublishCapability, IssueStorageCapabilityController) &Account) {
        // Get a reference to the membership
        let membershipCollectionRef = account.storage.borrow<auth(Divy.Owner) &Divy.MembershipCollection>(
            from: Divy.MembershipCollectionStoragePath
        ) ?? panic("Membership collection not found")
        self.membershipRef = membershipCollectionRef.borrowOwnerByGroupId(groupId: groupId)
            ?? panic("Membership not found")
    }
    
    execute {
        let allocation <- Divy.createFixedDebtAllocation(
            amount: amount,
            debtors: debtors,
        )
        let expense <- Divy.createMemberExpense(
            debtAllocation: <-allocation,
            description: description,
            timestamp: timestamp,
        )
        self.membershipRef!.addExpense(
            expense: <-expense,
        )
    }
}