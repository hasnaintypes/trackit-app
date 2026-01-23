"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Trash2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  lastDigits: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
}

export default function BillingSettings() {
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: "1", type: "Visa", lastDigits: "4242" },
    { id: "2", type: "Bank Account", lastDigits: "7890" },
  ]);

  const [invoices] = useState<Invoice[]>([
    { id: "1", date: "Oct 26, 2025", amount: "$29.99", status: "paid" },
    { id: "2", date: "Sep 26, 2025", amount: "$29.99", status: "paid" },
    { id: "3", date: "Aug 26, 2025", amount: "$29.99", status: "paid" },
  ]);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Your current subscription plan details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Current Plan</p>
              <p className="text-foreground text-xl font-semibold">Pro Plan</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Next Billing Date</p>
              <p className="text-foreground text-xl font-semibold">
                November 26, 2025
              </p>
            </div>
          </div>
          <Button className="w-full">Upgrade/Downgrade Plan</Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved payment methods
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="border-border flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="text-foreground font-medium">
                    {method.type} ***{method.lastDigits}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Default payment method
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Date
                  </th>
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Amount
                  </th>
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="text-foreground px-4 py-3 text-sm">
                      {invoice.date}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {invoice.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "outline"
                        }
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
