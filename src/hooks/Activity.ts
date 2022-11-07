import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../hooks/DatabaseProvider'

export enum ActivityType {
  RUNNING = 'Running',
}

export enum Status {
  STARTED = 'Started',
  PAUSED = 'Paused',
  STOPPED = 'Stopped',
}

// Keep in sync with database table.
export type Activity = {
  id: number
  status?: Status
  type?: ActivityType
  start_time?: Date
  end_time?: Date
}

export interface IActivity {
  start(): void
  pause(): void
  end(): void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const { addActivity, modifyActivity } = useContext(DatabaseContext)

  useEffect(() => {
    if (id === undefined) return
    const time = new Date()
    addActivity({
      id: id,
      status: Status.STARTED,
      start_time: time,
      type: ActivityType.RUNNING,
    })
    return () => {
      modifyActivity({ id: id, status: Status.STOPPED })
    }
  }, [id])

  function start(): void {
    setId(new Date().getTime())
  }

  function pause(): void {
    throw new Error('Not implemented')
  }
  function end(): void {
    throw new Error('Not implemented')
  }

  return { start, pause, end }
}
