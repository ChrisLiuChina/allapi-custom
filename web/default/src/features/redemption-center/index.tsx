import { ExternalLink, Gift } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TitledCard } from '@/components/ui/titled-card'
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
    <div className='flex w-full flex-col gap-4 sm:gap-5'>
          <TitledCard
            title={t('Buy redemption code')}
            description={t('Purchase a redemption code in the store, then return here to add it to your account.')}
            icon={<Gift className='h-4 w-4' />}
            iconTone='success'
            disableHoverEffect
          >
            <div className='flex flex-col gap-3'>
              <Button asChild className='w-full sm:w-fit'>
                <a href={SHOP_URL} target='_blank' rel='noreferrer'>
                  <ExternalLink className='h-4 w-4' />
                  {t('Go to store')}
                </a>
              </Button>
              <a className='break-all text-sm text-muted-foreground underline-offset-4 hover:underline' href={SHOP_URL} target='_blank' rel='noreferrer'>
                {SHOP_URL}
              </a>
            </div>
          </TitledCard>

          <TitledCard
            title={t('Redeem a code')}
            description={t('Enter the code you received after purchase.')}
            icon={<Gift className='h-4 w-4' />}
            iconTone='primary'
            disableHoverEffect
          >
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                aria-label={t('Redemption code')}
                autoComplete='off'
                onChange={(event) => setRedemptionCode(event.target.value)}
                placeholder={t('Enter redemption code')}
                value={redemptionCode}
              />
              <Button
                className='sm:min-w-28'
                disabled={redeeming || redemptionCode.trim() === ''}
                onClick={handleRedeem}
              >
                {redeeming ? t('Redeeming...') : t('Redeem')}
              </Button>
            </div>
          </TitledCard>
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
