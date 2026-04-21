import type { IconComponent } from './components/icons'
import {
  Bed,
  FirstAidKit,
  Flask,
  HardDrives,
  Headset,
  IdentificationCard,
  Tree,
} from '@phosphor-icons/react'

/**
 * Персона — кто целевая аудитория для venue.
 * campus     — кампус НГУ (серверная, общежитие, КПП, лаборатория Технопарка)
 * city       — городская инфраструктура Новосибирска (клиника, рекреация Академгородка)
 * municipal  — муниципальные службы (ЕДДС Кольцово)
 */
export type Persona = 'campus' | 'city' | 'municipal'

export const personaLabel: Record<Persona, string> = {
  campus: 'Кампус НГУ',
  city: 'Город',
  municipal: 'Муниципалитет',
}

export interface VenueMeta {
  id: string
  label: string
  district: string
  persona: Persona
  icon: IconComponent
  shortDescription: string
}

export const venues: Record<string, VenueMeta> = {
  'ngu-server': {
    id: 'ngu-server',
    label: 'Серверная НГУ',
    district: 'Академгородок',
    persona: 'campus',
    icon: HardDrives,
    shortDescription: 'Вычислительный центр университета, сетевое ядро и серверные стойки',
  },
  'ngu-dormitory': {
    id: 'ngu-dormitory',
    label: 'Общежитие кампуса НГУ, блок Б',
    district: 'Академгородок',
    persona: 'campus',
    icon: Bed,
    shortDescription: 'Жилой блок первой очереди кампуса, 345 мест',
  },
  'ngu-checkpoint': {
    id: 'ngu-checkpoint',
    label: 'КПП учебного корпуса НГУ',
    district: 'Академгородок',
    persona: 'campus',
    icon: IdentificationCard,
    shortDescription: 'Контрольно-пропускной пункт с видеоаналитикой и историей проходов',
  },
  'ngu-lab': {
    id: 'ngu-lab',
    label: 'Лаборатория 14Л-2 Технопарка НГУ',
    district: 'Академгородок',
    persona: 'campus',
    icon: Flask,
    shortDescription: 'Режимное помещение с ограниченным доступом и чувствительными материалами',
  },
  'city-clinic': {
    id: 'city-clinic',
    label: 'Клиника Мешалкина',
    district: 'Центральный контур',
    persona: 'city',
    icon: FirstAidKit,
    shortDescription: 'Опорный городской стационар с непрерывным клиническим и инженерным контуром',
  },
  'academ-forest': {
    id: 'academ-forest',
    label: 'Лес Академгородка',
    district: 'Академгородок',
    persona: 'city',
    icon: Tree,
    shortDescription: 'Рекреационная и природоохранная зона рядом с жилой и учебной застройкой',
  },
  'koltsovo-edds': {
    id: 'koltsovo-edds',
    label: 'ЕДДС МКУ «СВЕТОЧ», р.п. Кольцово',
    district: 'р.п. Кольцово',
    persona: 'municipal',
    icon: Headset,
    shortDescription: 'Муниципальная единая дежурно-диспетчерская служба, координация ДДС и «112»',
  },
}

export const listVenuesByPersona = (persona: Persona | null): VenueMeta[] =>
  Object.values(venues).filter((venue) => persona === null || venue.persona === persona)

export const getVenue = (venueId: string | undefined): VenueMeta | null => {
  if (!venueId) return null
  return venues[venueId] ?? null
}
