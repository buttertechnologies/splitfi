import "SplitFi"
import "SplitFiDto"

/**
 * Returns the group summary for a given group ID.
 */
access(all) fun main(groupId: UInt64): SplitFiDto.GroupSummaryDto {
    // Get the group from the contract
    let groupRef = SplitFi.borrowGroup(groupId: groupId)
        ?? panic("Group not found")

    // Return the group summary
    return SplitFiDto.GroupSummaryDto(groupRef: groupRef)
}