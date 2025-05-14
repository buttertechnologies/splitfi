import "Divy"

/**
 * Invites a member to a group.
 */
transaction (
    groupId: UInt64,
    recipient: Address,
) {
    let groupAdminRef: auth(Divy.Admin) &Divy.Group

    prepare(account: auth(Storage) &Account) {
        // Get an owner reference to the membership
        let membershipRef = account.storage.borrow<auth(Divy.Owner) &Divy.Membership>(
            from: Divy.MembershipCollectionStoragePath
        ) ?? panic("Group not found")

        // Borrow admin reference to the group
        self.groupAdminRef = membershipRef.borrowAdmin()
    }

    execute {
        self.groupAdminRef.inviteMember(address: recipient)
    }
}