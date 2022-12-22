import {
  createContext,
  PropsWithChildren,
  useEffect,
  useReducer,
  useState,
} from 'react'
import {
  DatabaseParams,
  deleteDatabase,
  openDatabase,
  SQLiteDatabase,
  Transaction,
} from 'react-native-sqlite-storage'
import { IdType } from '../../hooks/activity'
import { ActivityType } from '../ActivityTypes'

const databaseName = 'user-data.db'

type Column = { name: string; sqlType: string }
type DatabaseColumns<T> = {
  [Property in keyof T]-?: Column
}

type Table<T, F = {}> = {
  name: string
  columns: DatabaseColumns<T>
  foreignKey?: {
    localKey: keyof DatabaseColumns<T>
    remoteTable: Table<F>
    remoteKey: keyof DatabaseColumns<F>
  }
}

// Keep in sync with database table.
export type Info = {
  id: IdType
  type?: ActivityType
  status?: 'in-progress' | 'stopped'
  notes?: string
}

const activityInfoTable: Table<Info> = {
  name: 'activity_info',
  columns: {
    id: { name: 'id', sqlType: 'INTEGER PRIMARY KEY NOT NULL' },
    type: { name: 'type', sqlType: 'TEXT NOT NULL' },
    status: { name: 'status', sqlType: 'TEXT' },
    notes: { name: 'notes', sqlType: 'TEXT' },
  },
}

export type Datum = {
  timestamp: number
  activityId: IdType
  heartRate?: number
  speed?: number
  latitude?: number
  longitude?: number
}

const activityDataTable: Table<Datum, Info> = {
  name: 'activity_data',
  columns: {
    timestamp: { name: 'timestamp', sqlType: 'INTEGER PRIMARY KEY NOT NULL' },
    activityId: { name: 'activity_id', sqlType: 'INTEGER NOT NULL' },
    heartRate: { name: 'heart_rate', sqlType: 'INTEGER' },
    speed: { name: 'speed', sqlType: 'INTEGER' },
    latitude: { name: 'latitude', sqlType: 'REAL' },
    longitude: { name: 'longitude', sqlType: 'REAL' },
  },
  foreignKey: {
    localKey: 'activityId',
    remoteTable: activityInfoTable,
    remoteKey: 'id',
  },
}

export type Lap = {
  id: IdType
  activityId: IdType
  number: number
  start_time: number
  end_time: number
  minHr?: number
  avgHr?: number
  maxHr?: number
  duration?: number
  distance?: number
  minSpeed?: number
  avgSpeed?: number
  maxSpeed?: number
  // Maybe add temperature also.
}

const activityLapsTable: Table<Lap, Info> = {
  name: 'activity_laps',
  columns: {
    id: { name: 'id', sqlType: 'INTEGER PRIMARY KEY NOT NULL' },
    activityId: { name: 'activity_id', sqlType: 'INTEGER NOT NULL' },
    number: { name: 'number', sqlType: 'INTEGER NOT NULL' },
    start_time: { name: 'start_time', sqlType: 'INTEGER NOT NULL' },
    end_time: { name: 'end_time', sqlType: 'INTEGER NOT NULL' },
    minHr: { name: 'min_heart_rate', sqlType: 'INTEGER' },
    avgHr: { name: 'avg_heart_rate', sqlType: 'INTEGER' },
    maxHr: { name: 'max_heart_rate', sqlType: 'INTEGER' },
    duration: { name: 'duration', sqlType: 'INTEGER' },
    distance: { name: 'distance', sqlType: 'INTEGER' },
    minSpeed: { name: 'min_speed', sqlType: 'INTEGER' },
    avgSpeed: { name: 'avg_speed', sqlType: 'INTEGER' },
    maxSpeed: { name: 'max_speed', sqlType: 'INTEGER' },
  },
  foreignKey: {
    localKey: 'activityId',
    remoteTable: activityInfoTable,
    remoteKey: 'id',
  },
}

export type Details = Info & Lap

type ActionType = 'getActivityLaps' | 'getActivityDetailsList'
type Action =
  | { type: 'clearDatabase' }
  | { type: 'addActivity'; payload: { data: Info } }
  | { type: 'modifyActivity'; payload: { data: Info } }
  | { type: 'deleteActivity'; payload: { activityId: IdType } }
  | { type: 'addActivityDatum'; payload: { data: Datum } }
  | { type: 'addActivityLap'; payload: { data: Lap } }
  | { type: 'getActivityLaps'; payload: { activityId: IdType } }
  | { type: 'getActivityDetailsList' }
  | { type: 'success'; actionType: ActionType; payload: StatePayload }
  | { type: 'failure'; actionType: ActionType; error: Error }

type StatePayload = { laps?: Lap[]; details?: Details[] }
type State =
  | { status: 'idle' }
  | { status: 'success'; actionType: ActionType; payload: StatePayload }
  | { status: 'failure'; actionType: ActionType; error: Error }

type IDatabaseApi = [State, React.Dispatch<Action>]

