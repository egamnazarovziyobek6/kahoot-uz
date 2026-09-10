/** Anor (pomegranate) — o'zbek naqshining sevimli motivi */
export default function Anor({ size = 56, className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* toj */}
      <path
        d="M50 12 L44 2 L50 8 L56 2 L52 12 Z"
        fill="#1B7A4B"
        stroke="#12213A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M50 20 C46 16 46 12 50 10 C54 12 54 16 50 20 Z" fill="#1B7A4B" />
      {/* meva */}
      <path
        d="M50 18 C74 18 86 40 86 62 C86 88 70 104 50 104 C30 104 14 88 14 62 C14 40 26 18 50 18 Z"
        fill="#E24A3B"
        stroke="#B8382C"
        strokeWidth="2"
      />
      <path d="M50 18 C38 30 34 46 36 66 C38 84 44 96 50 104" stroke="#B8382C" strokeWidth="2" fill="none" opacity="0.5" />
      {/* yorug'lik */}
      <ellipse cx="40" cy="48" rx="10" ry="14" fill="#fff" opacity="0.22" />
      {/* donalar */}
      <g fill="#FBF3E4" opacity="0.9">
        <circle cx="46" cy="62" r="3" />
        <circle cx="58" cy="58" r="3" />
        <circle cx="54" cy="72" r="3" />
        <circle cx="42" cy="76" r="2.6" />
        <circle cx="64" cy="70" r="2.6" />
      </g>
    </svg>
  )
}
