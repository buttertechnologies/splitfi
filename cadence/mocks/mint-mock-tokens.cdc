import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"

transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        let vault <- EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.createEmptyVault(vaultType: Type<@EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>())
        vault.deposit(from: <- EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.mintTokens(amount: 10000.0))
        
        let ftVaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(resourceType: 
            nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        )! as! FungibleTokenMetadataViews.FTVaultData
        acct.storage.save(
            <-vault,
            to: ftVaultData.storagePath
        )

        acct.capabilities.publish(
            acct.capabilities.storage.issue<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
                ftVaultData.storagePath,
            ),
            at: ftVaultData.receiverPath,
        )
    }
}