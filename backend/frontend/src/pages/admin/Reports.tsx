import { useState, useEffect } from 'react'
import {
  Download,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  BarChart3,
  FileText,
  ArrowUpRight,
} from 'lucide-react'

import Button from '@/components/ui/Button'

import hotelService from '@/services/hotelService'
import userService from '@/services/userService'
import reservationService, {
  type ReservationResponse,
} from '@/services/reservationService'
import reviewService from '@/services/reviewService'

const money = (n: number) =>
  `LKR ${n.toLocaleString('en-LK')}`

interface ReportData {
  totalHotels: number
  approvedHotels: number
  pendingHotels: number
  rejectedHotels: number
  totalUsers: number
  activeCustomers: number
  totalManagers: number
  totalReservations: number
  completedReservations: number
  pendingReservations: number
  cancelledReservations: number
  grossRevenue: number
  averageRating: number
  bookingConversion: number
  monthlyData: any[]
  hotelPerformance: any[]
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [reportData, setReportData] =
    useState<ReportData | null>(null)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError('')

      const hotelsData = await hotelService.getAllHotels()
      const usersData = await userService.getAllUsers()
      const reservationsData =
        await reservationService.getAllReservations()

      const approvedHotels = hotelsData.filter(
        h => h.registrationStatus === 'APPROVED'
      ).length

      const pendingHotels = hotelsData.filter(
        h => h.registrationStatus === 'PENDING'
      ).length

      const rejectedHotels = hotelsData.filter(
        h => h.registrationStatus === 'REJECTED'
      ).length

      const activeCustomers = usersData.filter(
        u => u.role === 'CUSTOMER' && u.isActive
      ).length

      const totalManagers = usersData.filter(
        u => u.role === 'HOTEL_MANAGER'
      ).length

      const completedReservations =
        reservationsData.filter(
          r => r.status === 'COMPLETED'
        )

      const pendingReservations =
        reservationsData.filter(
          r => r.status === 'PENDING'
        )

      const cancelledReservations =
        reservationsData.filter(
          r => r.status === 'CANCELLED'
        )

      const grossRevenue =
        completedReservations.reduce(
          (sum, r) => sum + r.totalPrice,
          0
        )

      let totalRating = 0
      let ratingCount = 0

      for (const reservation of completedReservations) {
        const reviews =
          await reviewService.getReviewsByHotel(
            reservation.hotelId
          )

        totalRating += reviews.reduce(
          (sum, r) => sum + Number(r.rating),
          0
        )

        ratingCount += reviews.length
      }

      const averageRating =
        ratingCount > 0
          ? Number(
              (
                totalRating / ratingCount
              ).toFixed(1)
            )
          : 0

      const bookingConversion =
        reservationsData.length > 0
          ? Number(
              (
                (completedReservations.length /
                  reservationsData.length) *
                100
              ).toFixed(1)
            )
          : 0

      const monthlyData = getMonthlyData(
        reservationsData,
        completedReservations
      )

      const hotelPerformance =
        getHotelPerformance(
          hotelsData,
          reservationsData,
          completedReservations
        )

