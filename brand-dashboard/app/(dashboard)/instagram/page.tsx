import CreatorsDiscoveryView from '@/components/creators/creators-discovery-view'

export default function InstagramDiscoveryPage() {
  return (
    <CreatorsDiscoveryView
      title="Instagram Creators"
      subtitle="Discover Instagram creators tailored to your campaign goals."
      searchPlaceholder="Search Instagram creators by name, bio, or category"
      platformPreset="Instagram"
      hidePlatformFilter
    />
  )
}
