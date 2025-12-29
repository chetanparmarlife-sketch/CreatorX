'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Plus, Trash2 } from 'lucide-react'
import { paymentService, PaymentMethodPayload } from '@/lib/api/payments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type PaymentMethod = {
  id: string | number
  brand?: string
  last4?: string
  expiry?: string
  cardholderName?: string
}

type Transaction = {
  id: string | number
  date: string
  description: string
  amount: number
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  receiptUrl?: string
}

const statusColors: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
}

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export default function PaymentsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cardForm, setCardForm] = useState<PaymentMethodPayload>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })
  const [statusFilter, setStatusFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(0)

  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentService.getPaymentMethods(),
  })

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', page, statusFilter, fromDate, toDate],
    queryFn: () =>
      paymentService.getTransactions({
        page,
        size: 20,
        status: statusFilter === 'All' ? undefined : statusFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  })

  const transactions: Transaction[] = transactionsData?.items ?? transactionsData ?? []
  const totalPages = transactionsData?.totalPages ?? 1

  const addMethodMutation = useMutation({
    mutationFn: (payload: PaymentMethodPayload) => paymentService.addPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      setIsModalOpen(false)
      setCardForm({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' })
    },
  })

  const removeMethodMutation = useMutation({
    mutationFn: (id: string | number) => paymentService.removePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })

  const formattedMethods = useMemo(() => {
    return (methods as PaymentMethod[]).map((method) => ({
      ...method,
      last4: method.last4 || method?.id?.toString().slice(-4),
    }))
  }, [methods])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">Manage payment methods and transactions.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>This will be saved for future payments.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Card Number</label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.cardNumber}
                  onChange={(event) =>
                    setCardForm((prev) => ({
                      ...prev,
                      cardNumber: formatCardNumber(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                  <Input
                    placeholder="MM/YY"
                    value={cardForm.expiryDate}
                    onChange={(event) =>
                      setCardForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">CVV</label>
                  <Input
                    placeholder="123"
                    value={cardForm.cvv}
                    onChange={(event) =>
                      setCardForm((prev) => ({ ...prev, cvv: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cardholder Name</label>
                <Input
                  placeholder="Alex Morgan"
                  value={cardForm.cardholderName}
                  onChange={(event) =>
                    setCardForm((prev) => ({ ...prev, cardholderName: event.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => addMethodMutation.mutate(cardForm)}
                disabled={addMethodMutation.isPending}
              >
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          {methodsLoading ? (
            <div className="text-sm text-slate-500">Loading payment methods...</div>
          ) : formattedMethods.length === 0 ? (
            <div className="text-sm text-slate-500">No payment methods saved.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {formattedMethods.map((method) => (
                <div key={method.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{method.brand || 'Card'}</p>
                      <p className="text-lg font-semibold text-slate-900">
                        •••• {method.last4}
                      </p>
                      <p className="text-xs text-slate-500">
                        {method.cardholderName || 'Cardholder'} · {method.expiry || 'MM/YY'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMethodMutation.mutate(method.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-input bg-white px-3 text-sm"
            >
              <option>All</option>
              <option>SUCCESS</option>
              <option>PENDING</option>
              <option>FAILED</option>
            </select>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-sm text-slate-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-sm text-slate-500">No transactions yet.</div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[transaction.status] ?? 'bg-slate-200 text-slate-700'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.receiptUrl ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={transaction.receiptUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
