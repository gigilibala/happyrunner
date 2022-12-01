import Icon from 'react-native-vector-icons/FontAwesome5'

export const ACTIVITY_TYPES = ['running', 'swimming'] as const
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
      return <Icon name={'swimmer'} color={'blue'} size={size - 10} />
    default:
      return <Icon name={'question'} color={'blue'} size={size} />
  }
}
