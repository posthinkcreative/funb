'use client';

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { History, ReceiptText, Calendar, CreditCard, Tag } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Transaction } from '@/types';

export default function OrderHistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, "transactions"), 
        where("userId", "==", user.uid),
        orderBy("transactionDate", "desc")
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <CardTitle>Order History</CardTitle>
        </div>
        <CardDescription>
          Track and view all your past webinar registrations and payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isUserLoading || isTransactionsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => {
                const txDate = tx.transactionDate && typeof tx.transactionDate.toDate === 'function' 
                    ? tx.transactionDate.toDate() 
                    : tx.transactionDate ? new Date(tx.transactionDate) : null;

                return (
                    <div key={tx.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:bg-muted/10 transition-colors">
                        <div className="relative w-full md:w-32 aspect-video shrink-0 rounded-lg overflow-hidden border">
                            <Image 
                                src={tx.courseImageUrl || 'https://placehold.co/200x112?text=Webinar'} 
                                alt={tx.courseTitle} 
                                fill 
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex-grow space-y-1">
                            <h3 className="font-bold text-lg leading-tight">{tx.courseTitle}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{txDate ? format(txDate, "dd MMM yyyy, HH:mm") : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    <span>{tx.paymentMethod}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ReceiptText className="w-3 h-3" />
                                    <span className="font-mono text-[10px] uppercase">{tx.ipaymuReference}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Tag className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium">Qty: {tx.quantity || 1}</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-end shrink-0 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6">
                            <p className="text-xs text-muted-foreground">Total Paid</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(tx.amount)}</p>
                        </div>
                    </div>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <ReceiptText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">
              You haven't made any transactions yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
