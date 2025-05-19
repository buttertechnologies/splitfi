import "SplitFi"

/**
 * Adds an expense to the group.
 */
transaction(
    groupId: UInt64,
    amount: UFix64,
    debtors: [Address],
    description: String,
    timestamp: UFix64,
) {
    var membershipRef: auth(SplitFi.Owner) &SplitFi.Membership?

    prepare(account: auth(SaveValue, BorrowValue, PublishCapability, UnpublishCapability, IssueStorageCapabilityController) &Account) {
        // Get a reference to the membership
        let membershipCollectionRef = account.storage.borrow<auth(SplitFi.Owner) &SplitFi.MembershipCollection>(
            from: SplitFi.MembershipCollectionStoragePath
        ) ?? panic("Membership collection not found")
        self.membershipRef = membershipCollectionRef.borrowOwnerByGroupId(groupId: groupId)
            ?? panic("Membership not found")
    }
    
    execute {
        let allocation <- SplitFi.createRandomDebtAllocation(
            amount: amount,
            debtors: debtors,
        )
        let expense <- SplitFi.createMemberExpense(
            debtAllocation: <-allocation,
            description: description,
            timestamp: timestamp,
        )
        self.membershipRef!.addExpense(
            expense: <-expense,
        )
    }
}