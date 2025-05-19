import "SplitFi"
import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"
import "FungibleToken"

/**
 * Creates a new group and stores the membership in the account's storage.
 */
transaction(name: String, invitees: [Address]) {
    var membershipCollectionRef: &SplitFi.MembershipCollection?

    prepare(account: auth(SaveValue, BorrowValue, PublishCapability, UnpublishCapability, IssueStorageCapabilityController) &Account) {
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
        self.membershipCollectionRef = account.storage.borrow<&SplitFi.MembershipCollection>(
            from: SplitFi.MembershipCollectionStoragePath
        )
        if (self.membershipCollectionRef == nil) {
            account.storage.save(<-SplitFi.createMembershipCollection(), to: SplitFi.MembershipCollectionStoragePath)
            self.membershipCollectionRef = account.storage.borrow<&SplitFi.MembershipCollection>(
                from: SplitFi.MembershipCollectionStoragePath
            )
        }

        // Publish the membership collection if it doesn't exist
        let pubCap = account.capabilities.get<auth(SplitFi.Owner) &SplitFi.MembershipCollection>(
            SplitFi.MembershipCollectionPublicPath
        )
        if (pubCap.check() == false) {
            account.capabilities.unpublish(SplitFi.MembershipCollectionPublicPath)
            account.capabilities.publish(
                account.capabilities.storage.issue<&SplitFi.MembershipCollection>(
                    SplitFi.MembershipCollectionStoragePath,
                ),
                at: SplitFi.MembershipCollectionPublicPath,
            )
        }
    }

    execute {
        // Create the group and get the admin capability
        let adminCap = SplitFi.createGroup(name: name)
        let adminRef = adminCap.borrow()!

        // Create a membership
        let membership <- adminRef.createMembership()
        membership.grantAdmin(adminCapability: adminCap)

        // Store the membership in the account
        self.membershipCollectionRef!.addMembership(membership: <-membership)

        // Invite the members
        for invitee in invitees {
            adminRef.inviteMember(address: invitee)
        }
    }
}