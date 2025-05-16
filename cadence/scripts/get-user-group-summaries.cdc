import "Divy"
import "DivyDto"

/**
 * Returns all of the groups that the user is a member of.
 */
access(all) fun main(address: Address): [DivyDto.GroupSummaryDto] {
    // Get the user's membership collection
    let membershipCollectionRef = getAccount(address)
        .capabilities
        .borrow<&Divy.MembershipCollection>(Divy.MembershipCollectionPublicPath)
    
    if membershipCollectionRef == nil {
        return []
    }

    // Iterate over the memberships
    let result: [DivyDto.GroupSummaryDto] = []
    for group in membershipCollectionRef!.memberships.keys {
        result.append(
            DivyDto.GroupSummaryDto(
                groupRef: membershipCollectionRef!.borrow(uuid: group).borrowGroup()
            )
        )
    }
    // Return the group summary
    return result
}