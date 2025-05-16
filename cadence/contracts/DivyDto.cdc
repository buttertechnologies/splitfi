import "Divy"

/**
 * This contract contains data transfer objects (DTOs) for the Divy contract.
 */
access(all) contract DivyDto {
    access(all) struct MemberExpenseDto {
        access(all) let description: String
        access(all) let amount: UFix64
        access(all) let timestamp: UFix64
        access(all) let debtors: {Address: UFix64}

        init(expense: &Divy.MemberExpense) {
            self.description = expense.description
            self.amount = expense.amount
            self.timestamp = expense.timestamp
            self.debtors = *expense.debtors
        }
    }

    access(all) struct MembershipDto {
        access(all) let uuid: UInt64
        access(all) let address: Address
        access(all) let expenses: [MemberExpenseDto]

        init(memberRef: &Divy.Membership) {
            self.uuid = memberRef.uuid
            self.address = memberRef.owner!.address
            
            let expenses: [MemberExpenseDto] = []
            for expense in memberRef.expenses {
                let expenseDto = MemberExpenseDto(expense: expense)
                expenses.append(expenseDto)
            }
            self.expenses = expenses
        }
    }

    access(all) struct GroupSummaryDto {
        access(all) let name: String
        access(all) let uuid: UInt64
        access(all) let members: [MembershipDto]

        init(groupRef: &Divy.Group) {
            self.name = groupRef.name
            self.uuid = groupRef.uuid

            let members: [MembershipDto] = []
            for memberAddress in groupRef.members.keys {
                let memberRef = groupRef.members[memberAddress]!.borrow()
                if memberRef == nil {
                    continue
                }
                let memberDto = MembershipDto(memberRef: memberRef!)
                members.append(memberDto)
            }

            self.members = members
        }
    }

    access(all) struct InvitationDto {
        access(all) let uuid: UInt64
        access(all) let group: GroupSummaryDto?

        init(invitationRef: &Divy.Invitation) {
            self.uuid = invitationRef.uuid

            // Revoked invitations will not have a group and be nil
            let groupId = invitationRef.getGroupId()
            let groupRef = groupId != nil ? Divy.borrowGroup(groupId: groupId) : nil
            self.group = groupRef != nil ? GroupSummaryDto(groupRef: groupRef!) : nil
        }
    }

    access(all) struct InvitationListDto {
        access(all) let invitations: [InvitationDto]

        init(invitationListRef: &{UInt64: Divy.Invitation}) {
            self.invitations = []
            for inviteUuid in invitationListRef.keys {
                let inviteRef = invitationListRef[inviteUuid]
                if (inviteRef == nil) {
                    continue
                }
                let inviteDto = InvitationDto(invitationRef: inviteRef!)
                self.invitations.append(inviteDto)
            }
        }
    }
}