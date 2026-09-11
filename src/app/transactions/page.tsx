"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  sender_account_id: string | null;
  receiver_account_id: string | null;
  amount: number;
  description: string | null;
  status: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/accounts/");
      const accounts = response.data;

      if (accounts.length > 0) {
        const transPromises = accounts.map((acc: any) =>
          api.get(`/transactions/${acc.id}`),
        );
        const transResponses = await Promise.all(transPromises);

        const allTrans: Transaction[] = [];
        const seenIds = new Set();

        transResponses.forEach((res) => {
          res.data.forEach((t: Transaction) => {
            if (!seenIds.has(t.id)) {
              seenIds.add(t.id);
              allTrans.push(t);
            }
          });
        });

        allTrans.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        setTransactions(allTrans);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">All Transactions</h1>
          <p className="text-gray-500 mt-2">
            View your complete transaction history
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E3DAA]"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="px-8 py-4">Description</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                            {transaction.amount >= 0 ? (
                              <ArrowDownLeft className="h-5 w-5" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5" />
                            )}
                          </div>
                          <p className="font-bold text-gray-900">
                            {transaction.description || "BLUEROCK Transfer"}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">
                        {formatDate(transaction.timestamp)}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter bg-green-100 text-green-700">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-gray-900">
                        {transaction.amount >= 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <History className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
