/** Kichik O'zbekiston bayrog'i belgisi (emoji o'rniga — barcha tizimlarda bir xil ko'rinadi) */
export default function UzFlag({ size = 18, className = '' }) {
  const h = size * 0.68
  return (
    <svg
      viewBox="0 0 30 20"
      width={size}
      height={h}
      className={`inline-block rounded-[3px] ring-1 ring-black/10 ${className}`}
      aria-label="O'zbekiston"
    >
      <rect width="30" height="6.4" y="0" fill="#0099B5" />
      <rect width="30" height="1" y="6.4" fill="#CE1126" />
      <rect width="30" height="5.2" y="7.4" fill="#fff" />
      <rect width="30" height="1" y="12.6" fill="#CE1126" />
      <rect width="30" height="6.4" y="13.6" fill="#1EB53A" />
      <circle cx="6.6" cy="3.4" r="2.3" fill="#fff" />
      <circle cx="7.6" cy="3.4" r="2.3" fill="#0099B5" />
      <g fill="#fff">
        <circle cx="11" cy="2" r="0.5" />
        <circle cx="13.2" cy="2" r="0.5" />
        <circle cx="11" cy="4.2" r="0.5" />
        <circle cx="13.2" cy="4.2" r="0.5" />
        <circle cx="15.4" cy="4.2" r="0.5" />
      </g>
    </svg>
  )
}
