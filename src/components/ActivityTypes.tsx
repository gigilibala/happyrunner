import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { IcoMoon } from './IcoMoon'

export const ACTIVITY_TYPES = ['running', 'swimming', 'treadmill'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

type ActivityIconProps = {
  type?: ActivityType
  size?: number
  color?: string
}

export function ActivityIcon({ type, size, color }: ActivityIconProps) {
  if (color === undefined) color = 'blue'
  if (size === undefined) size = 20
  switch (type) {
    case 'running':
      return <Icon name={'running'} color={color} size={size} />
    case 'swimming':
      return <IcoMoon name={'swimming'} color={color} size={size - 10} />
    case 'treadmill':
      return <IcoMoon name={'treadmill'} color={color} size={size} />
    default:
      return <Icon name={'question'} color={color} size={size} />
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
