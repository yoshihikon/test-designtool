export interface PropDef {
  name: string
  type: string
  required: boolean
  default?: string
}

export interface ComponentDef {
  name: string
  category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback'
  description: string
  props: PropDef[]
  previewProps: Record<string, unknown>
  code: string
}

export interface Connection {
  to: string
  label: string
}

export interface ScreenDef {
  id: string
  name: string
  description: string
  route: string
  components: string[]
  code: string
  connections: Connection[]
}

export interface ColorPalette {
  primary: string
  primaryText: string
  secondary: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}

export interface DesignSpec {
  projectName: string
  tagline: string
  palette: ColorPalette
  components: ComponentDef[]
  screens: ScreenDef[]
}

export type Phase = 'input' | 'generating' | 'ready'

export type ViewState =
  | { type: 'design-system' }
  | { type: 'screen-flow' }
  | { type: 'screen'; id: string }
