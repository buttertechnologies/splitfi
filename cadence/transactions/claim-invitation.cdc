import "Divy"
import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"
import "FungibleToken"

/**
 * Claim an invitation to a group.
 */
transaction (
    groupId: UInt64,
) {
    var membershipCollectionRef: auth(Divy.Owner) &Divy.MembershipCollection?

    prepare(account: auth(Storage, Capabilities) &Account) {        
        // Setup USDF
        let ftVaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(resourceType: 
            nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        )! as! FungibleTokenMetadataViews.FTVaultData
        var usdfVaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
            from: ftVaultData.storagePath
        )
        if (usdfVaultRef == nil) {
            account.storage.save(
                <-EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.createEmptyVault(vaultType: Type<@EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>()),
                to: ftVaultData.storagePath
            )

            account.capabilities.publish(
                account.capabilities.storage.issue<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
                    ftVaultData.storagePath,
                ),
                at: ftVaultData.receiverPath,
            )
        }
        
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