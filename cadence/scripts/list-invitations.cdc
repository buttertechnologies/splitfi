import "Divy"
import "DivyDto"

/**
 * List all the invitations for a given address.
 */
access(all) fun main(address: Address): DivyDto.InvitationListDto {
    let invitations = Divy.invitations[address]!
    return DivyDto.InvitationListDto(invitationListRef: invitations)
}