import "SplitFi"

access(all) fun main(groupId: UInt64, address: Address): Fix64 {
    // Get the group from the contract
    let groupRef = SplitFi.borrowGroup(groupId: groupId)
        ?? panic("Group not found")

    return groupRef.getMemberBalance(address: address)
}