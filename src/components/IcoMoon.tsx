import { createIconSetFromIcoMoon } from 'react-native-vector-icons'
import icoMoonConfig from '../../assets/fonts/selection.json'

const Icon = createIconSetFromIcoMoon(icoMoonConfig)

export function IcoMoon(props: any) {
  return <Icon {...props} />
}
