import { useState } from 'react'
import { Tabs } from '@ark-ui/react/tabs'
import { Cryptex } from '../lib/cryptex'
import { Acrostic, type AcrosticProps } from '../lib/acrostic'

const STORAGE_PREFIX = 'blue-prince'

function loadPersisted<T>(key: string): T | undefined {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}:${key}`)
    return stored ? (JSON.parse(stored) as T) : undefined
  } catch {
    return undefined
  }
}

function savePersisted<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value))
  } catch {
    // Storage full, disabled, or private browsing — progress just won't persist.
  }
}

interface CryptexPuzzleData {
  value: string
  tabLabel: string
  title: string
  description: string
  letters: string[][]
  solution?: string
}

interface AcrosticPuzzleData {
  value: string
  tabLabel: string
  title: string
  description: string
  directions: string[]
  props: AcrosticProps
}

// THICk is spelled out in the clue itself, so the candidates below are seeded
// with a real guess. The rest are unknown — each wheel is a single "?" filler
// until the real candidate letters are worked out.
const CRYPTEX_PUZZLES: CryptexPuzzleData[] = [
  {
    value: 'cryptex-1',
    tabLabel: 'Gallery Puzzle 1',
    title: 'Gallery Puzzle 1 — 5 letters',
    description: 'This puzzle has a picture with the word THICk.',
    letters: [
      ['S', 'B', 'T'],
      ['A', 'H', 'O'],
      ['U', 'E', 'I'],
      ['G', 'K', 'C'],
      ['D', 'N', 'K'],
    ],
    solution: 'THINK',
  },
  {
    value: 'cryptex-2',
    tabLabel: 'Gallery Puzzle 2',
    title: 'Gallery Puzzle 2 — 6 letters',
    description:
      'This puzzle has a picture with several red items appearing twice, reflected left and right, with a single P above the one on the right.',
    letters: Array.from({ length: 6 }, () => ['?']),
  },
  {
    value: 'cryptex-3',
    tabLabel: 'Gallery Puzzle 3',
    title: 'Gallery Puzzle 3 — 6 letters',
    description: 'This puzzle has a bunch of eyeballs, with partial words: VERI, GENU appearing.',
    letters: Array.from({ length: 6 }, () => ['?']),
  },
  {
    value: 'cryptex-4',
    tabLabel: 'Gallery Puzzle 4',
    title: 'Gallery Puzzle 4 — 7 letters',
    description:
      'This puzzle has a animal skin rug, the infinity sign appearing with nails in it, and a checkboard floor.',
    letters: Array.from({ length: 7 }, () => ['?']),
  },
]

const ACROSTIC_PUZZLE: AcrosticPuzzleData = {
  value: 'acrostic-1',
  tabLabel: 'Baron Bafflers',
  title: 'Acrostic — Baron Bafflers',
  description: 'This puzzle is dug up somewhere.',
  directions: [
    'Each clue is a hint for two different words: the word below (the long word) and a second smaller word found within that word (the small word).',
    "Each Letter in the small word will be included in the next clue's long word.",
    "Lastly, the first letter of each small word forms this week's solution - a member of the sixth clue!",
  ],

  props: {
    lettersInNextWord: true,
    lines: [
      {
        clue: 'Kept behind locked doors.',
        longWordLength: 6,
        smallWordStart: 2,
        smallWordEnd: 4,
      },
      {
        clue: 'Can affect one greatly when made by someone with a strong spirit.',
        longWordLength: 7,
        smallWordStart: 1,
        smallWordEnd: 3,
      },
      {
        clue: 'Makes the validity of a statement clear.',
        longWordLength: 6,
        smallWordStart: 0,
        smallWordEnd: 2,
      },
      {
        clue: 'On a certain scale, this is very hot.',
        longWordLength: 6,
        smallWordStart: 3,
        smallWordEnd: 5,
      },
      {
        clue: "Informs you that there's no school today.",
        longWordLength: 6,
        smallWordStart: 3,
        smallWordEnd: 5,
      },
      {
        clue: 'A group composed of members that have similar characteristics.',
        longWordLength: 6,
        smallWordStart: 2,
        smallWordEnd: 5,
      },
    ],
  },
}

function CryptexPuzzle({ value, title, description, letters, solution }: CryptexPuzzleData) {
  const [defaultValue] = useState(() => loadPersisted<string[]>(value))

  return (
    <div className="example">
      <div className="example-heading">
        <h2>{title}</h2>
        <p className="example-description">{description}</p>
      </div>

      <Cryptex.Root
        className="cryptex"
        letters={letters}
        solution={solution}
        defaultValue={defaultValue}
        onValueChange={(details) => savePersisted(value, details.value)}
      >
        <Cryptex.Label className="cryptex-label">Crack the cryptex</Cryptex.Label>

        <div className="cryptex-wheels">
          {letters.map((candidates, index) => (
            <Cryptex.Wheel key={index} index={index} letters={candidates} className="cryptex-wheel" />
          ))}
        </div>

        <Cryptex.ValueText className="cryptex-value-text" />

        <Cryptex.SolvedIndicator className="cryptex-solved" fallback={<span>Locked</span>}>
          Unlocked! The word was {solution}.
        </Cryptex.SolvedIndicator>
      </Cryptex.Root>
    </div>
  )
}

function AcrosticPuzzle({
  value,
  title,
  description,
  directions,
  props: { lines, solution, lettersInNextWord },
}: AcrosticPuzzleData) {
  const [defaultGuesses] = useState(() => loadPersisted<string[][]>(value))

  return (
    <div className="example">
      <div className="example-heading">
        <h2>{title}</h2>
        <p className="example-description">{description}</p>
        {directions.map((dir, index) => (
          <p className="example-directions" key={`directions-${index}`}>
            {dir}
          </p>
        ))}
      </div>

      <Acrostic.Root
        className="acrostic"
        lines={lines}
        solution={solution}
        lettersInNextWord={lettersInNextWord}
        onAnswerChange={(details) => savePersisted(value, details.guesses)}
        defaultGuesses={defaultGuesses}
      >
        {lines!.map((_, index) => (
          <Acrostic.Line key={index} index={index} className="acrostic-line" />
        ))}

        <div className="acrostic-answer-row">
          <span className="acrostic-answer-label">Answer</span>
          <Acrostic.Answer className="acrostic-answer" />
        </div>

        <Acrostic.SolvedIndicator className="acrostic-solved" fallback={<span>Keep going…</span>}>
          Solved? The answers spell {solution}.
        </Acrostic.SolvedIndicator>
      </Acrostic.Root>
    </div>
  )
}

export function BluePrincePage() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Blue Prince Puzzles</h1>
        <p>
          <a href="https://www.blueprincegame.com/" target="_blank" rel="noopener noreferrer">
            Blue Prince
          </a>{' '}
          is a puzzle game where players solve various challenges to progress through the story. It's a major influence
          for puzzleui, and some of the puzzles that inspired its components are presented here.
        </p>
      </header>

      <Tabs.Root defaultValue={ACROSTIC_PUZZLE.value} className="tabs">
        <Tabs.List className="tabs-list">
          <Tabs.Trigger value={ACROSTIC_PUZZLE.value} className="tabs-trigger">
            {ACROSTIC_PUZZLE.tabLabel}
          </Tabs.Trigger>
          {CRYPTEX_PUZZLES.map((puzzle) => (
            <Tabs.Trigger key={puzzle.value} value={puzzle.value} className="tabs-trigger">
              {puzzle.tabLabel}
            </Tabs.Trigger>
          ))}
          <Tabs.Indicator className="tabs-indicator" />
        </Tabs.List>

        <Tabs.Content value={ACROSTIC_PUZZLE.value} className="tabs-content">
          <AcrosticPuzzle {...ACROSTIC_PUZZLE} />
        </Tabs.Content>

        {CRYPTEX_PUZZLES.map((puzzle) => (
          <Tabs.Content key={puzzle.value} value={puzzle.value} className="tabs-content">
            <CryptexPuzzle {...puzzle} />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      <footer className="app-footer">
        <p>
          Blue Prince is a puzzle game developed by Dogubomb and published by Raw Fury. All puzzle content, names, and
          imagery referenced above belong to their respective copyright holders. This page is an unofficial, fan-made
          reference tool for personal use — it is not affiliated with, endorsed by, or sponsored by Dogubomb or Raw
          Fury.
        </p>

        <p>
          If you enjoy puzzles like these, consider supporting the creators of Blue Prince by purchasing the game and
          exploring their other works!
        </p>
      </footer>
    </div>
  )
}
