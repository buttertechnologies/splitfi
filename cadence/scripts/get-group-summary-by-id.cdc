import "Divy"
import "DivyDto"

/**
 * Returns the group summary for a given group ID.
 */
access(all) fun main(groupId: UInt64): DivyDto.GroupSummaryDto {
    // Get the group from the contract
    let groupRef = Divy.borrowGroup(groupId: groupId)
        ?? panic("Group not found")

    // Return the group summary
    return DivyDto.GroupSummaryDto(groupRef: groupRef)
}