import 'server-only'

import { OpenAIStream, StreamingTextResponse } from 'ai'
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi
} from 'openai-edge'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { TiktokenModel, encodingForModel } from 'js-tiktoken'
import { revalidatePath } from 'next/cache'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: 'sk-ykDLbFP4CgJa8i4jhuwYCvXYFoNqQAtG',
  basePath: 'https://api.proxyapi.ru/openai/v1'
})

const openai = new OpenAIApi(configuration)

interface TODOInterface {
  messages: Array<ChatCompletionRequestMessage>
  previewToken: any
  // TODO: Fix that too
  model: TiktokenModel
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
  const json = await req.json()
  const { messages, previewToken, model }: TODOInterface = json
  const encoding = encodingForModel(model)
  const requestMessage = messages.at(-1)!.content
  let tokens = encoding.encode(requestMessage!).length
  const userId = (await auth({ cookieStore }))?.user.id

    openai.createImage()
  // if (!userId) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  // Для разработки, PVN версия через api.proxyapi.ru

  // const completion = await openaiRus.chat.completions.create({
  //   messages: [{ role: "system", content: "You are a helpful assistant." }],
  //   model: "gpt-3.5-turbo",
  // });

  // console.log("OPEN AI:", completion.choices[0]);

  if (previewToken) {
    configuration.apiKey = previewToken
  }
  const {
    data: { balance }
  } = await supabase.from('users').select('balance').eq('id', userId).single()

  const res = await openai.createChatCompletion({
    model,
    messages,
    temperature: 0.7,
    stream: true
  })
  console.log(res, 'CHAT COMPLETION')

  if (res.status !== 200) {
    const error = await res.json()

    return new Response(JSON.stringify(error), {
      status: res.status,
      headers: { 'content-type': 'application/json' }
    })
  }

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      tokens += encoding.encode(completion).length
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      const isNewChat = !(
        await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('id', id)
      ).count

      if (isNewChat) {
        console.log('REVALIDATING PATH')
        revalidatePath('/')
      }
      // Insert chat into database.
      await supabase.from('chats').upsert({ id, payload }).throwOnError()
      const {
        data: { balance }
      } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()
      await supabase
        .from('users')
        .update({ balance: balance - tokens })
        .eq('id', userId)
      // TODO: fetch profile page
    }
  })

  return new StreamingTextResponse(stream)
}
