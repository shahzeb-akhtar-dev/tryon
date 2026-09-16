export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin') || '*'

  setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
  setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
  setResponseHeader(event, 'Access-Control-Max-Age', '3600')

  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    return ''
  }
})
