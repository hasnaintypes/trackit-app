import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig as ChartConfigType } from "@/components/ui/chart";

type Budget = {
  id: string;
  amount: { toNumber: () => number } | number | string;
  spentAmount: { toNumber: () => number } | number | string;
  category: {
    name: string;
  };
};

const chartConfig = {
  budget: {
    label: "Budget",
    color: "hsl(var(--chart-1))",
  },
  spent: {
    label: "Spent",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfigType;

export default function BudgetRadar({ budgets }: { budgets: Budget[] }) {
  // Transform data for Radar Chart
  // We want to show top categories
  const chartData = budgets.slice(0, 6).map((b) => {
    const total =
      typeof b.amount === "object" && "toNumber" in b.amount
        ? b.amount.toNumber()
        : typeof b.amount === "string"
          ? parseFloat(b.amount)
          : b.amount;

    const spent =
      typeof b.spentAmount === "object" && "toNumber" in b.spentAmount
        ? b.spentAmount.toNumber()
        : typeof b.spentAmount === "string"
          ? parseFloat(b.spentAmount)
          : b.spentAmount;

    return {
      category: b.category.name,
      budget: total,
      spent: spent,
    };
  });

  if (chartData.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader className="items-center pb-4">
        <CardTitle>Spending vs Budget</CardTitle>
        <CardDescription>Comparison across your top categories</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              name="Budget"
              dataKey="budget"
              stroke="var(--color-budget)"
              fill="var(--color-budget)"
              fillOpacity={0.4}
            />
            <Radar
              name="Spent"
              dataKey="spent"
              stroke="var(--color-spent)"
              fill="var(--color-spent)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
