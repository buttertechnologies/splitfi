import "SplitFi"
import "SplitFiDto"

/**
 * Returns all of the groups that the user is a member of.
 */
access(all) fun main(address: Address): [SplitFiDto.GroupSummaryDto] {
    // Get the user's membership collection
    let membershipCollectionRef = getAccount(address)
        .capabilities
        .borrow<&SplitFi.MembershipCollection>(SplitFi.MembershipCollectionPublicPath)
    
    if membershipCollectionRef == nil {
        return []
    }

    // Iterate over the memberships
    let result: [SplitFiDto.GroupSummaryDto] = []
    for group in membershipCollectionRef!.memberships.keys {
        result.append(
            SplitFiDto.GroupSummaryDto(
                groupRef: membershipCollectionRef!.borrow(uuid: group).borrowGroup()
            )
        )
    }
    // Return the group summary
    return result
}