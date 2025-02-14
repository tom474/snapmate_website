export function mergeClassNames(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}min${diffInMinutes !== 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours}hr${diffInHours !== 1 ? 's' : ''}`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
