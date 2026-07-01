/** Small environment helpers for the main process. */
export const is = {
  dev: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  macOS: process.platform === 'darwin',
  windows: process.platform === 'win32',
  linux: process.platform === 'linux'
}
