'use client'

import React from 'react'
import { useAtom } from 'jotai'
import { modelAtom } from '@/app/atoms'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'

export default function ModelPicker() {
  const router = useRouter()
  const [model, setModel] = useAtom(modelAtom)

  return (
    <Select
      value={model}
      onValueChange={value => {
        setModel(value)

        router.push('/')
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-4">GPT-4</SelectItem>
        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
      </SelectContent>
    </Select>
  )
}
