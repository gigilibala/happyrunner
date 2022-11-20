import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import { HeartRateMonitorContext } from './HeartRateMonitorProvider'
import { useLocation } from './Location'

type ActivityType = 'Running'

type Status = 'in-progress' | 'paused' | 'stopped'

const INTERVAL_MS = 3000

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

export type ActivityData = {
  timestamp: number
  activity_id: number
  heart_rate?: number
  latitude?: number
  longitude?: number
  status?: Status
}

export interface IActivity {
  status?: Status
  setStatus: (status: Status) => void
  start: () => void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const [status, setStatus] = useState<Status>()
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityData } =
    useContext(DatabaseContext)
  const { heartRate } = useContext(HeartRateMonitorContext)
  const { position, setStatus: setLocationServiceStatus } = useLocation()
  const [dataCollectionInterval, setDataCollectionInterval] = useState<number>()
  const [timestamp, setTimestamp] = useState<number>()

  useEffect(() => {
    if (id === undefined) return
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
    setStatus('in-progress')
  }, [id])

  useEffect(() => {
    if (dataCollectionInterval === undefined) return
    return () => {
      stopCollectingData()
    }
  }, [dataCollectionInterval])

  useEffect(() => {
    if (status === undefined || id === undefined) return
    const time = new Date()
    switch (status) {
      case 'in-progress':
        modifyActivity({
          id: id,
          status: 'in-progress',
        })
        startCollectingData()
        break
      case 'paused':
        modifyActivity({
          id: id,
          status: 'paused',
        })
        setDataCollectionInterval(undefined)
        break
      case 'stopped':
        modifyActivity({
          id: id,
          status: 'stopped',
          end_time: time.getTime(),
        })
        setId(undefined)
        setDataCollectionInterval(undefined)
        break
      default:
        break
    }
  }, [status])

  useEffect(() => {
    if (timestamp === undefined || id == undefined) return

    addActivityData({
      activity_id: id,
      timestamp: timestamp,
      heart_rate: heartRate,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
      status: status,
    })
  }, [timestamp])

  function start(): void {
    // TODO(gigilibala): Maybe change ID to something else other than current time.
    setId(new Date().getTime())
  }

  function startCollectingData(): void {
    console.log('Starting to collect data.')
    setLocationServiceStatus('running')
    setDataCollectionInterval(
      setInterval(() => setTimestamp(new Date().getTime()), INTERVAL_MS),
    )
  }

  function stopCollectingData(): void {
    if (dataCollectionInterval === undefined) return
    console.log('Stopping data collection.')
    clearInterval(dataCollectionInterval)
    setLocationServiceStatus('stopped')
  }

  return { status, setStatus, start }
}
