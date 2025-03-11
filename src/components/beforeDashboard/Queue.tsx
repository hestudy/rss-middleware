import { getPayloadInServerComponent } from '@/common/getPayloadInServerComponent'

export default async function Queue() {
  const payload = await getPayloadInServerComponent()

  return <div>Dashboard</div>
}
