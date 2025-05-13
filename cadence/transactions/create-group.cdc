import "Divy"

transaction(name: String) {
    prepare(account: auth(Storage) &Account) {
        // Create the group and get the admin capability
        let adminCap = Divy.createGroup(name: name)
        let adminRef = adminCap.borrow()!

        // Create a membership
        let membership <- adminRef.createMembership()
        membership.grantAdmin(adminCapability: adminCap)

        // Store the membership in the account
        var membershipCollectionRef = account.storage.borrow<&Divy.MembershipCollection>(
            from: /storage/MembershipCollection
        )
        if (membershipCollectionRef == nil) {
            account.storage.save(<-Divy.createMembershipCollection(), to: /storage/MembershipCollection)
            membershipCollectionRef = account.storage.borrow<&Divy.MembershipCollection>(
                from: /storage/MembershipCollection
            )
        }
        membershipCollectionRef!.addMembership(membership: <-membership)
    }

    execute {}
}