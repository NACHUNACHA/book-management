export function formatDate(date) {
  return new Date(date).toLocaleString('en-GB', {
    hour12: false,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
