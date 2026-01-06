declare module 'react-copy-to-clipboard' {
  import * as React from 'react'

  export type CopyToClipboardProps = {
    text: string
    onCopy?: (text: string, result: boolean) => void
    options?: {
      debug?: boolean
      message?: string
      format?: string
    }
    children?: React.ReactNode
  }

  export default class CopyToClipboard extends React.PureComponent<CopyToClipboardProps> {}
}
