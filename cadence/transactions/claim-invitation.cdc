import "Divy"

/**
 * Claim an invitation to a group.
 */
transaction (
    groupId: UInt64,
) {
    let membershipCollectionRef: auth(Divy.Owner) &Divy.MembershipCollection

    prepare(account: auth(Storage) &Account) {
        // Get an owner reference to the membership collection
        self.membershipCollectionRef = account.storage.borrow<auth(Divy.Owner) &Divy.MembershipCollection>(
            from: Divy.MembershipCollectionStoragePath
        ) ?? panic("Group not found")
    }

    execute {
        self.membershipCollectionRef.claimInvitation(groupId: groupId)
    }
}