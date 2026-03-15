"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function BillingSection() {
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
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">Current Plan</h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Your current subscription details.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Plan</p>
              <p className="text-foreground text-lg font-semibold">Pro Plan</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Next Billing</p>
              <p className="text-foreground text-lg font-semibold">
                Nov 26, 2025
              </p>
            </div>
          </div>
          <Button className="mt-4 w-full sm:w-auto">Upgrade / Downgrade</Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-foreground font-semibold">Payment Methods</h3>
              <p className="text-muted-foreground text-xs">
                Manage your saved payment methods.
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {method.type} ***{method.lastDigits}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Default payment method
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Billing History
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Download your past invoices.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Date
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
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
                    <td className="px-3 py-2.5 text-xs">{invoice.date}</td>
                    <td className="px-3 py-2.5 text-xs font-medium">
                      {invoice.amount}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
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
