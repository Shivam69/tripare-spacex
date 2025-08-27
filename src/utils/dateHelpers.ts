export function formatLaunchDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return 'Unknown date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  return date.toLocaleDateString('en-US', options);
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }

  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < 365) return `In ${Math.ceil(diffDays / 30)} months`;
    return `In ${Math.ceil(diffDays / 365)} years`;
  } else {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Today';
    if (absDays === 1) return 'Yesterday';
    if (absDays < 7) return `${absDays} days ago`;
    if (absDays < 30) return `${Math.ceil(absDays / 7)} weeks ago`;
    if (absDays < 365) return `${Math.ceil(absDays / 30)} months ago`;
    return `${Math.ceil(absDays / 365)} years ago`;
  }
}