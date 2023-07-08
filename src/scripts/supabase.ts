import { createClient } from '@supabase/supabase-js'
import { ApiError } from 'next/dist/server/api-utils'
import { HttpStatusCode } from 'axios'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new ApiError(
    HttpStatusCode.InternalServerError,
    'Supabase config variables undefined'
  )
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
