access(all) contract HeapUtils {
    access(all) struct HeapItem {
        access(all) let value: &AnyResource
        access(all) let priority: Int

        init(value: &AnyResource, priority: Int) {
            self.value = value
            self.priority = priority
        }
    }

    /// Resource that owns its storage and can be moved or destroyed.
    access(all) struct Heap {

        /// Backing array that maintains the binary-heap shape-property.
        access(all) var items: [HeapItem]

        /// ---------- public API ----------

        /// Returns the smallest element without removing it.
        access(all) fun peek(): HeapItem {
            pre { self.items.length > 0: "Heap is empty" }
            return self.items[0]
        }

        /// Inserts `value` into the heap.
        access(all) fun insert(_ value: HeapItem) {
            self.items.append(value)
            self.siftUp(index: self.items.length - 1)
        }

        /// Removes and returns the smallest element.
        access(all) fun extractMin(): HeapItem {
            pre { self.items.length > 0: "Heap is empty" }

            let min = self.items[0]
            let lastIndex = self.items.length - 1

            // Move the last element to the root and shrink the array
            self.items[0] = self.items[lastIndex]
            self.items.removeLast()

            if self.items.length > 0 {
                self.siftDown(index: 0)
            }
            return min
        }

        /// Current number of elements.
        access(all) fun size(): Int {
            return self.items.length
        }

        /// ---------- private helpers ----------

        access(self) fun siftUp(index: Int) {
            var i = index
            while i > 0 {
                let parent = (i - 1) / 2
                if self.items[i].priority < self.items[parent].priority {
                    self.swap(i, parent)
                    i = parent
                } else {
                    break
                }
            }
        }

        access(self) fun siftDown(index: Int) {
            var i = index
            let n = self.items.length
            while true {
                let left  = i * 2 + 1
                let right = i * 2 + 2
                var smallest = i

                if left < n && self.items[left].priority < self.items[smallest].priority {
                    smallest = left
                }
                if right < n && self.items[right].priority < self.items[smallest].priority {
                    smallest = right
                }
                if smallest == i {
                    break
                }
                self.swap(i, smallest)
                i = smallest
            }
        }

        access(self) fun swap(_ i: Int, _ j: Int) {
            let temp = self.items[i]
            self.items[i] = self.items[j]
            self.items[j] = temp
        }

        init() {
            self.items = []
        }
    }

    /// Factory: creates a fresh, empty heap.
    access(all) fun createHeap(): Heap {
        return Heap()
    }
}