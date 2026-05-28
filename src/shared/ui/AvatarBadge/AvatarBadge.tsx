import './AvatarBadge.css'

type AvatarBadgeProps = {
  fullName: string
  src?: string
  size?: 'm' | 'l'
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AvatarBadge({ fullName, src, size = 'm' }: AvatarBadgeProps) {
  return (
    <div className={`avatar-badge avatar-badge-${size}`}>
      {src ? <img src={src} alt="" /> : <span>{getInitials(fullName)}</span>}
    </div>
  )
}
