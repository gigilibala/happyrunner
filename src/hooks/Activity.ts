import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../hooks/DatabaseProvider'

export enum ActivityType {
  RUNNING = 'Running',
}

export enum Status {
  IN_PROGRESS = 'InProgress',
  PAUSED = 'Paused',
  STOPPED = 'Stopped',
}

// Keep in sync with database table.
export type Activity = {
  id: number
  status?: Status
  type?: ActivityType
  start_time?: number
  end_time?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  avg_pace?: number
  total_steps?: number
  cadence?: number
  total_active_time_seconds?: number
  total_distance?: number
}

export interface IActivity {
  status?: Status
  start(): void
  pause(): void
  stop(): void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const [status, setStatus] = useState<Status>()
  const { addActivity, modifyActivity } = useContext(DatabaseContext)

  useEffect(() => {
    if (id === undefined) return
    if (status === undefined) return
    const time = new Date()
    switch (status) {
      case Status.IN_PROGRESS:
        addActivity({
          id: id,
          status: Status.IN_PROGRESS,
          start_time: time.getTime(),
          type: ActivityType.RUNNING,
        })
        break
      case Status.PAUSED:
        modifyActivity({
          id: id,
          status: Status.PAUSED,
          end_time: time.getTime(),
        })
        break
      case Status.STOPPED:
        modifyActivity({
          id: id,
          status: Status.STOPPED,
          end_time: time.getTime(),
        })
        break
      default:
        break
    }
  }, [status])

  function start(): void {
    // TODO(gigilibala): Maybe change ID to something else.
    setId(new Date().getTime())
    setStatus(Status.IN_PROGRESS)
  }

  function pause(): void {
    setStatus(Status.PAUSED)
  }
  function stop(): void {
    setStatus(Status.STOPPED)
  }

  return { start, pause, stop, status }
}
