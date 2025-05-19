import "SplitFi"

/**
 * Claim an anomyous invitation to a group.
 */
transaction(
    groupId: UInt64,
    publicKey: String,
    signatureAlgorithm: UInt8,
    hashAlgorithm: UInt8,
    signature: String,
) {
    let membershipCollectionRef: auth(SplitFi.Owner) &SplitFi.MembershipCollection

    prepare(account: auth(Storage) &Account) {
        // Get an owner reference to the membership
        self.membershipCollectionRef = account.storage.borrow<auth(SplitFi.Owner) &SplitFi.MembershipCollection>(
            from: SplitFi.MembershipCollectionStoragePath
        ) ?? panic("Membership collection not found")
    }

    execute {
        // Claim the anonymous invitation
        self.membershipCollectionRef.claimAnonymousInvitation(
            groupId: groupId,
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm(rawValue: signatureAlgorithm)!,
            hashAlgorithm: HashAlgorithm(rawValue: hashAlgorithm)!,
            signature: signature.decodeHex()
        )
    }
}