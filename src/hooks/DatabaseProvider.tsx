import { createContext, ReactNode, useEffect, useState } from 'react'
import {
  DatabaseParams,
  deleteDatabase,
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage'
import { Activity, ActivityData } from './Activity'

const databaseName = 'user-data.db'
const activityInfoTableName = 'activity_info'
const activityDataTableName = 'activity_data'

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

const activityDataTableColumns: DatabaseColumns<ActivityData> = {
  timestamp: 'timestamp',
  activity_id: 'activity_id',
  heart_rate: 'heart_rate',
  latitude: 'latitude',
  longitude: 'longitude',
  status: 'status',
}

const createInfoTableScript = `
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
`
const createDataTableScript = `
CREATE TABLE IF NOT EXISTS ${activityDataTableName}(
  ${activityDataTableColumns.timestamp} INTEGER PRIMARY KEY NOT NULL,
  ${activityDataTableColumns.activity_id} INTEGER NOT NULL,
  ${activityDataTableColumns.heart_rate} INTEGER,
  ${activityDataTableColumns.latitude} REAL,
  ${activityDataTableColumns.longitude} REAL,
  ${activityDataTableColumns.status} TEXT,
  FOREIGN KEY(${activityDataTableColumns.activity_id}) REFERENCES ${activityInfoTableName}(${activityInfoTableColumns.id})
);
`

enablePromise(true)

interface IDatabaseApi {
  addActivity: (activity: Activity) => void
  modifyActivity: (activity: Activity) => void
  addActivityData: (data: ActivityData) => void

  // Mostly for advanced users.
  clearDatabase: () => void
}

function useDatabase(): IDatabaseApi {
  const [db, setDb] = useState<SQLiteDatabase>()
  const dbParams: DatabaseParams = { name: databaseName, location: 'default' }

  useEffect(() => {
    if (db === undefined) openDatabase(dbParams).then((db) => setDb(db))
    else createTables()
  }, [db])

  function batchSqlTransactions(
    statements: { statement: string; params?: any[] }[],
  ) {
    return Promise.all(
      statements.map(async (s) => await db?.executeSql(s.statement, s.params)),
    )
  }

  function createTables() {
    batchSqlTransactions([
      { statement: createInfoTableScript },
      { statement: createDataTableScript },
    ]).then(() => console.log('Tables created!'))
  }

  function clearDatabase(): void {
    // TODO(gigilibala): Make it such that we re-create the database after deleting it.
    db?.close()
      .then(() => deleteDatabase(dbParams))
      .then(() => console.log('Database deleted.'))
      .then(() => setDb(undefined))
      .catch((error) => console.error('Failed to delete database: ', error))
  }

  function addActivity(activity: Activity): void {
    const query = `INSERT INTO ${activityInfoTableName}
      (${activityInfoTableColumns.id}, ${activityInfoTableColumns.type}) 
      VALUES (${activity.id}, '${activity.type}')
    `
    db?.transaction((tx) => tx.executeSql(query))
      .then(() => console.log('Activity added to the database.', activity))
      .catch((error) =>
        console.log('Failed to add activity to database: ', error, activity),
      )
  }

  function modifyActivity(activity: Activity): void {
    const partialActivity: Partial<typeof activity> = { ...activity }
    delete partialActivity.id
    const columns = Object.keys(partialActivity).map((key) => `${key} = ?`)
    const query = `UPDATE ${activityInfoTableName}
      SET ${columns.join(', ')}
      WHERE ${activityInfoTableColumns.id} = ${activity.id}
    `
    db?.executeSql(query, Object.values(partialActivity))
      .then(() => console.log('Activity modified in the database.', activity))
      .catch((error) =>
        console.log('Failed to modify activity in database: ', error, activity),
      )
  }

  function addActivityData(data: ActivityData): void {
    const keys = Object.keys(data)
    const query = `INSERT INTO ${activityDataTableName}
      (${keys.join(', ')})
      VALUES (${Array(keys.length).fill('?').join(', ')})
    `
    db?.executeSql(query, Object.values(data))
      .then(() => console.log('Activity added to the database.', data))
      .catch((error) =>
        console.log('Failed to add activity to database: ', error, data),
      )
  }

  return { addActivity, modifyActivity, addActivityData, clearDatabase }
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
