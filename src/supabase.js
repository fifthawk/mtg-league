import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://laqbkielditesbbrghwd.supabase.co'
const supabaseKey = 'sb_publishable_Aq5akKZcJ94_N_ljWDtUAA_fhCdENC0'

export const supabase = createClient(supabaseUrl, supabaseKey)