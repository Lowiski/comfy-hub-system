import { useEffect, useState } from 'react'
import { publicApi, type ApiCounselor } from '@/lib/api'


export function usePublicCounselors() {
  const [counselors, setCounselors] = useState<ApiCounselor[]>([])

  useEffect(() => {
    void publicApi.counselors()
      .then((result) => setCounselors(result.counselors))
      .catch(() => setCounselors([]))
  }, [])

  return counselors
}
