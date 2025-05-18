import "Crypto"
import "EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed"
import "FungibleTokenMetadataViews"
import "FungibleToken"
access(all)
contract Divy {
    access(all) let groups: {UInt64: Bool}
    access(all) let invitations: @{Address: {UInt64: Invitation}}

    access(all) let MembershipCollectionPublicPath: PublicPath
    access(all) let MembershipCollectionStoragePath: StoragePath

    access(all) entitlement Owner

    access(all) entitlement Admin
    access(all) entitlement Member
    access(all) entitlement Invitee

    access(all) event GroupCreated(
        groupUuid: UInt64,
        name: String,
    )

    init() {
        self.MembershipCollectionPublicPath = /public/divyMembershipCollection
        self.MembershipCollectionStoragePath = /storage/divyMembershipCollection

        self.groups = {}
        self.invitations <- {}
    }

    /**
     * The `Invitation` resource is used to represent an invitation to a group.
     */
    access(all) resource Invitation {
        access(contract) let cap: Capability<auth(Invitee) &Group>

        init(cap: Capability<auth(Invitee) &Group>) {
            self.cap = cap
        }

        access(all) view fun getGroupId(): UInt64 {
            return (self.cap.borrow() ?? panic("Invite invalid")).uuid
        }

        access(all) fun isValid(): Bool {
            return self.cap.check()
        }
    }

    /**
     * Represents an anonymous invitation to a group allowing a user to submit invitations
     * out of band. (i.e. QR code, email, AirDrop, etc.)
     */
    access(all) resource AnonymousInvitation {
        access(contract) let cap: Capability<auth(Invitee) &Group>
        access(all) let publicKey: [UInt8]
        access(all) let signatureAlgorithm: UInt8
        access(all) let hashAlgorithm: UInt8

        init(
            cap: Capability<auth(Invitee) &Group>,
            publicKey: [UInt8],
            signatureAlgorithm: SignatureAlgorithm,
            hashAlgorithm: HashAlgorithm,
        ) {
            self.cap = cap
            self.publicKey = publicKey
            self.signatureAlgorithm = signatureAlgorithm.rawValue
            self.hashAlgorithm = hashAlgorithm.rawValue
        }

        access(all) view fun verify(signature: [UInt8], address: Address): Bool {
            let key = PublicKey(
                publicKey: self.publicKey,
                signatureAlgorithm: SignatureAlgorithm(self.signatureAlgorithm)!,
            )
            return key.verify(
                signature: signature,
                signedData: self.getChallenge(address: address),
                domainSeparationTag: "DivyClaimMembership",
                hashAlgorithm: HashAlgorithm(self.hashAlgorithm)!,
            )
        }

        access(all) view fun getChallenge(address: Address): [UInt8] {
            let message: [UInt8] = address.toBytes()
            return message
        }
    }

    access(contract) fun inviteMember(groupId: UInt64, address: Address) {
        pre {
            self.invitations[address] == nil: "Address already invited"
        }

        var _userInvites = (&self.invitations[address] as auth(Mutate, Insert) &{UInt64: Invitation}?)
        if _userInvites == nil {
            self.invitations[address] <-! {}
            _userInvites = (&self.invitations[address] as auth(Mutate, Insert) &{UInt64: Invitation}?)
        }

        // Workaround for Cadence bug, can be removed when it's possible to do this in one expression without a "loss of resource" error
        let userInvites = _userInvites!
        if userInvites[groupId] != nil {
            panic("User already invited to this group")
        }

        let cap = self.account.capabilities.storage.issue<auth(Invitee) &Group>(
            self.deriveGroupStoragePath(groupId: groupId)
        )

        userInvites[groupId] <-! create Invitation(cap: cap)
    }

    /**
     * The `MembershipReference` resource is used to reference a membership in a user's account.
     * It contains a capability to the `MembershipCollection` resource and a UUID for the membership.
     */
    access(all) struct MembershipPtr {
        access(all) let collectionCapability: Capability<&MembershipCollection>
        access(all) let membershipUuid: UInt64

        init(collectionCapability: Capability<&MembershipCollection>, membershipUuid: UInt64) {
            self.collectionCapability = collectionCapability
            self.membershipUuid = membershipUuid
        }

        access(all) fun borrow(): &Membership? {
            return self.collectionCapability.borrow()?.borrow(uuid: self.membershipUuid)
        }
    }

    /**
     * The `Group` resource is used to represent a group of members for a Divy instance.
     */
    access(all) resource Group {
        access(all) let name: String
        access(all) let members: {Address: MembershipPtr}
        // Index of invitation UUID -> address used to map all outstanding invitations
        access(all) let invitationsIndex: {UInt64: Address}
        // Map of pkey -> anonymous invitation
        access(all) let anonymousInvitations: @{String: AnonymousInvitation}

        init(name: String) {
            self.name = name
            self.members = {}
            self.invitationsIndex = {}
            self.anonymousInvitations <- {}
        }

        access(all) fun totalExpenses(): UFix64 {
            var total: UFix64 = 0.0
            for member in self.members.values {
                let memberRef = member.borrow()
                    ?? panic("Member not found for address ".concat(member.collectionCapability.address.toString()))
                for expense in memberRef.expenses {
                    total = total + expense.amount
                }
            }
            return total
        }

        /**
         * Get the current balance owed to the group by a member (or negative if they are owed money).
         */
        access(all) fun getMemberBalance(address: Address): Fix64 {
            let member = self.members[address]!.borrow()
                ?? panic("Member not found for address ".concat(address.toString()))
            
            return Fix64(member.getTotalPaid()) - self.getPrincipalOwing(address: address)
        }

        /**
         * Get the total amount owed by a member before any payments are made.
         */
        access(all) fun getPrincipalOwing(address: Address): Fix64 {            
            var totalOwing = Fix64(0.0)
            for member in self.members.values {
                let memberRef = member.borrow()
                    ?? panic("Member not found for address ".concat(member.collectionCapability.address.toString()))
                if memberRef.owner!.address == address {
                    continue
                }
                for expense in memberRef.expenses {
                    for debtor in expense.debtAllocation.getDebtors() {
                        if debtor == address {
                            totalOwing = totalOwing + Fix64(expense.debtAllocation.shareOf(member: debtor))
                        }
                    }
                }
            }

            return totalOwing
        }

        access(Admin | Invitee) fun createMembership(): @Membership {
            let adminCap = Divy.issueMemberCapability(groupId: self.uuid)
            return <- create Membership(
                memberCapability: adminCap
            )
        }

        access(Admin) fun inviteMember(address: Address) {
            pre {
                self.members[address] == nil: "Member already exists"
            }
            Divy.inviteMember(groupId: self.uuid, address: address)
            self.invitationsIndex[self.uuid] = address
        }

        /**
         * Create an anonymous invitation to the group.
         */
        access(all) fun createAnonymousInvitation(
            publicKey: [UInt8],
            signatureAlgorithm: SignatureAlgorithm,
            hashAlgorithm: HashAlgorithm,
        ) {
            let cap = Divy.account.capabilities.storage.issue<auth(Invitee) &Group>(
                Divy.deriveGroupStoragePath(groupId: self.uuid)
            )
            let anonymousInvitation <- create AnonymousInvitation(
                cap: cap,
                publicKey: publicKey,
                signatureAlgorithm: signatureAlgorithm,
                hashAlgorithm: hashAlgorithm
            )

            // Store the anonymous invitation in the group
            let key = String.encodeHex(publicKey).concat("_").concat(signatureAlgorithm.rawValue.toString()).concat("_").concat(hashAlgorithm.rawValue.toString())
            self.anonymousInvitations[key] <-! anonymousInvitation
        }

        access(Member) fun hydrateMember(address: Address, uuid: UInt64?) {
            // ---------- 1. Resolve the capability on the target account ----------
            let collectionCap = getAccount(address)
                .capabilities
                .get<&MembershipCollection>(Divy.MembershipCollectionPublicPath)

            // If the account does not expose a membership collection there is nothing to hydrate.
            if !collectionCap.check() {
                assert(
                    uuid == nil,
                    message: "UUID was provided but the target account does not expose a MembershipCollection"
                )
                self.members.remove(key: address)
                return
            }

            // ---------- 2. Work out which UUID to hydrate ----------
            // Use the explicitly‑passed `uuid` when provided, otherwise fall back to the cached one (if any).
            let targetUuid: UInt64? = uuid ?? self.members[address]?.membershipUuid
            if targetUuid == nil {
                // No hint was supplied and there is no cached value – nothing to do.
                return
            }

            // ---------- 3. Borrow the collection and ensure the NFT still exists ----------
            let collection = collectionCap.borrow()
                ?? panic("Unable to borrow MembershipCollection for ".concat(address.toString()))

            // If the NFT is gone (transferred / burned), discard the cached entry.
            if !collection.memberships.containsKey(targetUuid!) {
                self.members.remove(key: address)
                return
            }

            // ---------- 4. Cache (or refresh) the MembershipReference ----------
            let membershipRef = MembershipPtr(
                collectionCapability: collectionCap,
                membershipUuid: targetUuid!
            )

            self.members[address] = membershipRef
        }

        /**
         * Borrow the membership reference for a given address.
         */
        access(all) fun borrowMembership(address: Address): &Membership {
            let membershipPtr = (&self.members[address] as &MembershipPtr?)!
            return membershipPtr.borrow()
                ?? panic("Membership not found for address ".concat(address.toString()))
        }

        /**
         * Verify and destroy an anonymous invitation.
         */
        access(contract) fun claimAnonymousInvitation(
            signature: [UInt8],
            publicKey: [UInt8],
            signatureAlgorithm: SignatureAlgorithm,
            hashAlgorithm: HashAlgorithm,
        ): Capability<auth(Invitee) &Group> {
            let key = String.encodeHex(publicKey).concat("_").concat(signatureAlgorithm.rawValue.toString()).concat("_").concat(hashAlgorithm.rawValue.toString())
            assert(
                (&self.anonymousInvitations[key] as &AnonymousInvitation?)!.verify(
                    signature: signature,
                    address: self.owner!.address
                ),
                message: "Anonymous invitation verification failed"
            )
            let invitation <- self.anonymousInvitations.remove(key: key)!
            let cap = invitation.cap
            destroy <- invitation

            return cap
        }
    }
    
    /**
     * The `DebtAllocation` interface is used to represent the allocation of debt for a given expense.
     * It contains the amount of the expense and a list of members who are responsible for it.
     */
    access(all) struct interface DebtAllocation {
        /**
         * Return the share of the expense for a given member.
         */
        access(all) fun shareOf(member: Address): UFix64
        /**
         * Return the list of participants in the expense.
         */
        access(all) fun getDebtors(): &[Address]
        /**
         * Return the total amount of the expense including the share of the owner.
         */
        access(all) fun total(): UFix64
    }

    /**
     * The `FixedDebtAllocation` resource is used to represent a fixed allocation of debt for a given expense.
     * It contains the amount of the expense and a list of members who are responsible for it.
     */
    access(all) struct FixedDebtAllocation: DebtAllocation {
        access(all) let amount: UFix64
        access(all) let debtors: {Address: UFix64}

        init(amount: UFix64, debtors: {Address: UFix64}) {
            self.amount = amount
            self.debtors = debtors
        }

        access(all) fun shareOf(member: Address): UFix64 {
            return self.debtors[member]!
        }

        access(all) fun getDebtors(): &[Address] {
            return &self.debtors.keys
        }

        access(all) fun total(): UFix64 {
            return self.amount
        }
    }

    /**
     * The `PercentageDebtAllocation` resource is used to represent a percentage allocation of debt for a given expense.
     */
    access(all) struct PercentageDebtAllocation: DebtAllocation {
        access(all) let amount: UFix64
        access(all) let debtors: {Address: UFix64}

        init(amount: UFix64, debtors: {Address: UFix64}) {
            self.amount = amount
            self.debtors = debtors
        }

        access(all) fun shareOf(member: Address): UFix64 {
            return self.debtors[member]! * self.amount
        }

        access(all) fun getDebtors(): &[Address] {
            return &self.debtors.keys
        }

        access(all) fun total(): UFix64 {
            return self.amount
        }
    }

    /**
     * The `MemberExpense` resource is used to represent incurred by a member of a group.
     */
    access(all) struct MemberExpense {
        // The amount of the expense in USD
        access(all) var amount: UFix64
        // Description of the expense
        access(all) var description: String
        // Timestamp of when expense was incurred in seconds since the epoch (UTC)
        access(all) var timestamp: UFix64
        // Map of debtors to the fraction of the expense they owe
        access(all) var debtAllocation: {DebtAllocation}

        init(amount: UFix64, description: String, timestamp: UFix64, debtAllocation: {DebtAllocation}) {
            self.amount = amount
            self.timestamp = timestamp
            self.description = description
            self.debtAllocation = debtAllocation
        }

        // TODO: IS THIS SAFE IF SOMEONE CAN GET A REFERNCE?

        access(all) fun setDebtAllocation(debtAllocation: {DebtAllocation}) {
            self.debtAllocation = debtAllocation
        }

        access(all) fun setAmount(amount: UFix64) {
            self.amount = amount
        }

        access(all) fun setDescription(description: String) {
            self.description = description
        }

        access(all) fun setTimestamp(timestamp: UFix64) {
            self.timestamp = timestamp
        }
    }

    /**
     * The `Payment` resource is used to represent a payment made by a member of a group.
     */
    access(all) struct PaymentInfo {
        access(all) let timestamp: UFix64
        access(all) let recipients: {Address: UFix64}

        init(
            timestamp: UFix64,
            recipients: {Address: UFix64}
        ) {
            self.timestamp = timestamp
            self.recipients = recipients
        }
    }

    /**
     * The `Membership` resource is used to represent a membership in a group.
     * It contains a reference to the group and a UUID for the membership.
     */
    access(all) resource Membership {
        // The UUID of the membership.
        access(all) let groupId: UInt64
        // Expenses incurred by the member, indexed by the expense UUID.
        access(all) let expenses: [MemberExpense]
        // The payments made by the member.
        access(all) let payments: [PaymentInfo]
        // The capability to the group.
        access(self) let memberCapability: Capability<auth(Member) &Group>
        // The capability to the group admin.
        access(self) var adminCapability: Capability<auth(Admin) &Group>?
        
        init(memberCapability: Capability<auth(Member) &Group>) {
            self.groupId = memberCapability.borrow()!.uuid
            self.expenses = []
            self.payments = []
            self.memberCapability = memberCapability
            self.adminCapability = nil
        }

        /**
         * Add an expense to the group.
         */
        access(Owner) fun addExpense(expense: MemberExpense) {
            self.expenses.append(expense)
        }

        /**
         * Add a payment to the group.  Withdraws the maximum amount from the vault and distributes it to all members.
         */
        // TODO: panic could prevent repayment
        // We need a holder vault for any that can't be distributed
        access(all) fun makePayment(
            vaultRef: auth(FungibleToken.Withdraw) &EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault,
            maxAmount: UFix64
        ) {
            let group = self.borrowGroup()

            // Get the vault data for the token
            let vaultData = EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.resolveContractView(
                resourceType: nil,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>(),
            )! as! FungibleTokenMetadataViews.FTVaultData

            let recipients: {Address: UFix64} = {}

            // Distribute payment to all members
            // TODO: make fair
            for peerAddress in group.members.keys {
                if vaultRef.balance <= 0.0 {
                    break
                }

                if group.members[peerAddress]!.collectionCapability.address == peerAddress {
                    continue
                }

                let signedBalance = group.getMemberBalance(address: peerAddress)
                if signedBalance <= 0.0 {
                    continue
                }

                let balance = UFix64(signedBalance)
                let paymentAmount = balance > vaultRef.balance ? vaultRef.balance : balance

                let peerMember = group.members[peerAddress]?.borrow()
                    ?? panic("Member not found for address ".concat(peerAddress.toString()))
                let payment <- vaultRef.withdraw(amount: paymentAmount)
                
                let receiver = getAccount(peerAddress)
                    .capabilities
                    .borrow<&EVMVMBridgedToken_2aabea2058b5ac2d339b163c6ab6f2b6d53aabed.Vault>(vaultData.receiverPath)
                if receiver == nil {
                    // TODO: send to holding vault
                    panic("Receiver not found for address ".concat(peerAddress.toString()))
                }

                // Transfer the payment to the receiver
                receiver!.deposit(from: <-payment)

                // Update the payment info
                recipients[peerAddress] = paymentAmount
            }

            // Create a payment info object
            let paymentInfo = PaymentInfo(
                timestamp: getCurrentBlock().timestamp,
                recipients: recipients
            )

            // Add the payment info to the member's payments
            self.payments.append(paymentInfo)
        }

        /**
         * Get the total payments by the member including expenses paid for others and payments made.
         */
        access(all) fun getTotalPaid(): UFix64 {
            var total: UFix64 = 0.0
            for payment in self.payments {
                for recipient in (&payment.recipients as &{Address: UFix64}).keys {
                    total = total + (&payment.recipients as &{Address: UFix64})[recipient]!
                }
            }

            for expense in (&self.expenses as &[MemberExpense]) {
                for debtor in expense.debtAllocation.getDebtors() {
                    total = total + expense.debtAllocation.shareOf(member: debtor)
                }
            }
            return total
        }

        /**
         * Check if the membership is currently part of the group.
         */
        access(all) fun needsHydration(): Bool {
            return self.memberCapability.borrow()!.members[self.owner!.address] != nil
        }
        
        /**
         * Join the group.
         */
        access(all) fun hydrate() {
            let owner = self.owner!.address
            let memberCap: auth(Divy.Member) &Divy.Group = self.memberCapability.borrow()!
            memberCap.hydrateMember(address: owner, uuid: self.uuid)
        }

        /**
         * Check if the membership is an admin of the group.
         */
        access(all) view fun isAdmin(): Bool {
            return self.adminCapability != nil && self.adminCapability!.check()
        }

        /**
         * Set the admin capability for the membership.
         */
        access(all) fun grantAdmin(adminCapability: Capability<auth(Admin) &Group>) {
            pre {
                adminCapability.borrow()!.uuid == self.groupId: "Admin capability does not match group ID"
            }
            self.adminCapability = adminCapability
        }

        /**
         * Borrow the group admin reference.
         */
        access(Owner) fun borrowAdmin(): auth(Admin) &Group {
            pre {
                self.isAdmin() == true: "Not an admin of this group"
            }
            return self.adminCapability!.borrow() as! auth(Admin) &Group
        }

        /**
         * Borrow the unentitled group reference.
         */
        access(all) fun borrowGroup(): &Group {
            return self.memberCapability.borrow()!
        }
    }

    /**
     * The `MembershipCollection` resource is used to store a collection of memberships.
     * It contains a list of all the Memberships to groups the user belongs to.
     */
    access(all) resource MembershipCollection {
        access(all) let groupIdToUuid: {UInt64: UInt64}
        access(all) let memberships: @{UInt64: Membership}

        // TODO: This should be stripped down
        access(all) fun addMembership(membership: @Membership) {
            let uuid = membership.uuid
            let groupId = membership.groupId

            self.memberships[uuid] <-! membership
            self.groupIdToUuid[groupId] = uuid

            (&self.memberships[uuid] as auth(Owner) &Membership?)!.hydrate()
        }

        access(all) fun borrow(uuid: UInt64): &Membership {
            return (&self.memberships[uuid])!
        }

        access(all) fun borrowByGroupId(groupId: UInt64): &Membership {
            let uuid = self.groupIdToUuid[groupId] ?? panic("Group ID not found")
            return (&self.memberships[uuid])!
        }

        access(Owner) fun borrowOwner(uuid: UInt64): auth(Owner) &Membership? {
            return (&self.memberships[uuid] as auth(Owner) &Membership?)!
        }

        access(Owner) fun borrowOwnerByGroupId(groupId: UInt64): auth(Owner) &Membership? {
            let uuid = self.groupIdToUuid[groupId] ?? panic("Group ID not found")
            return (&self.memberships[uuid] as auth(Owner) &Membership?)!
        }

        access(Owner) fun claimInvitation(
            groupId: UInt64,
        ) {
            pre {
                self.groupIdToUuid[groupId] == nil: "User already has a membership for this group"
            }

            let ownerInvitations = (&Divy.invitations[self.owner!.address] as auth(Mutate, Remove) &{UInt64: Invitation}?)!
            let invitation <- ownerInvitations.remove(key: groupId)!
            let membership <- invitation.cap.borrow()!.createMembership()

            self.addMembership(membership: <-membership)

            destroy <-invitation
        }

        access(Owner) fun claimAnonymousInvitation(
            groupId: UInt64,
            publicKey: [UInt8],
            signatureAlgorithm: SignatureAlgorithm,
            hashAlgorithm: HashAlgorithm,
            signature: [UInt8],
        ) {
            pre {
                self.groupIdToUuid[groupId] == nil: "User already has a membership for this group"
            }

            let groupRef = Divy.borrowGroup(groupId: groupId)!
            let cap = groupRef.claimAnonymousInvitation(
                signature: signature,
                publicKey: publicKey,
                signatureAlgorithm: signatureAlgorithm,
                hashAlgorithm: hashAlgorithm
            )

            let membership <- cap.borrow()!.createMembership()
            self.addMembership(membership: <-membership)
        }

        init() {
            self.groupIdToUuid = {}
            self.memberships <- {}
        }
    }

    /**
     * Create a new `MembershipCollection` resource.
     */
    access(all) fun createMembershipCollection(): @MembershipCollection {
        return <- create MembershipCollection()
    }

    /**
     * Create a new `Group` resource to save to the operator account and return an administrator capability.
     */
    access(all) fun createGroup(
        name: String
    ): Capability<auth(Admin) &Group> {
        // Create a new group and add it to the groups map
        let group <- create Group(name: name)
        let uuid = group.uuid
        self.groups[uuid] = true

        // Save the group to the operator account
        self.account.storage.save(
            <- group,
            to: self.deriveGroupStoragePath(groupId: uuid)
        )

        // Emit the group created event
        emit GroupCreated(
            groupUuid: uuid,
            name: name,
        )

        // Issue an administrator capability to the group
        return self.issueAdminCapability(groupId: uuid)
    }

    /**
     * Derive the storage path for a group.
     */
    access(all) fun deriveGroupStoragePath(groupId: UInt64): StoragePath {
        return StoragePath(identifier: "/storage/divyGroup_/\(groupId)")!
    }

    /**
     * Gets a single group by its ID.
     */
    access(all) fun borrowGroup(groupId: UInt64): &Group? {
        return self.account.storage.borrow<&Group>(from: self.deriveGroupStoragePath(groupId: groupId))
            ?? panic("Group not found")
    }

    /**
     * Issue a member capability to the group.
     */
    access(contract) fun issueMemberCapability(groupId: UInt64): Capability<auth(Member) &Group> {
        return self.account.capabilities.storage.issue<auth(Member) &Group>(
            self.deriveGroupStoragePath(groupId: groupId)
        )
    }

    /**
     * Issue an admin capability to the group.
     */
    access(contract) fun issueAdminCapability(groupId: UInt64): Capability<auth(Admin) &Group> {
        return self.account.capabilities.storage.issue<auth(Admin) &Group>(
            self.deriveGroupStoragePath(groupId: groupId)
        )
    }
}