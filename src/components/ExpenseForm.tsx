import { Button } from "@/components/ui/button";

interface ExpenseFormProps {
  onSubmit: (description: string, amount: number) => void;
  onCancel: () => void;
}

export function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);
    onSubmit(description, amount);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          name="description"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          placeholder="What was the expense for?"
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          placeholder="0.00"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Expense</Button>
      </div>
    </form>
  );
} 