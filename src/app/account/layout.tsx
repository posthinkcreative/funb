
import { Separator } from "@/components/ui/separator"
import { AccountNav } from "./_components/account-nav"


interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="container mx-auto space-y-12 py-12">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <AccountNav />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
