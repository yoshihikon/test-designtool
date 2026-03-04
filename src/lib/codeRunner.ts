import React from 'react'

declare global {
  interface Window {
    Babel: {
      transform: (
        code: string,
        options: { presets: Array<string | [string, Record<string, unknown>]> }
      ) => { code: string }
    }
  }
}

/**
 * Compile a JSX component function string into a React component.
 * The code should define a function with the given name.
 * React, useState, useEffect, useRef, useCallback, useMemo are injected as scope.
 */
export function compileComponent(code: string, name: string): React.ComponentType<Record<string, unknown>> {
  const Babel = window.Babel
  if (!Babel) throw new Error('Babel is not loaded')

  // Wrap in IIFE so we can use "return" to export the component
  const wrapped = `(function() {
${code}
return ${name};
})()`

  const { code: compiled } = Babel.transform(wrapped, {
    presets: ['react'],
  })

  // Inject React and common hooks into function scope
  const factory = new Function(
    'React',
    'useState',
    'useEffect',
    'useRef',
    'useCallback',
    'useMemo',
    `return ${compiled}`
  )

  return factory(
    React,
    React.useState,
    React.useEffect,
    React.useRef,
    React.useCallback,
    React.useMemo
  ) as React.ComponentType<Record<string, unknown>>
}

/**
 * Compile a screen that uses multiple components.
 * All component codes are concatenated before the screen code,
 * making them available in scope.
 */
export function compileScreen(
  componentCodes: string[],
  screenCode: string
): React.ComponentType<Record<string, unknown>> {
  const Babel = window.Babel
  if (!Babel) throw new Error('Babel is not loaded')

  const allCode = [...componentCodes, screenCode].join('\n\n')

  const wrapped = `(function() {
${allCode}
return Screen;
})()`

  const { code: compiled } = Babel.transform(wrapped, {
    presets: ['react'],
  })

  const factory = new Function(
    'React',
    'useState',
    'useEffect',
    'useRef',
    'useCallback',
    'useMemo',
    `return ${compiled}`
  )

  return factory(
    React,
    React.useState,
    React.useEffect,
    React.useRef,
    React.useCallback,
    React.useMemo
  ) as React.ComponentType<Record<string, unknown>>
}
