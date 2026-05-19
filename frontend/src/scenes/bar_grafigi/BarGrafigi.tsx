// Path: @/scenes/bar_grafigi/BarGrafigi.tsx
import React from 'react'
import bg from '../../assets/sayfayapiasamasi.png'

export default function BarGrafiği() {
  return (
    <div
      className="w-screen h-screen bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Eğer içerik ekleyecekseniz buraya */}
    </div>
  )
}