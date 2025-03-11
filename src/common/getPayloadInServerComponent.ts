import config from '@/payload.config'
import { getPayload } from 'payload'

export const getPayloadInServerComponent = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return payload
}
