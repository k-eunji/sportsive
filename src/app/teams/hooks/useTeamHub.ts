// src/app/teams/hooks/useTeamHub.ts

'use client'

import { useState, useEffect } from 'react'
import { useTeam } from './useTeam'
import { useTeamMatches } from '@/hooks/useTeamMatches'
import type { Team } from '@/types'
import type { TeamMember } from '../[teamId]/components/TeamMembers'

interface RegionData {
  teamId: string
  region: string
  nearbyFans: number
  nearbyMeetups: { id: string; title: string; location: string }[]
  upcomingMatches: { id: string; opponent: string; date: string; venue: string }[]
}

/**
 * ✅ useTeamHub(teamId, region)
 * - 팀 데이터 + 경기 + 구성원 + 지역 데이터 통합 훅
 */
export function useTeamHub(teamId: string, region: string = 'global') {
  const { team, isLoading, isError } = useTeam(teamId) as {
    team: Team | null
    isLoading: boolean
    isError: boolean
  }

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
  } = useTeamMatches(teamId)

  const [members, setMembers] = useState<TeamMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState(false)

  const [regionData, setRegionData] = useState<RegionData | null>(null)
  const [regionLoading, setRegionLoading] = useState(true)
  const [regionError, setRegionError] = useState(false)

  // 👥 팀 멤버 가져오기
  useEffect(() => {
    if (!teamId) return
    ;(async () => {
      try {
        setMembersLoading(true)
        const res = await fetch(`/api/teams/${teamId}/members`)
        if (!res.ok) throw new Error('Failed to fetch team members')
        const data = await res.json()
        setMembers(data)
      } catch (err) {
        console.error(err)
        setMembersError(true)
      } finally {
        setMembersLoading(false)
      }
    })()
  }, [teamId])

  // 📍 지역 데이터 가져오기
  useEffect(() => {
    if (!teamId || !region) return
    ;(async () => {
      try {
        setRegionLoading(true)
        const res = await fetch(`/api/teams/${teamId}/region?region=${region}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch region data')
        const data = await res.json()
        setRegionData(data)
      } catch (err) {
        console.error('❌ region fetch failed:', err)
        setRegionError(true)
      } finally {
        setRegionLoading(false)
      }
    })()
  }, [teamId, region])

  return {
    team,
    isLoading,
    isError,
    matches,
    matchesLoading,
    matchesError,
    members,
    membersLoading,
    membersError,
    regionData,
    regionLoading,
    regionError,
  }
}
