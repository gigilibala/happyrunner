import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SettingsStackParams } from '../components/navigators/SettingsStack'
import useAudioCues from '../hooks/AudioCues'

type Props = NativeStackScreenProps<SettingsStackParams, 'Audio Cues'>

export function AudioCues({ route, navigation }: Props) {
  const { speak } = useAudioCues()
  const [enabled, setEnabled] = useState<boolean>()

  return <SafeAreaProvider></SafeAreaProvider>
}
