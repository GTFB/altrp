'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

interface ChartData {
  name: string
  'Dozen': number
  'WalletFactory': number
  'OSMI Cards': number
  'CardPR': number
}

interface CompetitorChartProps {
  data: ChartData[]
}

export function CompetitorChart({ data }: CompetitorChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Radar
          name="Dozen"
          dataKey="Dozen"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
        />
        <Radar
          name="WalletFactory"
          dataKey="WalletFactory"
          stroke="var(--muted-foreground)"
          fill="var(--muted-foreground)"
          fillOpacity={0.2}
        />
        <Radar
          name="OSMI Cards"
          dataKey="OSMI Cards"
          stroke="var(--secondary-foreground)"
          fill="var(--secondary-foreground)"
          fillOpacity={0.2}
        />
        <Radar
          name="CardPR"
          dataKey="CardPR"
          stroke="var(--accent-foreground)"
          fill="var(--accent-foreground)"
          fillOpacity={0.2}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
