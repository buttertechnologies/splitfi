import "SplitFi"
import "FungibleToken"
import "FungibleTokenMetadataViews"
import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"

/**
 * Make a payment to a member's debt.
 */
transaction(groupId: UInt64, maxAmount: UFix64) {
    let memberRef: auth(SplitFi.Owner) &SplitFi.Membership
    let vaultRef: auth(FungibleToken.Withdraw) &EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault
    let address: Address

    prepare(acct: auth(Storage) &Account) {
        let membershipCollection = acct.storage.borrow<auth(SplitFi.Owner) &SplitFi.MembershipCollection>(from: SplitFi.MembershipCollectionStoragePath)
            ?? panic("Membership collection not found")

        self.memberRef = membershipCollection.borrowOwnerByGroupId(groupId: groupId)
            ?? panic("Membership not found")

        let vaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(
            resourceType: nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        )! as! FungibleTokenMetadataViews.FTVaultData

        self.vaultRef = acct.storage.borrow<auth(FungibleToken.Withdraw) &EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
            from: vaultData.storagePath
        ) ?? panic("Vault not found")

        // Get the address of the member to whom the payment is being made  
        self.address = acct.address
    }

    execute {
        self.memberRef.makePayment(vaultRef: self.vaultRef, maxAmount: maxAmount)
    }
}