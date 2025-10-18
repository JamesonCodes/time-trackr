import Dashboard from '@/components/Dashboard'
import TimerBar from '@/components/TimerBar'

export default function Home() {
  return (
    <>
      <Dashboard />
      <TimerBar />
      {/* Add bottom padding for mobile navigation */}
      <div className="h-16 md:hidden" />
    </>
  )
}
