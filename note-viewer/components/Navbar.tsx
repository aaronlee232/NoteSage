import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
// import { Icons } from '@/components/icons'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { ChevronRight, LucideScrollText } from 'lucide-react'
import { Button } from './ui/button'
import { useSidebarStore } from '@/lib/stores'

export function Navbar() {
  const { show, setShow } = useSidebarStore((store) => store)

  return (
    <div className='h-[8vh] px-10 py-2 flex flex-row items-center justify-between border-b border-gray-300'>
      <Button
        variant='outline'
        size='icon'
        className='md:hidden'
        onClick={() => {
          setShow(true)
        }}
      >
        <ChevronRight className='h-4 w-4' />
      </Button>

      {/* NoteSage Logo */}
      <h1 className='text-xl font-medium'>NoteSage AI</h1>

      {/* Navigation items */}
      <NavigationMenu>
        <NavigationMenuList>
          {/* Link to documentation */}
          <NavigationMenuItem>
            {/* On Desktop/Tablet: Display text link */}
            <div className='hidden md:block'>
              <Link href='/' legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Back to Notes
                </NavigationMenuLink>
              </Link>
            </div>

            {/* On Mobile: Display an icon link */}
            <div className='md:hidden'>
              <Link href='/' legacyBehavior passHref>
                <Button variant='outline' size='icon'>
                  <LucideScrollText className='h-4 w-4' />
                </Button>
              </Link>
            </div>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'
