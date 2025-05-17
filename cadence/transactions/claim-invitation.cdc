import "Divy"

/**
 * Claim an invitation to a group.
 */
transaction (
    groupId: UInt64,
) {
    var membershipCollectionRef: auth(Divy.Owner) &Divy.MembershipCollection?

    prepare(account: auth(SaveValue, BorrowValue, PublishCapability, UnpublishCapability, IssueStorageCapabilityController) &Account) {
        // Initialize the membership collection if it doesn't exist
        self.membershipCollectionRef = account.storage.borrow<auth(Divy.Owner)&Divy.MembershipCollection>(
            from: Divy.MembershipCollectionStoragePath
        )
        if (self.membershipCollectionRef == nil) {
            account.storage.save(<-Divy.createMembershipCollection(), to: Divy.MembershipCollectionStoragePath)
            self.membershipCollectionRef = account.storage.borrow<auth(Divy.Owner)&Divy.MembershipCollection>(
                from: Divy.MembershipCollectionStoragePath
            )
        }

        // Publish the membership collection if it doesn't exist
        let pubCap = account.capabilities.get<auth(Divy.Owner) &Divy.MembershipCollection>(
            Divy.MembershipCollectionPublicPath
        )
        if (pubCap.check() == false) {
            account.capabilities.unpublish(Divy.MembershipCollectionPublicPath)
            account.capabilities.publish(
                account.capabilities.storage.issue<&Divy.MembershipCollection>(
                    Divy.MembershipCollectionStoragePath,
                ),
                at: Divy.MembershipCollectionPublicPath,
            )
        }
    }

    execute {
        self.membershipCollectionRef!.claimInvitation(groupId: groupId)
    }
}