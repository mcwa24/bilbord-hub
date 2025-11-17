import Link from 'next/link'
import Image from 'next/image'
import { PRRelease } from '@/types'
import { formatDate } from '@/lib/utils'
import Card from './ui/Card'

interface ReleaseCardProps {
  release: PRRelease
}

export default function ReleaseCard({ release }: ReleaseCardProps) {
  return (
    <Link href={`/saopstenje/${release.id}`}>
      <Card className="h-full cursor-pointer">
        {release.thumbnail_url && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={release.thumbnail_url}
              alt={release.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-[#1d1d1f] mb-2 line-clamp-2">
            {release.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            <strong>{release.company_name}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {release.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {release.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-black text-white rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(release.published_at || release.created_at)}</span>
            <span>{release.industry}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

