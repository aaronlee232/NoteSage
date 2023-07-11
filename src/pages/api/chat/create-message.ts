import { supabase } from '@/scripts/supabase'

export const addMessageToChatDB = async (message: Message) => {
  const { error: insertMessageError, data: newMessage } = await supabase
    .from('message')
    .insert(message)
    .select()
    .maybeSingle()

  if (insertMessageError) {
    throw insertMessageError
  }

  return newMessage
}
