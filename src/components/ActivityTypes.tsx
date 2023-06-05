import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { IcoMoon } from './IcoMoon'

export const ACTIVITY_TYPES = ['running', 'swimming', 'treadmill'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

type ActivityIconProps = {
  type?: ActivityType
  size?: number
  color?: string
  style?: any
}

export function ActivityIcon({ type, size, color, style }: ActivityIconProps) {
  if (color === undefined) color = 'blue'
  if (size === undefined) size = 20
  switch (type) {
    case 'running':
      return <Icon name={type} color={color} size={size} style={style} />
    case 'swimming':
      return (
        <IcoMoon name={type} color={color} size={size - 10} style={style} />
      )
    case 'treadmill':
      return <IcoMoon name={type} color={color} size={size} style={style} />
    default:
      return <Icon name={'question'} color={color} size={size} style={style} />
  }
}

export type ActivityFeatures = {
  needsLocation: boolean
  needsSpeedInput: boolean
}

export function activityFeatures(type: ActivityType): ActivityFeatures {
  switch (type) {
    case 'running':
      return { needsLocation: true, needsSpeedInput: false }
    case 'swimming':
      return { needsLocation: true, needsSpeedInput: false }
    case 'treadmill':
      return { needsLocation: false, needsSpeedInput: true }
  }
}
