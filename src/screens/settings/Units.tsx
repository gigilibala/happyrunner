import { Theme } from '@react-navigation/native'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet } from 'react-native'
import { SegmentedButtons } from 'react-native-paper'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { useStyles } from '../../hooks/styles'
import { SettingsScreenProps } from '../RootNavigator'

export function Units({}: SettingsScreenProps<'Units'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const { usePrefState } = useContext(PreferencesContext)
  const [{ distance, speed }, setUnits] = usePrefState('units')

  return (
    <SafeAreaView>
      <SegmentedButtons
        value={distance}
        onValueChange={(value) =>
          setUnits((prev) => ({
            ...prev,
            distance: prev.distance === 'kilometers' ? 'miles' : 'kilometers',
          }))
        }
        buttons={[
          {
            value: 'kilometers',
            label: t('kilometers'),
          },
          {
            value: 'miles',
            label: t('miles'),
          },
        ]}
        style={styles.segmentedButton}
      />

      <SegmentedButtons
        value={speed}
        onValueChange={(value) =>
          setUnits((prev) => ({
            ...prev,
            speed: prev.speed === 'pace' ? 'speed' : 'pace',
          }))
        }
        buttons={[
          {
            value: 'pace',
            label: t('pace'),
          },
          {
            value: 'speed',
            label: t('speed'),
          },
        ]}
        style={styles.segmentedButton}
      />
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    segmentedButton: {
      padding: 10,
    },
  })
