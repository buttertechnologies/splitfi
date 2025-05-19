import "SplitFi"

/**
 * Create an anonymous invitation to a group to invite a member out-of-band.
 */
transaction(
    groupId: UInt64,
    publicKey: String,
    signatureAlgorithm: UInt8,
    hashAlgorithm: UInt8,
) {
    let groupAdminRef: auth(SplitFi.Admin) &SplitFi.Group

    prepare(account: auth(Storage) &Account) {
        // Get an owner reference to the membership
        let membershipCollectionRef = account.storage.borrow<auth(SplitFi.Owner) &SplitFi.MembershipCollection>(
            from: SplitFi.MembershipCollectionStoragePath
        ) ?? panic("Membership collection not found")

        // Borrow admin reference to the group
        let membershipOwnerRef = membershipCollectionRef.borrowOwnerByGroupId(groupId: groupId)
            ?? panic("Group not found")

        // Get the group admin reference
        self.groupAdminRef = membershipOwnerRef.borrowAdmin()
    }

    execute {
        // Create the anonymous invitation
        self.groupAdminRef.createAnonymousInvitation(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm(rawValue: signatureAlgorithm)!,
            hashAlgorithm: HashAlgorithm(rawValue: hashAlgorithm)!
        )
    }
}