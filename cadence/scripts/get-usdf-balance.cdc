import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"

/**
 * This script retrieves the USDF balance of a given address.
 */
access(all) fun main(address: Address): UFix64 {
    // Get vault data
    let vaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(
        resourceType: nil,
        viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
    )! as! FungibleTokenMetadataViews.FTVaultData

    // Get the USDF balance of the given address
    let usdfVault = getAccount(address)
        .capabilities
        .borrow<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
            vaultData.receiverPath
        )

    return usdfVault?.balance ?? 0.0
}