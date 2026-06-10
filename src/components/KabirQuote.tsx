import {
  KABIR_DOHA_HINDI,
  KABIR_DOHA_ATTRIBUTION,
  KABIR_DOHA_ENGLISH,
} from '@/lib/constants'

export function KabirQuote({ quiet = false }: { quiet?: boolean }) {
  return (
    <figure
      className={
        quiet
          ? 'text-center'
          : 'card card-warm py-6 text-center'
      }
    >
      <blockquote className="kabir-quote whitespace-pre-line" lang="hi">
        {KABIR_DOHA_HINDI}
      </blockquote>
      <figcaption className="mt-2 text-sm text-amber-800 font-serif">
        {KABIR_DOHA_ATTRIBUTION}
      </figcaption>
      {!quiet && (
        <p className="mt-3 text-sm text-amber-800 italic font-serif">
          {KABIR_DOHA_ENGLISH}
        </p>
      )}
    </figure>
  )
}
