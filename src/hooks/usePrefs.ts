import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export function usePrefs<T>(
  key: string,
  defaultPrefs: T,
): [T, Dispatch<SetStateAction<T>>] {
  const { getItem, setItem } = useAsyncStorage(key)
  const [prefs, setPrefs] = useState<T>(defaultPrefs)
  const [initialRead, setInitialRead] = useState<boolean>(false)

  useEffect(() => {
    if (prefs === undefined) {
      getItem()
        .then((value) => {
          if (value === null) {
            setPrefs({ ...defaultPrefs })
          } else {
            const newPrefs = _.merge(defaultPrefs, ...JSON.parse(value))
            // This approach has a small issue as deeper keys don't get removed.
            // TODO: Fix the problem described above.
            for (key in newPrefs) {
              if (!(key in newPrefs)) delete newPrefs[key]
            }
            setInitialRead(true)
            setPrefs(newPrefs)
          }
        })
        .catch((error) =>
          console.error('Failed to read the storage for key ', key),
        )
    } else {
      if (initialRead) {
        setInitialRead(false)
        return
      }
      setItem(JSON.stringify(prefs))
        .then(() =>
          console.log(
            `Wrote pref ${key}:${JSON.stringify(prefs)} into storage.`,
          ),
        )
        .catch((error) =>
          console.error('Failed to write to storage for key ', key),
        )
    }
  }, [prefs])

  return [prefs, setPrefs]
}
