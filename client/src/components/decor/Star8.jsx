/** O'zbek girih uslubidagi 8 qirrali yulduz (ikki kvadratning ustma-ust tushishi) */
export default function Star8({ size = 48, color = '#F5A623', stroke, className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <g fill={color} stroke={stroke ?? 'rgba(0,0,0,0.12)'} strokeWidth={stroke ? 2 : 0}>
        <rect x="18" y="18" width="64" height="64" rx="6" />
        <rect x="18" y="18" width="64" height="64" rx="6" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="12" fill="#fff" opacity="0.35" />
    </svg>
  )
}
