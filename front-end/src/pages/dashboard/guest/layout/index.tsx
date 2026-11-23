import { Outlet } from 'react-router'
import { Footer } from '@/components/common/footer'
import { GuestHeader } from '@/components/common/header'


export default function GuestLayout() {
  return (
    <>
      <GuestHeader />
      <Outlet />
      <Footer />
    </>
  )
}
