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
    access(all) struct MembershipReference {
        access(all) let collectionCapability: Capability<&MembershipCollection>
        access(all) let membershipUuid: UInt64

        init(collectionCapability: Capability<&MembershipCollection>, membershipUuid: UInt64) {
            self.collectionCapability = collectionCapability
            self.membershipUuid = membershipUuid
        }
    }

    /**
     * The `Group` resource is used to represent a group of members for a Divy instance.
     */
    access(all) resource Group {
        access(all) let name: String
        access(all) let members: {Address: MembershipReference}

        init(name: String) {
            self.name = name
            self.members = {}
        }

        access(Admin) fun createMembership(): @Membership {
            let cap = Divy.issueGroupMemberCapability(groupId: self.uuid)
            return <- create Membership(
                memberCapability: cap
            )
        }

        // TODO: fix hydration
        access(Member) fun hydrateMember(_ address: Address, uuid: UInt64?) {
            var membershipRef: MembershipReference? = nil
            let collectionCap = getAccount(address).capabilities.get<&MembershipCollection>(Divy.MembershipCollectionPublicPath)
            if collectionCap.check() { 
                let membershipUuid = membership.uuid
                let membershipRef = MembershipReference(
                    collectionCapability: getAccount(membership.owner!.address).capabilities.get<&MembershipCollection>(Divy.MembershipCollectionPublicPath),
                    membershipUuid: membershipUuid
                )
                self.members[membership.owner!.address] = membershipRef
            }
        }
    }

    /**
     * The `Membership` resource is used to represent a membership in a group.
     * It contains a reference to the group and a UUID for the membership.
     */
    access(all) resource Membership {
        access(all) let groupId: UInt64
        access(self) let memberCapability: Capability<auth(Member) &Group>
        access(self) var adminCapability: Capability<auth(Admin) &Group>?
        
        init(memberCapability: Capability<auth(Member) &Group>) {
            self.groupId = memberCapability.borrow()!.uuid
            self.memberCapability = memberCapability
            self.adminCapability = nil
        }

        /**
         * Check if the membership is currently part of the group.
         */
        access(all) fun hasJoined(): Bool {
            // TODO: should we key by address or UUID?
            return self.memberCapability.borrow()!.members[self.owner!.address] != nil
        }
        
        /**
         * Join the group.
         */
        access(Owner) fun joinGroup() {
            if !self.hasJoined() {
                let owner = self.owner!.address
                let memberCap = self.memberCapability.borrow()!
                memberCap.hydrateMember(owner)
            } else {
                panic("Already a member of this group")
            }
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
        access(contract) fun setToAdmin(adminCapability: Capability<auth(Admin) &Group>) {
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
     * Create a new `Group` resource to save to the operator account and return an administrator capability.
     */
    access(all) fun createGroup(
        name: String
    ): Capability<auth(Admin, Member) &Group> {
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
        return self.account.capabilities.storage.issue<auth(Admin, Member) &Group>(
            self.deriveGroupStoragePath(groupId: uuid)
        )
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
    access(all) fun borrowGroup(groupId: UInt64): &Group {
        return self.account.storage.borrow<&Group>(from: self.deriveGroupStoragePath(groupId: groupId))
            ?? panic("Group not found")
    }

    /**
     * Issue a capability to the group.
     */
    access(all) fun issueGroupMemberCapability(groupId: UInt64): Capability<auth(Member) &Group> {
        return self.account.capabilities.storage.issue<auth(Member) &Group>(
            self.deriveGroupStoragePath(groupId: groupId)
        )
    }
}