import { ArrowUpRight, Gift, TicketCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRedemption } from '@/features/wallet/hooks/use-redemption'

const SHOP_URL = 'https://pay.ldxp.cn/shop/S1D8STZR'

export function RedemptionCenterContent(props: { onRedeemed?: () => void }) {
  const { t } = useTranslation()
  const [redemptionCode, setRedemptionCode] = useState('')
  const { redeeming, redeemCode } = useRedemption()

  const handleRedeem = async () => {
    const success = await redeemCode(redemptionCode)
    if (success) {
      setRedemptionCode('')
      props.onRedeemed?.()
    }
  }

  return (
    <div className='grid gap-4 lg:grid-cols-[0.9fr_1.1fr]'>
      <div className='border-primary/15 bg-background/75 relative overflow-hidden rounded-xl border p-5 shadow-sm'>
        <Gift className='text-primary/10 absolute -right-5 -top-5 size-28' />
        <div className='relative flex h-full flex-col items-start gap-4'>
          <span className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl'>
            <Gift className='size-5' />
          </span>
          <div>
            <h3 className='text-base font-semibold'>{t('Buy redemption code')}</h3>
            <p className='text-muted-foreground mt-1 text-sm leading-6'>
              {t('Purchase a redemption code in the store, then return here to add it to your account.')}
            </p>
          </div>
          <Button asChild size='lg' className='mt-auto h-12 w-full rounded-xl text-base font-semibold shadow-md shadow-primary/20 sm:w-auto sm:px-6'>
            <a href={SHOP_URL} target='_blank' rel='noreferrer'>
              前往店铺购买
              <ArrowUpRight className='size-5' />
            </a>
          </Button>
        </div>
      </div>

      <div className='bg-background/75 rounded-xl border p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-3'>
          <span className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-10 items-center justify-center rounded-xl'>
            <TicketCheck className='size-5' />
          </span>
          <div>
            <h3 className='text-base font-semibold'>{t('Redeem a code')}</h3>
            <p className='text-muted-foreground text-sm'>
              {t('Enter the code you received after purchase.')}
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Input
            aria-label={t('Redemption code')}
            autoComplete='off'
            className='h-12 rounded-xl bg-background font-mono'
            onChange={(event) => setRedemptionCode(event.target.value)}
            placeholder={t('Enter redemption code')}
            value={redemptionCode}
          />
          <Button
            className='h-12 rounded-xl px-6 font-semibold sm:min-w-32'
            disabled={redeeming || redemptionCode.trim() === ''}
            onClick={handleRedeem}
          >
            {redeeming ? t('Redeeming...') : t('Redeem')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RedemptionCenter() {
  const { t } = useTranslation()
  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Redemption Center')}</SectionPageLayout.Title>
      <SectionPageLayout.Content>
        <div className='mx-auto flex w-full max-w-3xl flex-col'>
          <RedemptionCenterContent />
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
