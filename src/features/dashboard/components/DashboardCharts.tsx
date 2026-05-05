'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartData {
  name: string
  total: number
}

interface DashboardChartsProps {
  stockInData: ChartData[]
  stockOutData: ChartData[]
}

export function DashboardCharts({ stockInData, stockOutData }: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in')
  const [isMobile, setIsMobile] = useState(false)
  const data = activeTab === 'in' ? stockInData : stockOutData

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)

    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  return (
    <Card className="border-border bg-card rounded-[2rem] overflow-hidden lg:col-span-2">
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-muted/20 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8 lg:py-6">
        <div className="space-y-2 min-w-0">
          <CardTitle className="text-lg sm:text-xl">Envanter Hareket Analizi</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">
            Aylık bazda ürün giriş ve çıkış trendleri.
          </CardDescription>
        </div>
        <div className="inline-flex w-full rounded-lg bg-muted p-1 sm:w-auto sm:self-start">
          <button
            onClick={() => setActiveTab('in')}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all sm:flex-none sm:py-1",
              activeTab === 'in' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Satın Alım
          </button>
          <button
            onClick={() => setActiveTab('out')}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all sm:flex-none sm:py-1",
              activeTab === 'out' ? "bg-background text-rose-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tüketim
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="h-[240px] w-full sm:h-[280px] lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: isMobile ? 8 : 24, left: isMobile ? -8 : 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradientIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barGradientOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--border), 0.5)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsla(var(--muted-foreground))', fontSize: isMobile ? 10 : 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                hide={isMobile}
                width={isMobile ? 0 : 32}
                tick={{ fill: 'hsla(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)', opacity: 0.4, radius: 8 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{label}</p>
                        <p className={cn("text-lg font-bold", activeTab === 'in' ? "text-emerald-500" : "text-rose-500")}>
                          {activeTab === 'in' 
                            ? Number(payload[0].value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                            : `${payload[0].value || 0} Adet`
                          }
                          {activeTab === 'out' && <span className="text-xs font-normal text-muted-foreground ml-1"></span>}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar 
                dataKey="total" 
                radius={[8, 8, 0, 0]} 
                barSize={isMobile ? 22 : 40}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={activeTab === 'in' ? "url(#barGradientIn)" : "url(#barGradientOut)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
