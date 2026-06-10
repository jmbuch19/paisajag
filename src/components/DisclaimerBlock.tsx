import { STANDARD_DISCLAIMER } from '@/lib/constants'

export function DisclaimerBlock({ text }: { text?: string }) {
  return <p className="disclaimer">{text ?? STANDARD_DISCLAIMER}</p>
}
