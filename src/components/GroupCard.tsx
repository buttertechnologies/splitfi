import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupCardProps {
  name: string;
}

export function GroupCard({ name }: GroupCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
    </Card>
  );
} 