import CreatorsDiscoveryView from '@/components/creators/creators-discovery-view'

export default function YouTubeDiscoveryPage() {
  return (
    <CreatorsDiscoveryView
      title="YouTube Creators"
      subtitle="Discover YouTube creators tailored to your campaign goals."
      searchPlaceholder="Search YouTube creators by name, bio, or category"
      platformPreset="YouTube"
      hidePlatformFilter
    />
  )
}
