'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  // data from form
  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=' + encodeURIComponent('Neplatný e-mail nebo heslo'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=' + encodeURIComponent('Nepodařilo se vytvořit účet: ' + error.message))
  }

  redirect('/login?message=' + encodeURIComponent('✅ Účet vytvořen! Zkontrolujte svůj e-mail a potvrďte registraci kliknutím na odkaz, který jsme vám zaslali.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
