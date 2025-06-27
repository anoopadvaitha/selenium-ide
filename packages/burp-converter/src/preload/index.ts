import { Api } from '@seleniumhq/side-api'

// @ts-expect-error - sideAPI is injected at runtime
const api = window.sideAPI as Api

api.plugins.addRecorderPreprocessor((command) => {
  return {
    action: 'update',
    command: {
      ...command,
      comment: 'plugin active',
    },
  }
})

export = true
