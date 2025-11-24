"use client"

import { useMemo } from "react"

type TokenType = "comment" | "string" | "keyword" | "builtin" | "number" | "function" | "decorator"

interface HighlightedCodeProps {
  language: string
  code: string
}

interface Token {
  start: number
  end: number
  type: TokenType
}

const pythonPatterns: Array<{ type: TokenType; regex: RegExp }> = [
  { type: "comment", regex: /#.*/gm },
  { type: "string", regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*')/g },
  {
    type: "keyword",
    regex:
      /\b(?:def|class|return|if|elif|else|for|while|try|except|finally|with|as|import|from|pass|break|continue|in|and|or|not|is|lambda|yield|global|nonlocal|assert|raise|del)\b/g,
  },
  { type: "builtin", regex: /\b(?:True|False|None)\b/g },
  {
    type: "function",
    regex:
      /\b(?:print|len|range|enumerate|zip|map|filter|list|dict|set|tuple|int|float|str|sum|min|max|abs|open|sorted)\b/g,
  },
  { type: "decorator", regex: /@\w+/g },
  { type: "number", regex: /\b\d+(?:\.\d+)?\b/g },
]

const tokenClassMap: Record<TokenType, string> = {
  comment: "text-slate-500",
  string: "text-emerald-300",
  keyword: "text-sky-300",
  builtin: "text-amber-300",
  number: "text-rose-300",
  function: "text-indigo-300",
  decorator: "text-fuchsia-300",
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const buildHighlightedHtml = (code: string, tokens: Token[]) => {
  if (tokens.length === 0) {
    return escapeHtml(code)
  }

  const sorted = [...tokens].sort((a, b) => a.start - b.start)
  let cursor = 0
  let html = ""

  for (const token of sorted) {
    if (token.start > cursor) {
      html += escapeHtml(code.slice(cursor, token.start))
    }

    html += `<span class="${tokenClassMap[token.type]}">${escapeHtml(code.slice(token.start, token.end))}</span>`
    cursor = token.end
  }

  if (cursor < code.length) {
    html += escapeHtml(code.slice(cursor))
  }

  return html
}

const highlightPython = (code: string) => {
  const occupied = new Array<boolean>(code.length).fill(false)
  const tokens: Token[] = []

  for (const { regex, type } of pythonPatterns) {
    regex.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(code)) !== null) {
      const start = match.index
      const end = start + match[0].length
      if (end <= start) {
        break
      }

      let overlaps = false
      for (let i = start; i < end; i++) {
        if (occupied[i]) {
          overlaps = true
          break
        }
      }

      if (overlaps) {
        continue
      }

      tokens.push({ start, end, type })
      for (let i = start; i < end; i++) {
        occupied[i] = true
      }
    }
  }

  return buildHighlightedHtml(code, tokens)
}

const highlightCode = (language: string, code: string) => {
  if (language === "python") {
    return highlightPython(code)
  }

  return escapeHtml(code)
}

const HighlightedCode = ({ language, code }: HighlightedCodeProps) => {
  const canonicalLanguage = language.toLowerCase()

  const highlighted = useMemo(() => {
    if (!code) return ""
    return highlightCode(canonicalLanguage, code)
  }, [canonicalLanguage, code])

  return (
    <pre className="max-h-[24rem] overflow-y-auto whitespace-pre font-mono text-base leading-relaxed text-slate-100">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  )
}

export default HighlightedCode
