import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"

transaction {
    let vaultRef: &EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault

    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Setup USDF Vault
        let ftVaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(resourceType: 
            nil,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        )! as! FungibleTokenMetadataViews.FTVaultData
        let hasUsdfVault = acct.storage.check<@EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
            from: ftVaultData.storagePath
        )
        if (!hasUsdfVault) {
            acct.storage.save(
                <-EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.createEmptyVault(vaultType: Type<@EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>()),
                to: ftVaultData.storagePath
            )
        }

        // Setup USDF Receiver
        let hasUsdfReceiver = acct.capabilities.get<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(ftVaultData.receiverPath).check()
        if (!hasUsdfReceiver) {
            acct.capabilities.publish(
                acct.capabilities.storage.issue<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
                    ftVaultData.storagePath,
                ),
                at: ftVaultData.receiverPath,
            )
        }

        // Borrow a reference to the USDF Vault
        self.vaultRef = acct.storage.borrow<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(
            from: ftVaultData.storagePath
        )!
    }

    execute {
        // Mint tokens and send to USDF Vault
        self.vaultRef.deposit(from: <- EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.mintTokens(amount: 10000.0))
    }
}