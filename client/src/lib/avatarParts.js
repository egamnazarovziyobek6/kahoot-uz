// Qahramon konstruktori qismlari — foydalanuvchi rangni, bosh kiyimni va yuzni
// alohida tanlab, o'z qahramonini yasaydi (Kahoot uslubida).

export const BODY_COLORS = [
  { id: 'anor', label: 'Anor', value: '#FF4D5E' },
  { id: 'samarkand', label: 'Samarqand', value: '#14B8C7' },
  { id: 'indigo', label: 'Binafsha', value: '#6A5CF5' },
  { id: 'saffron', label: 'Zaʻfaron', value: '#F5A623' },
  { id: 'chaman', label: 'Chaman', value: '#2FD583' },
  { id: 'lola', label: 'Lola', value: '#FF7A45' },
  { id: 'feruza', label: 'Feruza', value: '#33E0E8' },
  { id: 'shafaq', label: 'Shafaq', value: '#F5479A' },
]

export const HATS = [
  { id: 'doppi', label: "Do'ppi" },
  { id: 'cap', label: 'Kepka' },
  { id: 'headband', label: 'Peshonabog‘' },
  { id: 'none', label: "Yo'q" },
]

export const FACES = [
  { id: 'tabassum', label: 'Tabassum' },
  { id: 'tinch', label: 'Tinch' },
  { id: 'salqin', label: 'Salqin' },
  { id: 'ajablanish', label: 'Ajablanish' },
  { id: 'qatiy', label: "Qat'iy" },
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function randomCharacter() {
  return {
    color: rand(BODY_COLORS).value,
    hat: rand(HATS).id,
    face: rand(FACES).id,
  }
}

export const DEFAULT_CHARACTER = {
  color: BODY_COLORS[0].value,
  hat: 'doppi',
  face: 'tabassum',
}
