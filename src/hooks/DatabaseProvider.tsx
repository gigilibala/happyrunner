import React, { createContext, ReactNode, useEffect, useState } from 'react'
import {
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage'
import { Activity } from './Activity'

const databaseName = 'user-data.db'
const activityInfoTableName = 'activity_info'
const activityDataTableName = 'activity_data'

const dropTableScript = `
DROP TABLE IF EXISTS ${activityInfoTableName};
DROP TABLE IF EXISTS ${activityDataTableName};
`

const createTableScript = `
CREATE TABLE IF NOT EXISTS ${activityInfoTableName}(
    id INTEGER PRIMARY KEY NOT NULL,
    type STRING NOT NULL,
    status STRING NOT NULL,
    start_time INTEGER,
    end_time INTEGER,
    avg_heartrate INTEGER,
    max_heartrate INTEGER,
    avg_pace REAL,
    total_steps INTEGER,
    cadence INTEGER,
    total_active_time_seconds INTEGER,
    total_distance INTEGER
);

CREATE TABLE IF NOT EXISTS ${activityDataTableName}(
  timestamp INTEGER PRIMARY KEY NOT NULL,
  activity_id INTEGER NOT NULL,
  heartrate INTEGER,
  latitude REAL,
  longitude REAL,
  FOREIGN KEY(activity_id) REFERENCES ${activityInfoTableName}(id)
);
`

enablePromise(true)

interface IDatabaseApi {
  addActivity(activity: Activity): void
  modifyActivity(activity: Activity): void
}

function useDatabase(): IDatabaseApi {
  const [db, setDb] = useState<SQLiteDatabase>()

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

  function addActivity(activity: Activity): void {
    const query = `INSERT INTO ${activityInfoTableName}
      (id, status, type, start_time) VALUES (?, ?, ?, ?)
      `
    db?.transaction((tx) => {
      tx.executeSql(query, [
        activity.id,
        activity.status,
        activity.type,
        activity.start_time?.getTime(),
      ])
    })
      .then(() => {
        console.log('Activity added to the database.')
      })
      .catch((error) => {
        console.log('Failed to add activity to database: ', error)
      })
  }

  function modifyActivity(activity: Activity): void {
    console.log('Modifying the activity.')
  }

  return { addActivity, modifyActivity }
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
