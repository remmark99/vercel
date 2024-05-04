'use client'

import React, { useEffect, useState } from 'react'
import { getPaymentInfo } from '@/app/actions'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'

interface Payment {
  id: number
  status: string
  amount: number
}

interface Props {
  payments: Payment[]
}

export default function PaymentsTable({ payments: initialPayments }: Props) {
  const [payments, setPayments] = useState(initialPayments)
  const pendingPayments = payments.filter(
    payment => payment.status === 'pending'
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      pendingPayments.forEach(payment => getPaymentInfo(payment.id))
    }, 10000)

    return () => clearInterval(intervalId)
  }, [pendingPayments])

  useEffect(() => setPayments(initialPayments), [initialPayments])

  return (
    <Table>
      <TableCaption>
        Список ваших платежей.
        <br />
        Обновляются раз в минуту.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments?.map(payment => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.id}</TableCell>
            <TableCell>{payment.status}</TableCell>
            <TableCell className="text-right">{payment.amount}₽</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
            {payments?.reduce((acc, curr) => acc + curr.amount, 0)}₽
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
