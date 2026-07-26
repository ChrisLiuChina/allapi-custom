import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/redemption/')({
  beforeLoad: () => {
    throw redirect({ to: '/wallet' })
  },
})
