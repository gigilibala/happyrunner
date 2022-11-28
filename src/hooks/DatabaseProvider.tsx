import { createContext, ReactNode, useEffect, useState } from 'react'
import {
  DatabaseParams,
  deleteDatabase,
  enablePromise,
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage'
import { Datum, Info, Lap } from './Activity'

const databaseName = 'user-data.db'
const activityInfoTableName = 'activity_info'
const activityDataTableName = 'activity_data'
const activityLapsTableName = 'activity_laps'

type DatabaseColumns<Type> = {
  [Property in keyof Type]-?: string
}

const activityInfoTableColumns: DatabaseColumns<Info> = {
  id: 'id',
  type: 'type',
  status: 'status',
}

const activityDataTableColumns: DatabaseColumns<Datum> = {
  timestamp: 'timestamp',
  activity_id: 'activity_id',
  heart_rate: 'heart_rate',
  latitude: 'latitude',
  longitude: 'longitude',
}

const activityLapsTableColumns: DatabaseColumns<Lap> = {
  id: 'id',
  start_time: 'start_time',
  end_time: 'end_time',
  activity_id: 'activity_id',
  number: 'number',
  avg_heart_rate: 'avg_heart_rate',
  max_heart_rate: 'max_heart_rate',
  avg_pace: 'avg_pace',
  total_steps: 'total_steps',
  cadence: 'cadence',
  total_active_time_seconds: 'total_active_time_seconds',
  total_distance: 'total_distance',
}

const createInfoTableScript = `
CREATE TABLE IF NOT EXISTS ${activityInfoTableName}(
  ${activityInfoTableColumns.id} INTEGER PRIMARY KEY NOT NULL,
  ${activityInfoTableColumns.type} TEXT NOT NULL,
  ${activityInfoTableColumns.status} TEXT
);
`

const createDataTableScript = `
CREATE TABLE IF NOT EXISTS ${activityDataTableName}(
  ${activityDataTableColumns.timestamp} INTEGER PRIMARY KEY NOT NULL,
  ${activityDataTableColumns.activity_id} INTEGER NOT NULL,
  ${activityDataTableColumns.heart_rate} INTEGER,
  ${activityDataTableColumns.latitude} REAL,
  ${activityDataTableColumns.longitude} REAL,
  FOREIGN KEY(${activityDataTableColumns.activity_id}) REFERENCES ${activityInfoTableName}(${activityInfoTableColumns.id})
);
`

const createLapsTableScript = `
CREATE TABLE IF NOT EXISTS ${activityLapsTableName}(
  ${activityLapsTableColumns.id} INTEGER PRIMARY KEY NOT NULL,
  ${activityLapsTableColumns.activity_id} INTEGER NOT NULL,
  ${activityLapsTableColumns.start_time} INTEGER,
  ${activityLapsTableColumns.end_time} INTEGER,
  ${activityLapsTableColumns.number} INTEGER,
  ${activityLapsTableColumns.avg_heart_rate} INTEGER,
  ${activityLapsTableColumns.max_heart_rate} INTEGER,
  ${activityLapsTableColumns.avg_pace} REAL,
  ${activityLapsTableColumns.total_steps} INTEGER,
  ${activityLapsTableColumns.cadence} INTEGER,
  ${activityLapsTableColumns.total_active_time_seconds} INTEGER,
  ${activityLapsTableColumns.total_distance} INTEGER,
  FOREIGN KEY(${activityLapsTableColumns.activity_id}) REFERENCES ${activityInfoTableName}(${activityInfoTableColumns.id})
);
`

enablePromise(true)

interface IDatabaseApi {
  addActivity: (activity: Info) => void
  modifyActivity: (activity: Info) => void
  addActivityDatum: (data: Datum) => void
  addActivityLap: (lap: Lap) => void

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
      { statement: createLapsTableScript },
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

  function addActivity(value: Info): void {
    addRow(value, activityInfoTableName)
  }

  function modifyActivity(value: Info): void {
    modifyRow(value, activityInfoTableName, 'id')
  }

  function addActivityDatum(value: Datum): void {
    addRow(value, activityDataTableName)
  }

  function addActivityLap(value: Lap): void {
    addRow(value, activityLapsTableName)
  }

  function addRow<T extends object>(data: T, tableName: string): void {
    const keys = Object.keys(data)
    const query = `INSERT INTO ${tableName}
      (${keys.join(', ')})
      VALUES (${Array(keys.length).fill('?').join(', ')})
    `
    db?.executeSql(query, Object.values(data))
      .then(() => console.log('Added row to table: ', tableName, data))
      .catch((error) =>
        console.log('Failed to add row to table: ', tableName, error, data),
      )
  }

  function modifyRow<T extends object, KeyType extends keyof T>(
    data: T,
    tableName: string,
    primaryKeyName: KeyType,
  ) {
    const partialData: Partial<typeof data> = { ...data }
    delete partialData[primaryKeyName]
    const columns = Object.keys(partialData).map((key) => `${key} = ?`)
    const query = `UPDATE ${tableName}
      SET ${columns.join(', ')}
      WHERE ${primaryKeyName.toString()} = ${data[primaryKeyName]}
    `
    db?.executeSql(query, Object.values(partialData))
      .then(() => console.log('Modified row in table: ', tableName, data))
      .catch((error) =>
        console.log('Failed to modify in table: ', tableName, error, data),
      )
  }

  return {
    addActivity,
    modifyActivity,
    addActivityDatum,
    addActivityLap,
    clearDatabase,
  }
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
