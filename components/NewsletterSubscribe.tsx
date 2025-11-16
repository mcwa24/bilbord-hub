'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NewsletterSubscribe() {
  return (
    <Link href="/newsletter/prijava">
      <Button className="whitespace-nowrap">
        Prijavi se na newsletter
      </Button>
    </Link>
  )
}

