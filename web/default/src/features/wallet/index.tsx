/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { History } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { RedemptionCenterContent } from '@/features/redemption-center'
import { getSelf } from '@/lib/api'

import { AffiliateRewardsCard } from './components/affiliate-rewards-card'
import { BillingHistoryDialog } from './components/dialogs/billing-history-dialog'
import { WalletStatsCard } from './components/wallet-stats-card'
import { useAffiliate } from './hooks'
import type { UserWalletData } from './types'

interface WalletProps {
  initialShowHistory?: boolean
}

export function Wallet(props: WalletProps) {
  const { t } = useTranslation()
  const [user, setUser] = useState<UserWalletData | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [billingDialogOpen, setBillingDialogOpen] = useState(false)
  const { affiliateLink, loading: affiliateLoading, referralSummary } =
    useAffiliate()

  const fetchUser = useCallback(async () => {
    try {
      setUserLoading(true)
      const response = await getSelf()
      if (response.success && response.data) {
        setUser(response.data as UserWalletData)
      }
    } finally {
      setUserLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (props.initialShowHistory) {
      setBillingDialogOpen(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [props.initialShowHistory])

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>{t('Wallet')}</SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <Button
            variant='outline'
            className='h-10 rounded-full px-4 shadow-sm'
            onClick={() => setBillingDialogOpen(true)}
          >
            <History className='size-4' />
            {t('Order History')}
          </Button>
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 pb-8 sm:gap-8'>
            <WalletStatsCard user={user} loading={userLoading} />

            <section className='relative overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_100%_0%,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.32))] p-4 shadow-sm sm:p-6'>
              <div className='pointer-events-none absolute -right-16 -top-16 size-44 rounded-full border border-primary/10' />
              <div className='relative mb-5 flex flex-col gap-1'>
                <p className='text-primary text-xs font-semibold tracking-[0.16em] uppercase'>
                  Redeem &amp; Top up
                </p>
                <h2 className='text-xl font-semibold tracking-tight'>
                  兑换码服务
                </h2>
                <p className='text-muted-foreground text-sm'>
                  购买兑换码后可立即兑换到当前账户余额。
                </p>
              </div>
              <RedemptionCenterContent onRedeemed={() => void fetchUser()} />
            </section>

            <AffiliateRewardsCard
              referralSummary={referralSummary}
              affiliateLink={affiliateLink}
              loading={affiliateLoading}
            />
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <BillingHistoryDialog
        open={billingDialogOpen}
        onOpenChange={setBillingDialogOpen}
      />
    </>
  )
}
