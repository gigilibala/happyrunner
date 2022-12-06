import { createIconSetFromIcoMoon } from 'react-native-vector-icons'
import Icon from 'react-native-vector-icons/FontAwesome5'
import icoMoonConfig from '../../assets/fonts/selection.json'
const IcoMoon = createIconSetFromIcoMoon(icoMoonConfig)

export const ACTIVITY_TYPES = ['running', 'swimming', 'treadmill'] as const
export type ActivityType = typeof ACTIVITY_TYPES[number]

export function ActivityIcon({
  type,
  size,
}: {
  type?: ActivityType
  size: number
}) {
  switch (type) {
    case 'running':
      return <Icon name={'running'} color={'blue'} size={size} />
    case 'swimming':
      return <IcoMoon name={'swimming'} color={'blue'} size={size - 10} />
    case 'treadmill':
      return <IcoMoon name={'treadmill'} color={'blue'} size={size} />
    default:
      return <Icon name={'question'} color={'blue'} size={size} />
  }
}
