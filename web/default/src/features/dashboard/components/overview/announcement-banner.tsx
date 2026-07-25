/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { Megaphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAnnouncements } from '@/features/dashboard/hooks/use-status-data'
import { getPreviewText } from '@/features/dashboard/lib'
import type { AnnouncementItem } from '@/features/dashboard/types'
import { getAnnouncementColorClass } from '@/lib/colors'
import { cn } from '@/lib/utils'

import { AnnouncementDetailModal } from './announcement-detail-dialog'

// This deliberately returns nothing until there is a real announcement, so a
// quiet dashboard keeps the same compact layout without an empty placeholder.
export function AnnouncementBanner() {
  const { t } = useTranslation()
  const { items, loading } = useAnnouncements()
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null)

  if (loading || items.length === 0) {
    return null
  }

  const announcement = items[0]
  const preview = getPreviewText(announcement.content)

  return (
    <>
      <button
        type='button'
        onClick={() => setSelectedAnnouncement(announcement)}
        className='border-border/70 bg-card hover:bg-muted/40 mx-auto flex w-full max-w-3xl items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm transition-colors'
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-white',
            getAnnouncementColorClass(announcement.type)
          )}
        >
          <Megaphone className='size-4' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='text-muted-foreground block text-xs font-medium'>
            {t('Announcements')}
          </span>
          <span className='block line-clamp-1 text-sm font-medium'>
            {preview || t('Click for details')}
          </span>
        </span>
        {items.length > 1 && (
          <span className='text-muted-foreground shrink-0 text-xs'>
            {items.length}
          </span>
        )}
      </button>

      <AnnouncementDetailModal
        open={selectedAnnouncement !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAnnouncement(null)
        }}
        announcement={selectedAnnouncement}
      />
    </>
  )
}
