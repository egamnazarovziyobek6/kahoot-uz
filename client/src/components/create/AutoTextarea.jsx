import { useEffect, useRef } from 'react'

/** Balandligi matnga qarab o'sadigan textarea */
export default function AutoTextarea({ value, minRows = 2, className = '', ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  )
}
