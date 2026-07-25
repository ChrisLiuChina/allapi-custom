import { createFileRoute } from '@tanstack/react-router'

import { RedemptionCenter } from '@/features/redemption-center'

export const Route = createFileRoute('/_authenticated/redemption/')({
  component: RedemptionCenter,
})
