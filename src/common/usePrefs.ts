import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

export default function usePrefs<T>(
  key: string,
  defaultPrefs?: T,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const { getItem, setItem } = useAsyncStorage(key)
  const [prefs, setPrefs] = useState<T>()
  const [initialRead, setInitialRead] = useState<boolean>(false)

  useEffect(() => {
    if (prefs === undefined) {
      getItem()
        .then((value) => {
          if (value === null) {
            if (defaultPrefs !== undefined) setPrefs(defaultPrefs)
          } else {
            setInitialRead(true)
            setPrefs(JSON.parse(value) as T)
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
        .then(() => console.log(`Wrote pref ${key} into storage.`))
        .catch((error) =>
          console.error('Failed to write to storage for key ', key),
        )
    }
  }, [prefs])

  return [prefs, setPrefs]
}
