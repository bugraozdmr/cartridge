'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2Icon, LockIcon, UserIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await login(formData)
      if (result.success) {
        window.location.href = '/'
      } else {
        toast.error(result.error || 'Giriş başarısız.')
        setIsPending(false)
      }
    } catch (error: any) {
      toast.error('Bir hata oluştu.')
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <Card className="border-border bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden">
          <CardHeader className="pt-10 px-8 pb-4">
            <CardTitle className="text-xl">Yönetici Girişi</CardTitle>
            <CardDescription>Lütfen bilgilerinizi giriniz.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Kullanıcı Adı</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    name="username"
                    placeholder="admin"
                    className="h-12 pl-12 rounded-2xl bg-muted/40 border-border/50 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Şifre</label>
                <div className="relative group">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="h-12 pl-12 rounded-2xl bg-muted/40 border-border/50 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                {isPending ? (
                  <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground opacity-50">
          © 2026
        </p>
      </div>
    </div>
  )
}
