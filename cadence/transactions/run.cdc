import "Test"
transaction() {
    prepare(a: &Account) {
        Test.test(fn: fun (): Void {
            self.getType()
        })
    }
}