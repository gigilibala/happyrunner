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

type DatabaseColumns<Type> = {
  [Property in keyof Type]-?: string
}

const activityInfoTableColumns: DatabaseColumns<Activity> = {
  id: 'id',
  type: 'type',
  status: 'status',
  start_time: 'start_time',
  end_time: 'end_time',
  avg_heart_rate: 'avg_heart_rate',
  max_heart_rate: 'max_heart_rate',
  avg_pace: 'avg_pace',
  total_steps: 'total_steps',
  cadence: 'cadence',
  total_active_time_seconds: 'total_active_time_seconds',
  total_distance: 'total_distance',
}

const createTableScript = `
CREATE TABLE IF NOT EXISTS ${activityInfoTableName}(
  ${activityInfoTableColumns.id} INTEGER PRIMARY KEY NOT NULL,
  ${activityInfoTableColumns.type} TEXT NOT NULL,
  ${activityInfoTableColumns.status} TEXT,
  ${activityInfoTableColumns.start_time} INTEGER,
  ${activityInfoTableColumns.end_time} INTEGER,
  ${activityInfoTableColumns.avg_heart_rate} INTEGER,
  ${activityInfoTableColumns.max_heart_rate} INTEGER,
  ${activityInfoTableColumns.avg_pace} REAL,
  ${activityInfoTableColumns.total_steps} INTEGER,
  ${activityInfoTableColumns.cadence} INTEGER,
  ${activityInfoTableColumns.total_active_time_seconds} INTEGER,
  ${activityInfoTableColumns.total_distance} INTEGER
);

CREATE TABLE IF NOT EXISTS ${activityDataTableName}(
  timestamp INTEGER PRIMARY KEY NOT NULL,
  activity_id INTEGER NOT NULL,
  heartrate INTEGER,
  latitude REAL,
  longitude REAL,
  is_active INTEGER,
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
      (${activityInfoTableColumns.id}, ${activityInfoTableColumns.type}) 
      VALUES (${activity.id}, '${activity.type}')
    `
    db?.transaction((tx) => {
      tx.executeSql(query)
    })
      .then(() => {
        console.log('Activity added to the database.', activity)
      })
      .catch((error) => {
        console.log('Failed to add activity to database: ', error, activity)
      })
  }

  function modifyActivity(activity: Activity): void {
    let columns: Array<string> = []
    type ObjectKey = keyof typeof activity
    for (const key in activity) {
      if (key === activityInfoTableColumns.id) continue
      const value = activity[key as ObjectKey]
      if (typeof value === 'number') {
        columns.push(`${key} = ${value}`)
      } else {
        columns.push(`${key} = '${value}'`)
      }
    }
    const query = `UPDATE ${activityInfoTableName}
      SET ${columns.join(', ')}
      WHERE ${activityInfoTableColumns.id} = ${activity.id}
    `
    db?.transaction((tx) => {
      tx.executeSql(query)
    })
      .then(() => {
        console.log('Activity modified in the database.', activity)
      })
      .catch((error) => {
        console.log('Failed to modify activity in database: ', error, activity)
      })
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
