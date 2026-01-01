import CreatorsDiscoveryView from '@/components/creators/creators-discovery-view'

export default function FacebookDiscoveryPage() {
  return (
    <CreatorsDiscoveryView
      title="Facebook Creators"
      subtitle="Discover Facebook creators tailored to your campaign goals."
      searchPlaceholder="Search Facebook creators by name, bio, or category"
      platformPreset="Facebook"
      hidePlatformFilter
    />
  )
}
