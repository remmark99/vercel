'use client'

import React, { useState } from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import { makePayment } from '@/app/actions'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function PaymentForm() {
  const [amount, setAmount] = useState(0)

  return (
    <div className="flex gap-2">
      <Input
        className="h-11 bg-red"
        value={amount}
        onChange={event => setAmount(+event.target.value)}
      />
      <Button
        size="lg"
        className="gap-4 bg-green-500 hover:bg-green-700"
        onClick={async () => {
          const test = await makePayment(amount)
          window.location.assign(test)
        }}
      >
        Пополнить
        <PlusIcon />
      </Button>
    </div>
  )
}
