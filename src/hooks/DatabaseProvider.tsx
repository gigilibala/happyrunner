import React, { createContext, ReactNode, useEffect, useState } from 'react'
import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage'

const databaseName = 'user-data.db'
const activityInfoTableName = 'activity_info'

const createTableScript = `
CREATE TABLE IF NOT EXISTS ${activityInfoTableName}(
    id INTEGER PRIMARY KEY NOT NULL,
    type STRING NOT NULL,
    average_hr INTEGER,
    average_pace REAL 
);
`

enablePromise(true)

interface IDatabaseApi {
  startActivity(): void
}

function useDatabase(): IDatabaseApi {
  const [db, setDb] = useState<SQLiteDatabase>()
  const [activityId, setActivityId] = useState<number>()
  //   const [assets] = useAssets([])

  useEffect(() => {
    openDatabase({ name: databaseName, location: 'default' }).then((db) => {
      setDb(db)
      return createTables(db)
    })

    return () => {
      console.log('Closing database connection!')
      db?.close()
    }
  }, [])

  function createTables(db: SQLiteDatabase) {
    db.transaction((tx) => {
      tx.executeSql(createTableScript)
    })
      .then(() => {
        console.log('Tables created.')
      })
      .catch((error) => {
        console.error('Failed to create/alter tables: ', error)
      })
  }

  function startActivity() {
    const time = new Date().getTime()
    setActivityId(time)
    const query = `INSERT INTO ${activityInfoTableName}
    (id, type) VALUES (?, ?)
    `
    db?.transaction((tx) => {
      tx.executeSql(query, [time, 'running'])
    })
      .then(() => {
        console.log('item added to database')
      })
      .catch((error) => {
        console.log('Failed to add item to database: ', error)
      })
  }

  return { startActivity }
}

export const DatabaseContext = createContext<IDatabaseApi>({} as IDatabaseApi)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const state = useDatabase()

  return (
    <DatabaseContext.Provider value={state}>
      {children}
    </DatabaseContext.Provider>
  )
}
