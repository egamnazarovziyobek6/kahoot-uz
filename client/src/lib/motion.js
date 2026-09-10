// Umumiy animatsiya variantlari (motion / Framer Motion)

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

export const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
}

// whileInView uchun umumiy sozlama
export const inViewOnce = { once: true, amount: 0.3 }
