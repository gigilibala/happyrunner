import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../hooks/DatabaseProvider'

type ActivityType = 'Running'

type Status = 'in-progress' | 'paused' | 'stopped'

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

export type ActivityPoint = {
  timestamp: number
  activity_id: number
  heart_rate?: number
  latitude?: number
  longitude?: number
  status?: Status
}

export interface IActivity {
  status?: Status
  start(): void
  pause(): void
  resume(): void
  stop(): void
  addData(): void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const [status, setStatus] = useState<Status>()
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityPoint } =
    useContext(DatabaseContext)

  useEffect(() => {
    if (id === undefined) return
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
  }, [id])

  useEffect(() => {
    if (status === undefined) return
    if (id === undefined) {
      console.info('Activity ID has not been set')
      return
    }
    const time = new Date()
    switch (status) {
      case 'in-progress':
        modifyActivity({
          id: id,
          status: 'in-progress',
        })
        break
      case 'paused':
        modifyActivity({
          id: id,
          status: 'paused',
        })
        break
      case 'stopped':
        modifyActivity({
          id: id,
          status: 'stopped',
          end_time: time.getTime(),
        })
        break
      default:
        break
    }
  }, [status])

  function start(): void {
    // TODO(gigilibala): Maybe change ID to something else other than current time.
    const time = new Date()
    setId(time.getTime())
    setStatus('in-progress')
  }

  function pause(): void {
    setStatus('paused')
  }
  function stop(): void {
    setStatus('stopped')
  }
  function resume(): void {
    setStatus('in-progress')
  }

  // TODO(gigilibala): For testing, remove.
  function addData(): void {
    if (id === undefined) {
      console.error('Activity ID has not been set.')
      return
    }
    addActivityPoint({
      activity_id: id,
      timestamp: new Date().getTime(),
      heart_rate: 100,
      latitude: 1.1,
      longitude: 2.2,
      status: 'in-progress',
    })
  }

  return { start, pause, stop, resume, status, addData }
}
