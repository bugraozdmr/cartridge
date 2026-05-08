'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

interface ReportChartsProps {
  spendByCartridge: { id: string, name: string, total: number }[]
  consumptionByDept: { id: string, name: string, quantity: number, totalValue: number }[]
}

export function ReportCharts({ spendByCartridge, consumptionByDept }: ReportChartsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const deptData = consumptionByDept.slice(0, 6)

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 640)
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:gap-6">
      {/* Spend by Cartridge Bar Chart */}
      <Card className="border-border bg-card/60 rounded-[2rem]">
        <CardHeader>
          <CardTitle>Ürün Bazlı Harcama (₺)</CardTitle>
          <CardDescription>Satın alınan ürünlerin toplam maliyet dağılımı.</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px] sm:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spendByCartridge.slice(0, 6)}
              layout="vertical"
              margin={{ left: isMobile ? 8 : 40, right: isMobile ? 8 : 40 }}
              onClick={(state: any) => {
                const payload = state?.activePayload?.[0]?.payload
                if (payload?.id) router.push(`/cartridges/${payload.id}`)
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsla(var(--border), 0.5)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={isMobile ? 84 : 120}
                tick={{ fill: 'hsla(var(--foreground))', fontSize: isMobile ? 9 : 11 }}
              />
              <Tooltip 
                cursor={{ fill: 'hsla(var(--foreground), 0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border p-3 rounded-xl shadow-[var(--surface-shadow-soft)]">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{label}</p>
                        <p className="text-sm font-bold text-emerald-500">
                          {Number(payload[0].value || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[0, 6, 6, 0]} barSize={isMobile ? 18 : 25} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Consumption by Dept Pie Chart */}
      <Card className="border-border bg-card/60 rounded-[2rem]">
        <CardHeader>
          <CardTitle>Departman Dağılımı</CardTitle>
          <CardDescription>Departmanların tükettiği toplam adet.</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px] sm:h-[300px] lg:h-[350px]">
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 52 : 70}
                  outerRadius={isMobile ? 78 : 100}
                  paddingAngle={5}
                  dataKey="quantity"
                  nameKey="name"
                  onClick={(state: any) => {
                    const payload = state?.payload
                    if (payload?.id) router.push(`/departments/${payload.id}`)
                  }}
                  cursor="pointer"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border border-border p-3 rounded-xl shadow-[var(--surface-shadow-soft)]">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{data.name}</p>
                          <p className="text-sm font-bold text-emerald-500">
                            {data.quantity} adet
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {!isMobile && <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />}
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 text-sm text-muted-foreground">
              Bu dönemde departman dağılımı bulunmuyor.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
