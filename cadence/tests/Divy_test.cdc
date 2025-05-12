import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "Divy",
        path: "../contracts/Divy.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}