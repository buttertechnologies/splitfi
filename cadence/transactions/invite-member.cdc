import "Divy"
import "LostAndFound"
import "MetadataViews"
import "FlowToken"
import "FungibleToken"
import "FungibleTokenMetadataViews"

/**
 * Invites a member to a group.
 */
transaction (
    groupId: UInt64,
    recipient: Address,
) {
    let groupAdminRef: auth(Divy.Admin) &Divy.Group
    let vaultRef: auth(FungibleToken.Withdraw) &FlowToken.Vault
    let receiverCap: Capability<&FlowToken.Vault>

    prepare(account: auth(Storage) &Account) {
        // Get an owner reference to the membership
        let membershipRef = account.storage.borrow<auth(Divy.Owner) &Divy.Membership>(
            from: Divy.MembershipCollectionStoragePath
        ) ?? panic("Group not found")

        // Borrow admin reference to the group
        self.groupAdminRef = membershipRef.borrowAdmin()

        // Get the FlowToken vault
        let vaultData = FlowToken.resolveContractView(
            resourceType: nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        )! as! FungibleTokenMetadataViews.FTVaultData
        self.vaultRef = account.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: vaultData.storagePath)
            ?? panic("Vault not found")
        self.receiverCap = account.capabilities.get<&FlowToken.Vault>(vaultData.receiverPath)
    }

    execute {
        // Get the group from the contract
        let membership <- self.groupAdminRef.createMembership()
    
        let foo = LostAndFound.deposit(
            redeemer: recipient,
            item: <-membership,
            memo: "Invite to Divy group \(self.groupAdminRef.name)",
            display: MetadataViews.Display(
                name: "Invite",
                description: "Invite to Divy group \(self.groupAdminRef.name)",
                thumbnail: MetadataViews.URI(
                    baseURI: nil,
                    value: "https://placecats.com/300/300",
                )
            ),
            storagePayment: self.vaultRef,
            flowTokenRepayment: self.receiverCap,
        )
    }
}