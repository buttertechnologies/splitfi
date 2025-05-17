import "Divy"
import "DivyDto"

/**
 * Returns all of the invitations that the user has received.
 */
access(all) fun main(address: Address): DivyDto.InvitationListDto {
    let invitations = Divy.invitations[address]
    if invitations == nil {
        let dummyRef: @{UInt64: Divy.Invitation} <- {}
        let ret = DivyDto.InvitationListDto(invitationListRef: &dummyRef as &{UInt64: Divy.Invitation})
        destroy dummyRef
        return ret
    }
    return DivyDto.InvitationListDto(invitationListRef: invitations!)
}