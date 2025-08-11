import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const analytics = await prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calcular totales y promedios
    const totals = analytics.reduce((acc: any, day: any) => ({
      totalConsultations: acc.totalConsultations + day.totalConsultations,
      completedConsultations: acc.completedConsultations + day.completedConsultations,
      cancelledConsultations: acc.cancelledConsultations + day.cancelledConsultations,
      totalRevenue: acc.totalRevenue + day.totalRevenue,
      averageDuration: acc.averageDuration + day.averageDuration,
      activeUsers: Math.max(acc.activeUsers, day.activeUsers)
    }), {
      totalConsultations: 0,
      completedConsultations: 0,
      cancelledConsultations: 0,
      totalRevenue: 0,
      averageDuration: 0,
      activeUsers: 0
    })

    const averageDuration = analytics.length > 0 ? totals.averageDuration / analytics.length : 0

    return NextResponse.json({
      analytics,
      summary: {
        ...totals,
        averageDuration: Math.round(averageDuration),
        completionRate: totals.totalConsultations > 0 ? 
          Math.round((totals.completedConsultations / totals.totalConsultations) * 100) : 0,
        cancellationRate: totals.totalConsultations > 0 ? 
          Math.round((totals.cancelledConsultations / totals.totalConsultations) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
