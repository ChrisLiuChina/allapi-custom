/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatQuota, formatTokens } from '@/lib/format'

import { getUserUsageSummary } from '../api'
import { getDefaultTimeRange } from '../lib/utils'

const route = getRouteApi('/_authenticated/usage-logs/$section')

export function UserUsageSummaryTable() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const { data, isLoading } = useQuery({
    queryKey: ['user-usage-summary', search],
    queryFn: async () => {
      const defaultRange = getDefaultTimeRange()
      const response = await getUserUsageSummary({
        start_timestamp: Math.floor(
          Number(search.startTime ?? defaultRange.start.getTime()) / 1000
        ),
        end_timestamp: Math.floor(
          Number(search.endTime ?? defaultRange.end.getTime()) / 1000
        ),
        model_name: search.model ? String(search.model) : undefined,
        channel: search.channel ? Number(search.channel) : undefined,
        group: search.group ? String(search.group) : undefined,
      })
      return response.data ?? []
    },
  })

  const items = data ?? []
  return (
    <Card className='min-h-0'>
      <CardHeader className='flex-row items-center gap-2 space-y-0'>
        <Users className='text-muted-foreground size-4' />
        <CardTitle>{t('Usage by User')}</CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('User')}</TableHead>
              <TableHead className='text-right'>{t('Requests')}</TableHead>
              <TableHead className='text-right'>{t('Tokens')}</TableHead>
              <TableHead className='text-right'>{t('Quota')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground py-10 text-center'>
                  {t('Loading...')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-muted-foreground py-10 text-center'>
                  {t('No usage data for the selected filters')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.user_id}>
                  <TableCell className='font-medium'>{item.username}</TableCell>
                  <TableCell className='text-right'>{item.request_count}</TableCell>
                  <TableCell className='text-right'>{formatTokens(item.token_count)}</TableCell>
                  <TableCell className='text-right font-medium'>{formatQuota(item.quota)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
