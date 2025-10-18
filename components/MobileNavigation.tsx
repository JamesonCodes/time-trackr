'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, FolderOpen, Settings } from 'lucide-react'

export default function MobileNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: BarChart3,
      isActive: pathname.startsWith('/reports')
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: FolderOpen,
      isActive: pathname.startsWith('/projects')
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      isActive: pathname.startsWith('/settings')
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800/95 backdrop-blur-md border-t border-gray-700 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors duration-200 ${
                item.isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
