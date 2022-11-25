import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { Props } from '../navigators/RootNavigator'

export function History({}: Props<'History'>) {
  const { t } = useTranslation()
  return (
    <View>
      <Text>{t('test')}</Text>
    </View>
  )
}
