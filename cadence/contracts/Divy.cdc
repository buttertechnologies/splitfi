access(all)
contract Divy {
    access(all) let groups: {UInt64: Bool}

    access(all) let MembershipCollectionPublicPath: PublicPath
    access(all) let MembershipCollectionStoragePath: StoragePath

    access(all) entitlement Owner
    access(all) entitlement Admin
    access(all) entitlement Member

    init() {
        self.MembershipCollectionPublicPath = /public/divyMembershipCollection
        self.MembershipCollectionStoragePath = /storage/divyMembershipCollection

        self.groups = {}
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

        init(name: String) {
            self.name = name
            self.members = {}
        }

        access(Admin) fun createMembership(): @Membership {
            let adminCap = Divy.issueMemberCapability(groupId: self.uuid)
            return <- create Membership(
                memberCapability: adminCap
            )
        }

        access(Member) fun hydrateMember(_ address: Address, uuid: UInt64?) {
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
            if !collection.groupIdToUuid.containsKey(targetUuid!) {
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
    }

    /**
     * The `MemberExpense` resource is used to represent incurred by a member of a group.
     */
    access(all) struct MemberExpense {
        access(all) let amount: UFix64
        access(all) let description: String
        access(all) let timestamp: UFix64

        init(amount: UFix64, description: String, timestamp: UFix64) {
            self.amount = amount
            self.timestamp = timestamp
            self.description = description
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
        access(all) let expenses: {UInt64: MemberExpense}
        access(self) let memberCapability: Capability<auth(Member) &Group>
        access(self) var adminCapability: Capability<auth(Admin) &Group>?
        
        init(memberCapability: Capability<auth(Member) &Group>) {
            self.groupId = memberCapability.borrow()!.uuid
            self.expenses = {}
            self.memberCapability = memberCapability
            self.adminCapability = nil
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
        access(Owner) fun hydrate() {
            let owner = self.owner!.address
            let memberCap = self.memberCapability.borrow()!
            memberCap.hydrateMember(owner, uuid: self.uuid)
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
    }

    /**
     * The `MembershipCollection` resource is used to store a collection of memberships.
     * It contains a list of all the Memberships to groups the user belongs to.
     */
    access(all) resource MembershipCollection {
        access(all) let groupIdToUuid: {UInt64: UInt64}
        access(all) let memberships: @{UInt64: Membership}

        access(all) fun addMembership(membership: @Membership) {
            let uuid = membership.uuid
            let groupId = membership.groupId
            self.memberships[uuid] <-! membership
            self.groupIdToUuid[groupId] = uuid
        }

        access(all) fun borrow(uuid: UInt64): &Membership {
            return (&self.memberships[uuid])!
        }

        access(all) fun borrowByGroupId(groupId: UInt64): &Membership {
            let uuid = self.groupIdToUuid[groupId] ?? panic("Group ID not found")
            return (&self.memberships[uuid])!
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