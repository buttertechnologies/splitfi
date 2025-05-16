import "NonFungibleToken"
import "MetadataViews"
import "ViewResolver"
import "FungibleToken"
import "FungibleTokenMetadataViews"
import "FlowToken"

access(all) contract EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed: FungibleToken {
    /// Name of the fungible token defined in the corresponding ERC20 contract
    access(all) let name: String
    access(all) var totalSupply: UFix64

    /// The Vault resource representing the bridged ERC20 token
    ///
    access(all) resource Vault : FungibleToken.Vault {
        /// Balance of the tokens in a given Vault
        access(all) var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(all) view fun getViews(): [Type] {
            return EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.getContractViews(resourceType: nil)
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(resourceType: nil, viewType: view)
        }

        /// Asks if the amount can be withdrawn from this vault
        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return amount <= self.balance
        }

        /// deposit
        ///
        /// Function that takes a Vault object as an argument and adds
        /// its balance to the balance of the owners Vault.
        ///
        /// It is allowed to destroy the sent Vault because the Vault
        /// was a temporary holder of the tokens. The Vault's balance has
        /// been consumed and therefore can be destroyed.
        ///
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @Vault
            self.balance = self.balance + vault.balance
            vault.balance = 0.0
            destroy vault
        }

        /// createEmptyVault
        ///
        /// Function that creates a new Vault with a balance of zero
        /// and returns it to the calling context. A user must call this function
        /// and store the returned Vault in their storage in order to allow their
        /// account to be able to receive deposits of this token type.
        ///
        access(all) fun createEmptyVault(): @Vault {
            return <-create Vault(balance: 0.0)
        }

        /// withdraw
        ///
        /// Function that takes an amount as an argument
        /// and withdraws that amount from the Vault.
        ///
        /// It creates a new temporary Vault that is used to hold
        /// the tokens that are being transferred. It returns the newly
        /// created Vault to the context that called so it can be deposited
        /// elsewhere.
        ///
        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @Vault {
            self.balance = self.balance - amount
            return <-create Vault(balance: amount)
        }

        /// Called when a fungible token is burned via the `Burner.burn()` method
        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.totalSupply = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.totalSupply - self.balance
            }
            self.balance = 0.0
        }
    }

    /// createEmptyVault
    ///
    /// Function that creates a new Vault with a balance of zero and returns it to the calling context. A user must call
    /// this function and store the returned Vault in their storage in order to allow their account to be able to
    /// receive deposits of this token type.
    ///
    access(all) fun createEmptyVault(vaultType: Type): @EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault {
        return <- create Vault(balance: 0.0)
    }

    /**********************
            Getters
    ***********************/

    /// Returns the name of the asset
    ///
    access(all) view fun getName(): String {
        return self.name
    }

    /// Function that returns all the Metadata Views implemented by this fungible token contract.
    ///
    /// @return An array of Types defining the implemented views. This value will be used by developers to know which
    ///         parameter to pass to the resolveContractView() method.
    ///
    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<FungibleTokenMetadataViews.FTDisplay>()
        ]
    }

    /// Function that resolves a metadata view for this contract.
    ///
    /// @param view: The Type of the desired view.
    ///
    /// @return A structure representing the requested view.
    ///
    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<FungibleTokenMetadataViews.FTVaultData>():
                return FungibleTokenMetadataViews.FTVaultData(
                    storagePath: /storage/EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabedVault,
                    receiverPath: /public/EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabedReceiver,
                    metadataPath: /public/EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabedVault,
                    receiverLinkedType: Type<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(),
                    metadataLinkedType: Type<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(),
                    createEmptyVaultFunction: (fun(): @{FungibleToken.Vault} {
                        return <-self.createEmptyVault(vaultType: Type<@EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>())
                    })
                )
        }
        return nil
    }

    /**********************
        Internal Methods
    ***********************/

    /// Allows the bridge to mint tokens from bridge-defined fungible token contracts
    ///
    access(all) fun mintTokens(amount: UFix64): @{FungibleToken.Vault} {
        self.totalSupply = self.totalSupply + amount
        return <- create Vault(balance: amount)
    }

    init() {
        self.name = "Mock USDF"
        self.totalSupply = 0.0
    }
}
