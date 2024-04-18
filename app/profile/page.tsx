import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { ChevronLeftIcon, PlusIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { redirect } from 'next/navigation'

export default async function Profile() {
  const cookieStore = cookies()
  const session = await auth({ cookieStore })

  if (!session?.user) {
    redirect('/')
  }

  const { user } = session;

  const renderUserCard = () => (
    <div className='mt-5 flex w-full flex-wrap justify-between gap-4 rounded-xl bg-muted/100 p-5'>
      <div className='flex items-center gap-5'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={user.user_metadata.avatar_url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {user.user_metadata.name}
          </h4>
          <small className="text-sm font-medium leading-none text-muted-foreground">
            {user.email}
          </small>
        </div>
      </div>
      <Button variant="destructive">Выход</Button>
    </div>
  )

  const renderBalanceCard = () => (
    <div className='mt-5 flex w-full items-center justify-between rounded-xl bg-muted/100 p-5'>
      <div>
        <small className="text-sm font-medium leading-none text-muted-foreground">
          Мой баланс
        </small>
        <h4 className="mt-3 scroll-m-20 text-4xl font-semibold tracking-tight">
          20 <span className='text-2xl text-muted-foreground'>₽</span>
        </h4>
      </div>
      <Button size="lg" className='gap-4 bg-green-500 hover:bg-green-700'>
        Пополнить
        <PlusIcon />
      </Button>
    </div>
  )

  const renderTransactionsCard = () => (
    <div className='mt-5 w-full rounded-xl bg-muted/100 p-5'>
      <h4 className="text-xl font-medium leading-none">
        Платежи
      </h4>
      <div className='my-20 flex justify-center text-muted-foreground'>Здесь будут ваши платежи</div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] justify-center py-10">
      <div className='mx-4 w-full max-w-[730px]'>
        <div className='flex justify-between'>
          <Button variant="outline" size="icon" className='h-10 w-10 bg-muted/80'>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>

        {renderUserCard()}

        {renderBalanceCard()}

        {renderTransactionsCard()}

      </div>
    </div>
  )
}