function useDatabase(): IDatabaseApi {
  const [db, setDb] = useState<SQLiteDatabase>()
  const dbParams: DatabaseParams = { name: databaseName, location: 'default' }

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'clearDatabase':
          clearDatabase()
          return { status: 'idle' }
        case 'addActivity':
          addActivity(action.payload.data)
          return { status: 'idle' }
        case 'modifyActivity':
          modifyActivity(action.payload.data)
          return { status: 'idle' }
        case 'deleteActivity':
          deleteActivity(action.payload.activityId)
          return { status: 'idle' }
        case 'addActivityDatum':
          addActivityDatum(action.payload.data)
          return { status: 'idle' }
        case 'addActivityLap':
          addActivityLap(action.payload.data)
          return { status: 'idle' }
        case 'getActivityLaps':
          getActivityLaps(action.payload.activityId)
            .then((laps) =>
              dispatch({
                type: 'success',
                actionType: action.type,
                payload: { laps: laps },
              }),
            )
            .catch((error) =>
              dispatch({
                type: 'failure',
                actionType: action.type,
                error: error,
              }),
            )
          return { status: 'idle' }
        case 'getActivityDetailsList':
          getActivityDetailsList()
            .then((details) =>
              dispatch({
                type: 'success',
                actionType: action.type,
                payload: { details: details },
              }),
            )
            .catch((error) =>
              dispatch({
                type: 'failure',
                actionType: action.type,
                error: error,
              }),
            )
          return { status: 'idle' }
        case 'success':
          return {
            status: 'success',
            actionType: action.actionType,
            payload: action.payload,
          }
        case 'failure':
          return {
            status: 'failure',
            actionType: action.actionType,
            error: action.error,
          }
      }
    },
    { status: 'idle' },
  )

  useEffect(() => {
    if (db === undefined) openDatabase(dbParams).then((db) => setDb(db))
    else createTables()
  }, [db])

  function createTables() {
    db?.transaction((tx) => {
      tx.executeSql(createTableStatement(activityInfoTable))
      tx.executeSql(createTableStatement(activityDataTable))
      tx.executeSql(createTableStatement(activityLapsTable))
    })
      .then(() => console.log('Tables created.'))
      .catch((error) => console.log('Failed to create tables: ', error))
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
    addRow(value, activityInfoTable.name)
  }

  function deleteActivity(activityId: IdType) {
    function deleteRows(tx: Transaction, table: string, column: string) {
      const query = `DELETE FROM ${table}
      WHERE ${column} = ?
      `
      tx.executeSql(query, [activityId])
        .then(() =>
          console.log(
            `Deleted rows from ${table} with activity ID ${activityId}`,
          ),
        )
        .catch((error) =>
          console.log(
            `Failed to delete rows from ${table} for activity ID ${activityId}`,
          ),
        )
    }
    db?.transaction((tx) => {
      deleteRows(
        tx,
        activityDataTable.name,
        activityDataTable.columns.activityId.name,
      )
      deleteRows(
        tx,
        activityLapsTable.name,
        activityLapsTable.columns.activityId.name,
      )
      deleteRows(tx, activityInfoTable.name, activityInfoTable.columns.id.name)
    })
  }

  function modifyActivity(value: Info): void {
    modifyRow(value, activityInfoTable.name, 'id')
  }

  function addActivityDatum(value: Datum): void {
    addRow(value, activityDataTable.name)
  }

  function addActivityLap(value: Lap): void {
    addRow(value, activityLapsTable.name)
  }

  function addRow<T extends object>(data: T, tableName: string): void {
    const keys = Object.keys(data)
    const query = `INSERT INTO ${tableName}
      (${keys.join(', ')})
      VALUES (${Array(keys.length).fill('?').join(', ')})
    `
    db?.executeSql(query, Object.values(data))
      .then(() => console.debug('Added row to table: ', tableName, data))
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
      .then(() => console.debug('Modified row in table: ', tableName, data))
      .catch((error) =>
        console.log('Failed to modify in table: ', tableName, error, data),
      )
  }

  function getActivityLaps(activity_id: IdType): Promise<Lap[]> {
    return new Promise<Lap[]>((resolve) => {
      const query = `SELECT *
      FROM ${activityLapsTable.name}
      WHERE ${activityLapsTable.columns.activityId.name} = ?
      ORDER BY ${activityLapsTable.columns.number.name}
      `
      db?.readTransaction((tx) => {
        tx.executeSql(query, [activity_id]).then(([tx, results]) => {
          resolve(results.rows.raw() as Lap[])
        })
      })
    })
  }

  function getActivityDetailsList(): Promise<Details[]> {
    return new Promise<Details[]>((resolve) => {
      const query = `SELECT *
      FROM ${activityInfoTable.name} INNER JOIN ${activityLapsTable.name}
      ON ${activityInfoTable.name}.${activityInfoTable.columns.id.name} = ${activityLapsTable.name}.${activityLapsTable.columns.activityId.name}
      AND ${activityLapsTable.name}.${activityLapsTable.columns.number.name} = 0
      ORDER BY ${activityLapsTable.columns.start_time.name} DESC
      `
      db?.transaction((tx) => {
        tx.executeSql(query).then(([tx, results]) => {
          resolve(results.rows.raw() as Details[])
        })
      })
    })
  }

  return [state, dispatch]
}

function createTableStatement(table: Table<any, any>): string {
  const columnsStatements = Object.values(table.columns).map(
    ({ name, sqlType }) => name + ' ' + sqlType,
  )
  const foreignKeyStatement = table.foreignKey
    ? `, FOREIGN KEY(${String(table.foreignKey.localKey)}) REFERENCES ${
        table.foreignKey.remoteTable.name
      }(${String(table.foreignKey.remoteKey)})`
    : ''
  return `CREATE TABLE IF NOT EXISTS ${table.name}(
    ${columnsStatements.join(', ')}${foreignKeyStatement})`
}

export const DatabaseContext = createContext<IDatabaseApi>({} as IDatabaseApi)

export function DatabaseProvider({ children }: PropsWithChildren) {
  const state = useDatabase()

  return (
    <DatabaseContext.Provider value={state}>
      {children}
    </DatabaseContext.Provider>
  )
}
