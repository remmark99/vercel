'use server'

import 'server-only'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'
import { revalidatePath } from 'next/cache'

import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  console.log('WE ARE GETTING A NEW CHAT')
  if (!userId) {
    return []
  }
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    const { data } = await supabase
      .from('chats')
      .select('payload')
      .order('payload->createdAt', { ascending: false })
      .eq('user_id', userId)
      .throwOnError()

    return (data?.map(entry => entry.payload) as Chat[]) ?? []
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    await supabase.from('chats').delete().eq('id', id).throwOnError()

    revalidatePath('/')
    return revalidatePath(path)
  } catch (error) {
    return {
      error: 'Unauthorized'
    }
  }
}

export async function clearChats() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient<Database>({
      cookies: () => cookieStore
    })
    // TODO: this basically means delete all but in a somewhat hacky manner
    await supabase.from('chats').delete().neq('payload', '-1').throwOnError()
    revalidatePath('/')
  } catch (error) {
    console.log('clear chats error', error)
    return {
      error: 'Unauthorized'
    }
  }
}

export async function getSharedChat(id: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  const { data } = await supabase
    .from('chats')
    .select('payload')
    .eq('id', id)
    .not('payload->sharePath', 'is', null)
    .maybeSingle()

  return (data?.payload as Chat) ?? null
}

export async function shareChat(chat: Chat) {
  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })
  await supabase
    .from('chats')
    .update({ payload: payload as any })
    .eq('id', chat.id)
    .throwOnError()

  return payload
}

export async function makePayment(amount: number) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })

  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
      ).toString('base64')}`,
      'Idempotence-Key': crypto.randomUUID(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: {
        value: amount,
        currency: 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        // TODO: change to env url
        return_url: 'http://localhost:3000/profile'
      },
      // TODO: change payment description
      description: 'Test payment'
    })
  })

  const { id, status, ...data } = await res.json()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  await supabase
    .from('payments')
    .insert({ id, status, amount, user_id: user?.id })

  return data.confirmation.confirmation_url
}

export async function getPaymentInfo(paymentId: number) {
  const cookieStore = cookies()
  const supabase = createServerActionClient<Database>({
    cookies: () => cookieStore
  })

  const test = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
      ).toString('base64')}`
    }
  })
  const payment = await test.json()

  if (payment.status !== 'pending') {
    await supabase
      .from('payments')
      .update({ status: payment.status })
      .eq('id', payment.id)

    revalidatePath('/profile', 'page')
  }
}

export default async function customRevalidatePath(
  originalPath: string,
  type?: 'layout' | 'page'
) {
  revalidatePath(originalPath, type)
}
