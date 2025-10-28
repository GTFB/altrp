import { ReactNode } from "react"
import { Metadata } from "next"
import AdminAuthGuard from "@/components/admin/AdminAuthGuard"

export const metadata: Metadata = {
  title: {
    template: "%s - Admin Panel",
    default: "Admin Panel",
  },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminAuthGuard>
        <main>{children}</main>
      </AdminAuthGuard>
    </div>
  )
}

