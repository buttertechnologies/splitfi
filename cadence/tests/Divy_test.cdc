import Test

access(all) let account = Test.createAccount()

access(all) fun testContract() {
    let err = Test.deployContract(
        name: "SplitFi",
        path: "../contracts/SplitFi.cdc",
        arguments: [],
    )

    Test.expect(err, Test.beNil())
}