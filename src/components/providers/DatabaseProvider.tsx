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
import { Datum, Details, IdType, Info, Lap } from '../../hooks/activity'

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
  notes: 'notes',
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
  activity_id: 'activity_id',
  number: 'number',
  start_time: 'start_time',
  end_time: 'end_time',
  avg_heart_rate: 'avg_heart_rate',
  max_heart_rate: 'max_heart_rate',
  total_steps: 'total_steps',
  cadence: 'cadence',
  active_duration: 'active_duration',
  distance: 'distance',
}

const createInfoTableScript = `
CREATE TABLE IF NOT EXISTS ${activityInfoTableName}(
  ${activityInfoTableColumns.id} INTEGER PRIMARY KEY NOT NULL,
  ${activityInfoTableColumns.type} TEXT NOT NULL,
  ${activityInfoTableColumns.status} TEXT,
  ${activityInfoTableColumns.notes} TEXT
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
  ${activityLapsTableColumns.number} INTEGER NOT NULL,
  ${activityLapsTableColumns.start_time} INTEGER NOT NULL,
  ${activityLapsTableColumns.end_time} INTEGER NOT NULL,
  ${activityLapsTableColumns.avg_heart_rate} INTEGER,
  ${activityLapsTableColumns.max_heart_rate} INTEGER,
  ${activityLapsTableColumns.total_steps} INTEGER,
  ${activityLapsTableColumns.cadence} INTEGER,
  ${activityLapsTableColumns.active_duration} INTEGER,
  ${activityLapsTableColumns.distance} INTEGER,
  FOREIGN KEY(${activityLapsTableColumns.activity_id}) REFERENCES ${activityInfoTableName}(${activityInfoTableColumns.id})
);
`
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
      tx.executeSql(createInfoTableScript)
      tx.executeSql(createDataTableScript)
      tx.executeSql(createLapsTableScript)
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
    addRow(value, activityInfoTableName)
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
        activityDataTableName,
        activityDataTableColumns.activity_id,
      )
      deleteRows(
        tx,
        activityLapsTableName,
        activityLapsTableColumns.activity_id,
      )
      deleteRows(tx, activityInfoTableName, activityInfoTableColumns.id)
    })
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
      FROM ${activityLapsTableName}
      WHERE ${activityLapsTableColumns.activity_id} = ?
      ORDER BY ${activityLapsTableColumns.number}
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
      FROM ${activityInfoTableName} INNER JOIN ${activityLapsTableName}
      ON ${activityInfoTableName}.${activityInfoTableColumns.id} = ${activityLapsTableName}.${activityLapsTableColumns.activity_id}
      AND ${activityLapsTableName}.${activityLapsTableColumns.number} = 0
      ORDER BY ${activityLapsTableColumns.start_time} DESC
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

export const DatabaseContext = createContext<IDatabaseApi>({} as IDatabaseApi)

export function DatabaseProvider({ children }: PropsWithChildren) {
  const state = useDatabase()

  return (
    <DatabaseContext.Provider value={state}>
      {children}
    </DatabaseContext.Provider>
  )
}
