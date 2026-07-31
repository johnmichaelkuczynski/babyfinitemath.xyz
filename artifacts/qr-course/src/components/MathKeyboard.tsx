import React from "react";

export interface MathKey {
  label: string;
  insert: string;
  cursorBack?: number;
  title?: string;
  /** Renders a thin vertical separator before this key — use to group related symbols. */
  dividerBefore?: boolean;
}

const DEFAULT_KEYS: MathKey[] = [
  // ── Arithmetic ────────────────────────────────────────────────────────────
  { label: "+",   insert: "+"  },
  { label: "−",   insert: "−",  title: "minus" },
  { label: "×",   insert: "×",  title: "times" },
  { label: "÷",   insert: "÷",  title: "divided by" },
  { label: "=",   insert: "="  },
  { label: "≠",   insert: "≠",  title: "not equal" },
  { label: "<",   insert: "<"  },
  { label: ">",   insert: ">"  },
  { label: "≤",   insert: "≤",  title: "less than or equal" },
  { label: "≥",   insert: "≥",  title: "greater than or equal" },
  { label: "≈",   insert: "≈",  title: "approximately" },
  { label: "±",   insert: "±",  title: "plus or minus" },
  { label: "%",   insert: "%",  title: "percent" },

  // ── Algebra / notation ────────────────────────────────────────────────────
  { label: "( )", insert: "()",  cursorBack: 1, title: "parentheses",            dividerBefore: true },
  { label: "[ ]", insert: "[]",  cursorBack: 1, title: "square brackets"         },
  { label: "{ }", insert: "{}",  cursorBack: 1, title: "curly braces (set)"      },
  { label: "a/b", insert: "/",                  title: "fraction / divide"        },
  { label: "x²",  insert: "²",                  title: "squared"                  },
  { label: "x³",  insert: "³",                  title: "cubed"                    },
  { label: "xⁿ",  insert: "ⁿ",                  title: "to the nth power"         },
  { label: "√",   insert: "√",                  title: "square root"              },
  { label: "∞",   insert: "∞",                  title: "infinity"                 },
  { label: "!",   insert: "!",                  title: "factorial (n!)"           },
  { label: "| |", insert: "||",  cursorBack: 1, title: "absolute value"           },

  // ── Sets ─────────────────────────────────────────────────────────────────
  { label: "∪",   insert: "∪",  title: "union",             dividerBefore: true },
  { label: "∩",   insert: "∩",  title: "intersection"       },
  { label: "∅",   insert: "∅",  title: "empty set"          },
  { label: "∈",   insert: "∈",  title: "element of"         },
  { label: "∉",   insert: "∉",  title: "not an element of"  },
  { label: "⊆",   insert: "⊆",  title: "subset or equal"    },
  { label: "⊂",   insert: "⊂",  title: "proper subset"      },
  { label: "∁",   insert: "∁",  title: "complement"         },

  // ── Logic ─────────────────────────────────────────────────────────────────
  { label: "∧",   insert: "∧",  title: "and (logical conjunction)",     dividerBefore: true },
  { label: "∨",   insert: "∨",  title: "or (logical disjunction)"       },
  { label: "¬",   insert: "¬",  title: "not (logical negation)"         },
  { label: "→",   insert: "→",  title: "implies / if–then"              },
  { label: "↔",   insert: "↔",  title: "if and only if (biconditional)" },
  { label: "∴",   insert: "∴",  title: "therefore"                      },

  // ── Stats / other ─────────────────────────────────────────────────────────
  { label: "x̄",   insert: "x̄",  title: "mean (x-bar)",  dividerBefore: true },
  { label: "Σ",   insert: "Σ",  title: "sum (sigma)"    },
  { label: "π",   insert: "π",  title: "pi"             },
  { label: "°",   insert: "°",  title: "degrees"        },
  { label: "½",   insert: "½",  title: "one half"       },
];

interface MathKeyboardProps {
  onInsert: (text: string, cursorBack?: number) => void;
  keys?: MathKey[];
  className?: string;
}

/**
 * A compact symbol palette for entering math/stat notation. Buttons use
 * onMouseDown + preventDefault so the associated textarea keeps focus and its
 * caret position when a symbol is inserted.
 *
 * Keys are grouped into sections (Arithmetic · Algebra · Sets · Logic · Stats)
 * separated by thin vertical dividers, covering every symbol needed across all
 * eight topics in the Basic Finite Math curriculum.
 */
export function MathKeyboard({ onInsert, keys = DEFAULT_KEYS, className }: MathKeyboardProps) {
  return (
    <div
      className={`flex flex-wrap gap-1 items-center ${className || ""}`}
      role="group"
      aria-label="Math symbol keyboard"
      data-testid="math-keyboard"
    >
      {keys.map((k, i) => (
        <React.Fragment key={`${k.label}-${i}`}>
          {k.dividerBefore && (
            <div
              className="self-stretch w-px bg-border mx-0.5 my-0.5"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            title={k.title || k.label}
            aria-label={k.title || k.label}
            onMouseDown={(e) => {
              e.preventDefault();
              onInsert(k.insert, k.cursorBack);
            }}
            className="min-w-[2.25rem] h-9 px-2 flex items-center justify-center rounded-md border border-input bg-card text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors select-none"
          >
            {k.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Splices `text` into a textarea at the current caret/selection and returns the
 * resulting value together with the caret position that should follow.
 */
export function insertAtTextareaCursor(
  el: HTMLTextAreaElement,
  text: string,
  cursorBack = 0,
): { value: string; cursor: number } {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const value = el.value.slice(0, start) + text + el.value.slice(end);
  const cursor = start + text.length - cursorBack;
  return { value, cursor };
}
