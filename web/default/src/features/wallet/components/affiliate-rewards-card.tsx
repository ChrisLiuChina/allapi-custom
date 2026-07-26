/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Share2, Sparkles, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Card, CardContent } from '@/components/ui/card'
import { IconBadge } from '@/components/ui/icon-badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'

import type { ReferralSummary } from '../types'

interface AffiliateRewardsCardProps {
  referralSummary: ReferralSummary | null
  affiliateLink: string
  loading?: boolean
}

export function AffiliateRewardsCard({
  referralSummary,
  affiliateLink,
  loading,
}: AffiliateRewardsCardProps) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <Card data-card-hover='false' className='border-primary/15 bg-primary/[0.03] py-0'>
        <CardContent className='grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.8fr_1fr] lg:items-center'>
          <div>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='mt-2 h-4 w-48' />
          </div>
          <Skeleton className='h-14 rounded-lg' />
          <Skeleton className='h-10 rounded-lg' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-card-hover='false' className='border-primary/20 bg-[radial-gradient(circle_at_100%_0%,hsl(var(--primary)/0.18),transparent_38%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--primary)/0.045))] py-0 shadow-sm'>
      <CardContent className='grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.85fr_1fr] lg:items-center'>
        <div className='flex min-w-0 items-start gap-4'>
          <IconBadge tone='chart-3' className='size-12 shrink-0 rounded-2xl'>
            <Share2 className='size-6' />
          </IconBadge>
          <div className='min-w-0'>
            <div className='mb-1 flex items-center gap-2'>
              <h3 className='text-lg font-semibold tracking-tight'>
                {t('Referral Program')}
              </h3>
              <span className='bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold'>
                <Sparkles className='size-3' /> 10%
              </span>
            </div>
            <p className='text-foreground/80 text-sm leading-6 sm:text-base'>
              推荐返利：好友每次成功使用 API，你将获得其实付额度的
              <strong className='text-primary mx-1 font-bold'>10%</strong>
              ，佣金直接到账，无需手动领取。
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 text-center'>
          {[
            [t('Commission'), formatQuota(referralSummary?.total_commission_quota ?? 0)],
            [t('Invites'), String(referralSummary?.invitee_count ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className='bg-background/70 rounded-xl border px-3 py-3'>
              <div className='text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase'>
                {label}
              </div>
              <div className='mt-1 truncate text-lg font-bold tabular-nums'>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-2'>
          <div className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
            <UsersRound className='size-3.5' /> 分享你的专属邀请链接
          </div>
          <div className='flex items-center gap-2'>
            <Input
              value={affiliateLink}
              readOnly
              className='bg-background h-11 min-w-0 flex-1 rounded-xl font-mono text-xs'
            />
            <CopyButton
              value={affiliateLink}
              className='size-11 shrink-0 rounded-xl'
              iconClassName='size-4'
              tooltip={t('Copy referral link')}
              aria-label={t('Copy referral link')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
