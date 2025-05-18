
    access(all) resource ExpenseSplit {
        // The total amount of the expense in USD
        access(all) var total: UFix64
        // The number of members in the group
        access(all) var numMembers: Int

        init(total: UFix64, numMembers: Int) {
            self.total = total
            self.numMembers = numMembers
        }
    }

    access(all) resource FixedExpenseDebt {
        // The total amount of the expense in USD
        access(all) var total: UFix64
        // The number of members in the group
        access(all) var numMembers: Int
        // The amount owed by each member
        access(all) var amountOwed: UFix64

        init(total: UFix64, numMembers: Int) {
            self.total = total
            self.numMembers = numMembers
            self.amountOwed = total / UFix64(numMembers)
        }
    }

    access(all) resource PercentageExpenseDebt {
        // The total amount of the expense in USD
        access(all) var total: UFix64
        // The number of members in the group
        access(all) var numMembers: Int
        // The percentage owed by each member
        access(all) var percentageOwed: UFix64

        init(total: UFix64, numMembers: Int, percentageOwed: UFix64) {
            self.total = total
            self.numMembers = numMembers
            self.percentageOwed = percentageOwed
        }
    }

    access(all) struct interface DebtAllocation {
        access(all) fun shareOf(member: Address): UFix64
        access(all) fun members(): [Address]
        access(all) fun total(): UFix64
    }
    
access(all) resource DebtAllocation {          // ← the “real” debt object
    access(all) let amount: UFix64
    access(all) let creditor: Address
    access(all) let debtor: Address

    init(amount: UFix64, creditor: Address, debtor: Address) {
        self.amount   = amount
        self.creditor = creditor
        self.debtor   = debtor
    }
}

// a single ledger resource that owns many debts
access(all) resource DebtLedger {
    //
    //   uuid  →   DebtAllocation
    //
    access(self) var debts: {UInt64: @DebtAllocation}

    init() {
        self.debts <- {}
    }

    // mint a new debt, return its uuid for the UI
    access(all) fun mintDebt(
        amount: UFix64,
        creditor: Address,
        debtor: Address
    ): UInt64 {
        let debt <- create DebtAllocation(
            amount: amount,
            creditor: creditor,
            debtor: debtor
        )
        let id: UInt64 = debt.uuid        // 👈 grab it before storing
        self.debts[id] <-! debt
        return id
    }

    access(all) fun getDebt(id: UInt64): &DebtAllocation{
        return (&self.debts[id] as &DebtAllocation?)!
    }

    destroy() { destroy self.debts }
}

    /**
     * The `RandomExpenseDebt` resource is used to represent a random expense incurred by a member of a group.
     */
    access(all) resource RandomExpenseDebt {
        // The total amount of the expense in USD
        access(all) var total: UFix64
        // The number of members in the group
        access(all) var numMembers: Int
        // The amount owed by each member
        access(all) var amountOwed: UFix64

        init(total: UFix64, numMembers: Int) {
            self.total = total
            self.numMembers = numMembers
            self.amountOwed = total / UFix64(numMembers)
        }

        access(alL) fun getAmountOwed(): UFix64 {
            return self.amountOwed
        }
    }