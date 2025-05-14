import "Divy"

transaction(name: String) {
    var membershipCollectionRef: &Divy.MembershipCollection?

    prepare(account: auth(SaveValue, BorrowValue, PublishCapability, UnpublishCapability, IssueStorageCapabilityController) &Account) {
        // Initialize the membership collection if it doesn't exist
        self.membershipCollectionRef = account.storage.borrow<&Divy.MembershipCollection>(
            from: Divy.MembershipCollectionStoragePath
        )
        if (self.membershipCollectionRef == nil) {
            account.storage.save(<-Divy.createMembershipCollection(), to: /storage/MembershipCollection)
            self.membershipCollectionRef = account.storage.borrow<&Divy.MembershipCollection>(
                from: /storage/MembershipCollection
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
        // Create the group and get the admin capability
        let adminCap = Divy.createGroup(name: name)
        let adminRef = adminCap.borrow()!

        // Create a membership
        let membership <- adminRef.createMembership()
        membership.grantAdmin(adminCapability: adminCap)

        // Store the membership in the account
        self.membershipCollectionRef!.addMembership(membership: <-membership)
    }
}