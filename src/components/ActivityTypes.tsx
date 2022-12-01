import Icon from 'react-native-vector-icons/FontAwesome5'

export type ActivityType = 'running' | 'swimming'

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
      return <Icon name={'swimmer'} color={'blue'} size={size} />
    default:
      return <Icon name={'question'} color={'blue'} size={size} />
  }
}
