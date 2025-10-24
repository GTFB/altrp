import { ReactNode } from "react"
import AdminAuthGuard from "@/components/admin/AdminAuthGuard"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminAuthGuard>
        <main>{children}</main>
      </AdminAuthGuard>
    </div>
  )
}