      setReportData({
        totalHotels: hotelsData.length,
        approvedHotels,
        pendingHotels,
        rejectedHotels,
        totalUsers: usersData.length,
        activeCustomers,
        totalManagers,
        totalReservations: reservationsData.length,
        completedReservations:
          completedReservations.length,
        pendingReservations:
          pendingReservations.length,
        cancelledReservations:
          cancelledReservations.length,
        grossRevenue,
        averageRating,
        bookingConversion,
        monthlyData,
        hotelPerformance,
      })
    } catch (err: any) {
      console.error(
        'Failed to load report data:',
        err
      )

      setError('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyData = (
    allReservations: ReservationResponse[],
    completedReservations: ReservationResponse[]
  ) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const currentMonth = new Date().getMonth()
    const monthlyData = []

    for (let i = 3; i >= 0; i--) {
      const monthIndex =
        (currentMonth - i + 12) % 12

      const monthName = months[monthIndex]

      const monthReservations =
        allReservations.filter(r => {
          const resDate = new Date(r.createdAt)

          return (
            resDate.getMonth() ===
            monthIndex
          )
        })

      const monthCompleted =
        completedReservations.filter(r => {
          const resDate = new Date(r.createdAt)

          return (
            resDate.getMonth() ===
            monthIndex
          )
        })

      const monthRevenue =
        monthCompleted.reduce(
          (sum, r) => sum + r.totalPrice,
          0
        )

      monthlyData.push({
        month: monthName,
        reservations:
          monthReservations.length,
        completed:
          monthCompleted.length,
        revenue: monthRevenue,
        conversion:
          monthReservations.length > 0
            ? Math.round(
                (monthCompleted.length /
                  monthReservations.length) *
                  100
              )
            : 0,
      })
    }

    return monthlyData
  }

  const getHotelPerformance = (
    hotels: any[],
    allReservations: ReservationResponse[],
    completedReservations: ReservationResponse[]
  ) => {
    return hotels
      .map(hotel => {
        const hotelReservations =
          allReservations.filter(
            r => r.hotelId === hotel.id
          )

        const hotelCompleted =
          completedReservations.filter(
            r => r.hotelId === hotel.id
          )

        const revenue =
          hotelCompleted.reduce(
            (sum, r) => sum + r.totalPrice,
            0
          )

        return {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          reservations:
            hotelReservations.length,
          completed:
            hotelCompleted.length,
          revenue,
          status:
            hotel.registrationStatus,
          conversion:
            hotelReservations.length > 0
              ? Math.round(
                  (hotelCompleted.length /
                    hotelReservations.length) *
                    100
                )
              : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return

    try {
      setGenerating(true)
      setError('')

      const printWindow = window.open(
        '',
        '',
        'width=1000,height=800'
      )

      if (!printWindow) {
        setError('Failed to open print window')
        return
      }

      const currentDate =
        new Date().toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )

      const cancellationRate =
        reportData.totalReservations > 0
          ? (
              (reportData.cancelledReservations /
                reportData.totalReservations) *
              100
            ).toFixed(1)
          : '0.0'

      const maxMonthlyRevenue = Math.max(
        ...reportData.monthlyData.map(
          (item: any) => item.revenue
        ),
        1
      )

      const maxMonthlyReservations =
        Math.max(
          ...reportData.monthlyData.map(
            (item: any) =>
              item.reservations
          ),
          1
        )

      const hotelRows =
        reportData.hotelPerformance.length > 0
          ? reportData.hotelPerformance
              .map(
                (hotel, index) => `
                  <tr>
                    <td>
                      <div class="rank">
                        ${String(index + 1).padStart(2, '0')}
                      </div>
                    </td>

                    <td>
                      <div class="hotel-name">
                        ${hotel.name}
                      </div>
                      <div class="hotel-location">
                        ${hotel.city}
                      </div>
                    </td>

                    <td class="center">
                      ${hotel.reservations}
                    </td>

                    <td class="center">
                      <span class="status success">
                        ${hotel.completed}
                      </span>
                    </td>

                    <td class="right revenue">
                      ${money(hotel.revenue)}
                    </td>

                    <td class="right">
                      <span class="conversion">
                        ${hotel.conversion}%
                      </span>
                    </td>
                  </tr>
                `
              )
              .join('')
          : `
              <tr>
                <td
                  colspan="6"
                  class="empty"
                >
                  No hotel performance data available
                </td>
              </tr>
            `

      const monthlyRows =
        reportData.monthlyData
          .map(
            (row: any) => `
              <tr>
                <td>
                  <strong>
                    ${row.month}
                  </strong>
                </td>

                <td class="center">
                  ${row.reservations}
                </td>

                <td class="center">
                  <span class="status success">
                    ${row.completed}
                  </span>
                </td>

                <td class="right revenue">
                  ${money(row.revenue)}
                </td>

                <td class="right">
                  ${row.conversion}%
                </td>
              </tr>
            `
          )
          .join('')

      const chartRows =
        reportData.monthlyData
          .map(
            (row: any) => {
              const revenueWidth =
                Math.max(
                  (row.revenue /
                    maxMonthlyRevenue) *
                    100,
                  row.revenue > 0
                    ? 4
                    : 0
                )

              const reservationHeight =
                Math.max(
                  (row.reservations /
                    maxMonthlyReservations) *
                    100,
                  row.reservations > 0
                    ? 4
                    : 0
                )

              return `
                <div class="chart-column">
                  <div class="chart-value">
                    ${row.reservations}
                  </div>

                  <div class="chart-track">
                    <div
                      class="chart-bar"
                      style="height:${reservationHeight}%"
                    ></div>
                  </div>

                  <div class="chart-label">
                    ${row.month.substring(0, 3)}
                  </div>

                  <div class="chart-revenue">
                    LKR ${(row.revenue / 1000).toFixed(0)}K
                  </div>

                  <div
                    class="revenue-line"
                    style="width:${revenueWidth}%"
                  ></div>
                </div>
              `
            }
          )
          .join('')

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8" />

<title>
EventStay - Platform Performance Report
</title>

<style>

@page {
  size: A4;
  margin: 14mm 14mm 16mm 14mm;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family:
    Arial,
    Helvetica,
    sans-serif;

  color: #172033;
  background: #ffffff;

  font-size: 10px;
  line-height: 1.5;
}

.page {
  width: 100%;
}

.page-break {
  page-break-before: always;
}

.no-break {
  page-break-inside: avoid;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding-bottom: 18px;
  margin-bottom: 24px;

  border-bottom: 1px solid #dfe4ea;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 38px;
  height: 38px;

  border-radius: 9px;

  background: #102a43;
  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 17px;
  font-weight: 800;
}

.brand-name {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #102a43;
}

.brand-subtitle {
  margin-top: 2px;

  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 1.4px;

  color: #7b8794;
}

.meta {
  text-align: right;
  color: #7b8794;
  font-size: 8px;
}

.meta strong {
  color: #172033;
}

.report-title {
  margin-bottom: 25px;
}

.report-eyebrow {
  color: #b28b27;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.7px;
  margin-bottom: 7px;
}

.report-title h1 {
  margin: 0;

  color: #102a43;

  font-size: 27px;
  line-height: 1.15;
  letter-spacing: -0.7px;
}

.report-title p {
  margin: 8px 0 0;

  color: #697586;
  font-size: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);

  gap: 10px;

  margin-bottom: 23px;
}

.summary-card {
  min-height: 92px;

  border: 1px solid #e2e7ec;
  border-radius: 9px;

  padding: 13px;

  background: #ffffff;
}

.summary-label {
  color: #7b8794;

  font-size: 7px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.summary-value {
  margin-top: 7px;

  color: #102a43;

  font-size: 20px;
  line-height: 1;

  font-weight: 800;
}

.summary-note {
  margin-top: 8px;

  color: #7b8794;
  font-size: 7.5px;
}

.summary-note strong {
  color: #34495e;
}

.section {
  margin-bottom: 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  margin-bottom: 10px;
}

.section-title {
  color: #102a43;

  font-size: 13px;
  font-weight: 800;

  margin: 0;
}

.section-description {
  color: #7b8794;

  font-size: 8px;

  margin-top: 2px;
}

.section-line {
  width: 100%;
  height: 1px;

  background: #e5e9ee;

  margin-bottom: 12px;
}

.kpi-grid {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);

  gap: 10px;
}

.kpi-card {
  border-radius: 9px;

  padding: 14px;

  border: 1px solid #e2e7ec;
}

.kpi-card.blue {
  background: #f5f8fc;
}

.kpi-card.gold {
  background: #fbf9f2;
}

.kpi-card.red {
  background: #fbf6f6;
}

.kpi-label {
  color: #6b7785;

  font-size: 7px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.kpi-value {
  margin-top: 6px;

  font-size: 22px;
  font-weight: 800;

  color: #102a43;
}

.kpi-desc {
  margin-top: 4px;

  color: #7b8794;

  font-size: 8px;
}

.chart-card {
  border: 1px solid #e2e7ec;
  border-radius: 10px;

  padding: 15px;

  background: #ffffff;
}

.chart {
  height: 160px;

  display: flex;
  align-items: flex-end;
  justify-content: space-around;

  gap: 16px;

  padding:
    10px 12px 0;
}

.chart-column {
  position: relative;

  flex: 1;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.chart-track {
  width: 30px;
  height: 105px;

  display: flex;
  align-items: flex-end;

  background: #edf1f5;

  border-radius: 6px 6px 3px 3px;

  overflow: hidden;
}

.chart-bar {
  width: 100%;

  background: #102a43;

  border-radius: 6px 6px 0 0;
}

.chart-value {
  color: #34495e;

  font-size: 8px;
  font-weight: 700;

  margin-bottom: 4px;
}

.chart-label {
  margin-top: 6px;

  color: #34495e;

  font-size: 8px;
  font-weight: 700;
}

.chart-revenue {
  margin-top: 3px;

  color: #8a6a1f;

  font-size: 6.5px;
}

.revenue-line {
  height: 2px;

  background: #b28b27;

  margin-top: 3px;
}

table {
  width: 100%;

  border-collapse: collapse;

  border: 1px solid #e1e6eb;

  border-radius: 8px;

  overflow: hidden;
}

thead {
  background: #102a43;
}

th {
  padding: 9px 8px;

  color: #ffffff;

  font-size: 7px;
  font-weight: 800;

  text-align: left;

  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 9px 8px;

  color: #34495e;

  font-size: 8px;

  border-bottom: 1px solid #edf0f3;
}

tbody tr:nth-child(even) {
  background: #fafbfc;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.rank {
  width: 22px;
  height: 22px;

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f6f1df;

  color: #8a6a1f;

  font-size: 7px;
  font-weight: 800;
}

.hotel-name {
  color: #172033;

  font-size: 8.5px;
  font-weight: 800;
}

.hotel-location {
  margin-top: 1px;

  color: #8994a1;

  font-size: 7px;
}

.revenue {
  color: #102a43;
  font-weight: 800;
}

.status {
  display: inline-block;

  padding: 3px 7px;

  border-radius: 20px;

  font-size: 6.5px;
  font-weight: 800;
}

.status.success {
  color: #216e4e;
  background: #eaf7f0;
}

.conversion {
  display: inline-block;

  padding: 3px 7px;

  border-radius: 20px;

  background: #eef4fa;
  color: #28577f;

  font-size: 6.5px;
  font-weight: 800;
}

.empty {
  text-align: center;
  padding: 25px;

  color: #8a95a2;
}

.insight-box {
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 10px;

  margin-top: 15px;
}

.insight {
  padding: 12px;

  border-radius: 8px;

  border: 1px solid #e3e7eb;

  background: #fafbfc;
}

.insight-title {
  color: #102a43;

  font-size: 8px;
  font-weight: 800;
}

.insight-value {
  margin-top: 4px;

  color: #b28b27;

  font-size: 15px;
  font-weight: 800;
}

.insight-text {
  margin-top: 3px;

  color: #7b8794;

  font-size: 7px;
}

.footer {
  margin-top: 30px;

  padding-top: 12px;

  border-top: 1px solid #dfe4ea;

  display: flex;
  justify-content: space-between;

  color: #8a95a2;

  font-size: 7px;
}

.confidential {
  color: #9a6b6b;
  font-weight: 700;
}

@media print {

  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .page-break {
    page-break-before: always;
  }

  .no-break {
    page-break-inside: avoid;
  }

}

</style>

</head>

<body>

<div class="page">

  <!-- HEADER -->

  <div class="header">

    <div class="brand">

      <div class="brand-mark">
        E
      </div>

      <div>
        <div class="brand-name">
          EventStay
        </div>

        <div class="brand-subtitle">
          Administration Portal
        </div>
      </div>

    </div>

    <div class="meta">
      <div>
        <strong>Platform Analytics Report</strong>
      </div>

      <div>
        Generated ${currentDate}
      </div>

      <div class="confidential">
        CONFIDENTIAL
      </div>
    </div>

  </div>

  <!-- TITLE -->

  <div class="report-title">

    <div class="report-eyebrow">
      Management Report
    </div>

    <h1>
      Platform Performance Report
    </h1>

    <p>
      A consolidated overview of hotels, users,
      reservations, revenue and guest satisfaction.
    </p>

  </div>

  <!-- SUMMARY -->

  <div class="summary-grid">

    <div class="summary-card">
      <div class="summary-label">
        Total Hotels
      </div>

      <div class="summary-value">
        ${reportData.totalHotels}
      </div>

      <div class="summary-note">
        <strong>${reportData.approvedHotels}</strong>
        approved ·
        <strong>${reportData.pendingHotels}</strong>
        pending
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-label">
        Active Customers
      </div>

      <div class="summary-value">
        ${reportData.activeCustomers}
      </div>

      <div class="summary-note">
        <strong>${reportData.totalManagers}</strong>
        managers ·
        <strong>${reportData.totalUsers}</strong>
        total users
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-label">
        Reservations
      </div>

      <div class="summary-value">
        ${reportData.totalReservations}
      </div>

      <div class="summary-note">
        <strong>${reportData.completedReservations}</strong>
        completed ·
        <strong>${reportData.pendingReservations}</strong>
        pending
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-label">
        Gross Revenue
      </div>

      <div class="summary-value"
           style="font-size:16px">
        ${money(reportData.grossRevenue)}
      </div>

      <div class="summary-note">
        From
        <strong>
          ${reportData.completedReservations}
        </strong>
        completed events
      </div>
    </div>

  </div>

  <!-- KPI -->

  <div class="section no-break">

    <div class="section-header">
      <div>
        <h2 class="section-title">
          Key Performance Indicators
        </h2>

        <div class="section-description">
          Current platform-level performance metrics
        </div>
      </div>
    </div>

    <div class="section-line"></div>

    <div class="kpi-grid">

      <div class="kpi-card blue">

        <div class="kpi-label">
          Booking Conversion
        </div>

        <div class="kpi-value">
          ${reportData.bookingConversion.toFixed(1)}%
        </div>

        <div class="kpi-desc">
          Completed reservations as a percentage
          of total reservations
        </div>

      </div>

      <div class="kpi-card gold">

        <div class="kpi-label">
          Average Rating
        </div>

        <div class="kpi-value">
          ${reportData.averageRating.toFixed(1)}
          /5
        </div>

        <div class="kpi-desc">
          Average guest rating across completed
          reservation hotels
        </div>

      </div>

      <div class="kpi-card red">

        <div class="kpi-label">
          Cancellation Rate
        </div>

        <div class="kpi-value">
          ${cancellationRate}%
        </div>

        <div class="kpi-desc">
          ${reportData.cancelledReservations}
          cancelled reservations
        </div>

      </div>

    </div>

  </div>

  <!-- MONTHLY PERFORMANCE -->

  <div class="section no-break">

    <div class="section-header">

      <div>
        <h2 class="section-title">
          Monthly Performance
        </h2>

        <div class="section-description">
          Reservation volume and revenue for the
          latest four months
        </div>
      </div>

    </div>

    <div class="section-line"></div>

    <div class="chart-card">

      <div class="chart">
        ${chartRows}
      </div>

    </div>

  </div>

  <!-- MONTHLY TABLE -->

  <div class="section no-break">

    <div class="section-header">

      <div>
        <h2 class="section-title">
          Monthly Performance Detail
        </h2>

        <div class="section-description">
          Reservation and revenue breakdown
        </div>
      </div>

    </div>

    <div class="section-line"></div>

    <table>

      <thead>

        <tr>

          <th>
            Month
          </th>

          <th style="text-align:center">
            Reservations
          </th>

          <th style="text-align:center">
            Completed
          </th>

          <th style="text-align:right">
            Revenue
          </th>

          <th style="text-align:right">
            Conversion
          </th>

        </tr>

      </thead>

      <tbody>
        ${monthlyRows}
      </tbody>

    </table>

  </div>

  <div class="insight-box no-break">

    <div class="insight">

      <div class="insight-title">
        Platform Revenue
      </div>

      <div class="insight-value">
        ${money(reportData.grossRevenue)}
      </div>

      <div class="insight-text">
        Revenue generated from completed
        reservations.
      </div>

    </div>

    <div class="insight">

      <div class="insight-title">
        Guest Satisfaction
      </div>

      <div class="insight-value">
        ${reportData.averageRating.toFixed(1)}
        / 5
      </div>

      <div class="insight-text">
        Average rating calculated from available
        hotel reviews.
      </div>

    </div>

  </div>

  <div class="footer">

    <div>
      EventStay · Administration Portal
    </div>

    <div>
      Page 1
    </div>

  </div>

</div>


<!-- SECOND PAGE -->

<div class="page page-break">

  <div class="header">

    <div class="brand">

      <div class="brand-mark">
        E
      </div>

      <div>
        <div class="brand-name">
          EventStay
        </div>

        <div class="brand-subtitle">
          Administration Portal
        </div>
      </div>

    </div>

    <div class="meta">

      <div>
        <strong>
          Hotel Performance
        </strong>
      </div>

      <div>
        ${currentDate}
      </div>

    </div>

  </div>

  <div class="report-title">

    <div class="report-eyebrow">
      Property Analytics
    </div>

    <h1>
      Hotel Performance
    </h1>

    <p>
      Top performing hotels ranked by completed
      reservation revenue.
    </p>

  </div>

  <div class="section">

    <div class="section-header">

      <div>

        <h2 class="section-title">
          Top 10 Performing Hotels
        </h2>

        <div class="section-description">
          Ranked according to gross revenue generated
          from completed reservations
        </div>

      </div>

    </div>

    <div class="section-line"></div>

    <table>

      <thead>

        <tr>

          <th>
            Rank
          </th>

          <th>
            Hotel
          </th>

          <th style="text-align:center">
            Reservations
          </th>

          <th style="text-align:center">
            Completed
          </th>

          <th style="text-align:right">
            Revenue
          </th>

          <th style="text-align:right">
            Conversion
          </th>

        </tr>

      </thead>

      <tbody>

        ${hotelRows}

      </tbody>

    </table>

  </div>

  <div class="section">

    <div class="section-header">

      <div>

        <h2 class="section-title">
          Platform Status Summary
        </h2>

        <div class="section-description">
          Current distribution of hotels and reservations
        </div>

      </div>

    </div>

    <div class="section-line"></div>

    <div class="kpi-grid">

      <div class="kpi-card blue">

        <div class="kpi-label">
          Approved Hotels
        </div>

        <div class="kpi-value">
          ${reportData.approvedHotels}
        </div>

        <div class="kpi-desc">
          Currently approved properties
        </div>

      </div>

      <div class="kpi-card gold">

        <div class="kpi-label">
          Pending Hotels
        </div>

        <div class="kpi-value">
          ${reportData.pendingHotels}
        </div>

        <div class="kpi-desc">
          Properties awaiting verification
        </div>

      </div>

      <div class="kpi-card red">

        <div class="kpi-label">
          Rejected Hotels
        </div>

        <div class="kpi-value">
          ${reportData.rejectedHotels}
        </div>

        <div class="kpi-desc">
          Properties with rejected registration
        </div>

      </div>

    </div>

  </div>

  <div class="section">

    <div class="section-header">

      <div>

        <h2 class="section-title">
          Reservation Overview
        </h2>

        <div class="section-description">
          Current reservation status distribution
        </div>

      </div>

    </div>

    <div class="section-line"></div>

    <table>

      <thead>

        <tr>

          <th>
            Status
          </th>

          <th style="text-align:right">
            Reservations
          </th>

          <th style="text-align:right">
            Percentage
          </th>

        </tr>

      </thead>

      <tbody>

        <tr>

          <td>
            <strong>Completed</strong>
          </td>

          <td class="right">
            ${reportData.completedReservations}
          </td>

          <td class="right">
            ${
              reportData.totalReservations > 0
                ? (
                    (reportData.completedReservations /
                      reportData.totalReservations) *
                    100
                  ).toFixed(1)
                : '0.0'
            }%
          </td>

        </tr>

        <tr>

          <td>
            <strong>Pending</strong>
          </td>

          <td class="right">
            ${reportData.pendingReservations}
          </td>

          <td class="right">
            ${
              reportData.totalReservations > 0
                ? (
                    (reportData.pendingReservations /
                      reportData.totalReservations) *
                    100
                  ).toFixed(1)
                : '0.0'
            }%
          </td>

        </tr>

        <tr>

          <td>
            <strong>Cancelled</strong>
          </td>

          <td class="right">
            ${reportData.cancelledReservations}
          </td>

          <td class="right">
            ${cancellationRate}%
          </td>

        </tr>

      </tbody>

    </table>

  </div>

  <div class="footer">

    <div>
      EventStay · Platform Performance Report
    </div>

    <div>
      Page 2
    </div>

  </div>

</div>

</body>
</html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 500)
    } catch (err) {
      console.error(
        'Error generating PDF:',
        err
      )

      setError(
        'Failed to generate PDF'
      )
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fb] px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="mb-10 space-y-3">
            <div className="h-3 w-28 rounded bg-slate-200" />
            <div className="h-10 w-72 rounded bg-slate-200" />
            <div className="h-4 w-[500px] max-w-full rounded bg-slate-200" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="h-40 rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="mt-6 h-72 rounded-2xl bg-slate-200" />

          <div className="mt-6 h-80 rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fb] px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h3 className="font-bold text-red-900">
                  Unable to load reports
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error || 'Failed to load report data'}
                </p>

                <button
                  onClick={loadReportData}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    )
  }

  const cancellationRate =
    reportData.totalReservations > 0
      ? (
          (reportData.cancelledReservations /
            reportData.totalReservations) *
          100
        ).toFixed(1)
      : '0.0'

  const maxRevenue = Math.max(
    ...reportData.monthlyData.map(
      item => item.revenue
    ),
    1
  )

  return (
    <div className="min-h-screen bg-[#f8f9fb] px-6 py-8 lg:px-10">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
              <BarChart3 className="h-4 w-4" />
              Analytics & Reporting
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Platform Reports
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Comprehensive platform performance
              and analytics across hotels,
              users and reservations.
            </p>

          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />

            {generating
              ? 'Preparing Report...'
              : 'Download PDF Report'}
          </button>

        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-900">
                Report Error
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

          </div>
        )}

        <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <ReportCard
            icon={<Building2 className="h-5 w-5" />}
            iconClass="bg-blue-50 text-blue-600"
            label="Total Hotels"
            value={reportData.totalHotels}
            footer={
              <>
                <span className="font-semibold text-emerald-600">
                  {reportData.approvedHotels}
                </span>{' '}
                approved
                <span className="mx-1 text-slate-300">
                  ·
                </span>
                <span className="font-semibold text-amber-600">
                  {reportData.pendingHotels}
                </span>{' '}
                pending
              </>
            }
          />

          <ReportCard
            icon={<Users className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-600"
            label="Active Customers"
            value={reportData.activeCustomers}
            footer={
              <>
                <span className="font-semibold text-blue-600">
                  {reportData.totalManagers}
                </span>{' '}
                managers
                <span className="mx-1 text-slate-300">
                  ·
                </span>
                {reportData.totalUsers} total users
              </>
            }
          />

          <ReportCard
            icon={<Calendar className="h-5 w-5" />}
            iconClass="bg-violet-50 text-violet-600"
            label="Total Reservations"
            value={reportData.totalReservations}
            footer={
              <>
                <span className="font-semibold text-emerald-600">
                  {reportData.completedReservations}
                </span>{' '}
                completed
                <span className="mx-1 text-slate-300">
                  ·
                </span>
                <span className="font-semibold text-amber-600">
                  {reportData.pendingReservations}
                </span>{' '}
                pending
              </>
            }
          />

          <ReportCard
            icon={<DollarSign className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600"
            label="Gross Revenue"
            value={money(reportData.grossRevenue)}
            valueSmall
            footer={
              <>
                From{' '}
                <span className="font-semibold text-slate-700">
                  {reportData.completedReservations}
                </span>{' '}
                completed events
              </>
            }
          />

        </div>

        <div className="mb-6 grid gap-5 lg:grid-cols-3">

          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Booking Conversion"
            value={`${reportData.bookingConversion.toFixed(1)}%`}
            description="Completed reservations compared with total reservations"
            type="blue"
          />

          <MetricCard
            icon={
              <Star className="h-5 w-5 fill-current" />
            }
            title="Average Rating"
            value={`${reportData.averageRating.toFixed(1)}/5`}
            description="Average guest satisfaction across reviewed hotels"
            type="gold"
          />

          <MetricCard
            icon={<XCircle className="h-5 w-5" />}
            title="Cancellation Rate"
            value={`${cancellationRate}%`}
            description={`${reportData.cancelledReservations} total cancelled reservations`}
            type="red"
          />

        </div>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">

            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />

                <h2 className="text-lg font-bold text-slate-900">
                  Monthly Performance
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Reservation and revenue trends
                for the latest four months.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Last 4 months
            </span>

          </div>

          <div className="p-6 lg:p-7">

            <div className="mb-8 h-56">

              <div className="flex h-full items-end gap-5 border-b border-l border-slate-200 px-4 pb-0">

                {reportData.monthlyData.map(
                  (row: any) => {

                    const height =
                      Math.max(
                        (row.revenue /
                          maxRevenue) *
                          100,
                        row.revenue > 0
                          ? 5
                          : 0
                      )

                    return (
                      <div
                        key={row.month}
                        className="group flex h-full flex-1 flex-col justify-end"
                      >

                        <div className="relative flex flex-1 items-end justify-center">

                          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                            {money(row.revenue)}
                            <br />
                            {row.reservations}{' '}
                            reservations
                          </div>

                          <div
                            className="w-full max-w-16 rounded-t-xl bg-slate-900 transition-all duration-300 group-hover:bg-amber-600"
                            style={{
                              height: `${height}%`,
                              minHeight:
                                row.revenue > 0
                                  ? '8px'
                                  : '0px',
                            }}
                          />
                        </div>

                        <div className="mt-3 text-center">
                          <p className="text-xs font-semibold text-slate-700">
                            {row.month.substring(
                              0,
                              3
                            )}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {row.reservations}{' '}
                            bookings
                          </p>
                        </div>

                      </div>
                    )
                  }
                )}

              </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Month
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Reservations
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Completed
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Revenue
                      </th>

                      <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Conversion
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {reportData.monthlyData.map(
                      (row: any) => (
                        <tr
                          key={row.month}
                          className="transition hover:bg-slate-50/70"
                        >

                          <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                            {row.month}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-slate-600">
                            {row.reservations}
                          </td>

                          <td className="px-5 py-4 text-right">

                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              {row.completed}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                            {money(row.revenue)}
                          </td>

                          <td className="px-5 py-4 text-right">

                            <div className="flex items-center justify-end gap-3">

                              <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">

                                <div
                                  className="h-full rounded-full bg-amber-500"
                                  style={{
                                    width: `${Math.min(
                                      row.conversion,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-xs font-bold text-slate-700">
                                {row.conversion}%
                              </span>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">

            <div>

              <div className="flex items-center gap-2">

                <Building2 className="h-5 w-5 text-amber-600" />

                <h2 className="text-lg font-bold text-slate-900">
                  Top Performing Hotels
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Hotels ranked by revenue generated
                from completed reservations.
              </p>

            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Revenue ranking
            </span>

          </div>

          <div className="p-6 lg:p-7">

            {reportData.hotelPerformance.length > 0 ? (

              <div className="overflow-hidden rounded-2xl border border-slate-200">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[800px]">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Hotel
                        </th>

                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Location
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Reservations
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Completed
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Revenue
                        </th>

                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Conversion
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {reportData.hotelPerformance.map(
                        (hotel, idx) => (
                          <tr
                            key={hotel.id}
                            className="transition hover:bg-slate-50/70"
                          >

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xs font-bold text-amber-700">
                                  {String(
                                    idx + 1
                                  ).padStart(
                                    2,
                                    '0'
                                  )}
                                </div>

                                <div>

                                  <p className="text-sm font-bold text-slate-900">
                                    {hotel.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {hotel.status}
                                  </p>

                                </div>

                              </div>

                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {hotel.city}
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                              {hotel.reservations}
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                {hotel.completed}
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                              {money(
                                hotel.revenue
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                {hotel.conversion}%
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            ) : (

              <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No hotel performance data
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Hotel performance information
                  will appear here when available.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>

    </div>
  )
}

/* =========================================================
   COMPONENTS
========================================================= */

function ReportCard({
  icon,
  iconClass,
  label,
  value,
  footer,
  valueSmall = false,
}: {
  icon: React.ReactNode
  iconClass: string
  label: string
  value: React.ReactNode
  footer: React.ReactNode
  valueSmall?: boolean
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />

      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 font-bold tracking-tight text-slate-900 ${
          valueSmall
            ? 'text-xl'
            : 'text-3xl'
        }`}
      >
        {value}
      </p>

      <p className="mt-3 text-xs text-slate-500">
        {footer}
      </p>

    </div>
  )
}

function MetricCard({
  icon,
  title,
  value,
  description,
  type,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  type: 'blue' | 'gold' | 'red'
}) {
  const styles = {
    blue: {
      wrapper:
        'border-blue-100 bg-blue-50/60',
      icon:
        'bg-blue-100 text-blue-700',
      value:
        'text-blue-900',
      title:
        'text-blue-900',
      description:
        'text-blue-700/70',
    },

    gold: {
      wrapper:
        'border-amber-100 bg-amber-50/60',
      icon:
        'bg-amber-100 text-amber-700',
      value:
        'text-amber-900',
      title:
        'text-amber-900',
      description:
        'text-amber-700/70',
    },

    red: {
      wrapper:
        'border-red-100 bg-red-50/60',
      icon:
        'bg-red-100 text-red-700',
      value:
        'text-red-900',
      title:
        'text-red-900',
      description:
        'text-red-700/70',
    },
  }

  const style = styles[type]

  return (
    <div
      className={`rounded-2xl border p-6 ${style.wrapper}`}
    >

      <div className="flex items-start justify-between">

        <div>
          <p
            className={`text-sm font-bold ${style.title}`}
          >
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.icon}`}
        >
          {icon}
        </div>

      </div>

      <p
        className={`mt-4 text-xs leading-5 ${style.description}`}
      >
        {description}
      </p>

    </div>
  )
}