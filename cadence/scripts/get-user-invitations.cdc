import "SplitFi"
import "SplitFiDto"

/**
 * Returns all of the invitations that the user has received.
 */
access(all) fun main(address: Address): SplitFiDto.InvitationListDto {
    let invitations = SplitFi.invitations[address]
    if invitations == nil {
        let dummyRef: @{UInt64: SplitFi.Invitation} <- {}
        let ret = SplitFiDto.InvitationListDto(invitationListRef: &dummyRef as &{UInt64: SplitFi.Invitation})
        destroy dummyRef
        return ret
    }
    return SplitFiDto.InvitationListDto(invitationListRef: invitations!)
}