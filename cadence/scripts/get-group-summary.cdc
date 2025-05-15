import "Divy"
import "DivyDto"

/**
 * Returns all of the unsorted expenses incurred by members of a group.
 */
access(all) fun main(groupId: UInt64): DivyDto.GroupSummaryDto {
    // Get the group from the contract
    let groupRef = Divy.borrowGroup(groupId: groupId)
        ?? panic("Group not found")

    // Return the group summary
    return DivyDto.GroupSummaryDto(groupRef: groupRef)
}