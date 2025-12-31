import { OfferingFormScreen } from 'app/features/connect/practitioner-dashboard'
import { useLocalSearchParams } from 'expo-router'

export default function EditOfferingPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <OfferingFormScreen offeringId={id} />
}
