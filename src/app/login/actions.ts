'use server'

import { cookies } from 'next/headers'
import { encrypt } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  const validUsername = process.env.ADMIN_USERNAME
  const validPassword = process.env.ADMIN_PASSWORD

  if (username === validUsername && password === validPassword) {
    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const session = await encrypt({ username, expires })

    // Save session in cookie
    const cookieStore = await cookies()
    cookieStore.set('session', session, { 
      expires, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    return { success: true }
  } else {
    return { success: false, error: 'Geçersiz kullanıcı adı veya şifre.' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
