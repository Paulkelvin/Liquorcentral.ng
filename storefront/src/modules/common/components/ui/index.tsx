import clsx from "clsx"
import {
  ButtonHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react"

// TODO: Add Toaster component back when needed for notifications

// Re-export clsx as clx for compatibility
export { clsx as clx }

/**
 * Shared UI primitives (Phase 0c — Storefront Foundation). Every class here
 * resolves through the LiquorCentral Design System's Tier 3 semantic tokens
 * (DESIGN_SYSTEM.md §B6 — see tailwind.config.js/globals.css), never a raw
 * Tailwind color/gray value — the same discipline that document's
 * "Component Philosophy" section requires. These are the primitives every
 * future specification implementation (Homepage, Navigation, Product
 * Listing, etc.) composes from; none of them encode page-specific behavior.
 */

// Text Component
type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div"
  size?: "caption" | "body" | "body-lg"
  muted?: boolean
}

const textSizeClass: Record<NonNullable<TextProps["size"]>, string> = {
  caption: "text-caption",
  body: "text-body",
  "body-lg": "text-body-lg",
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    { className, as: Component = "p", size = "body", muted, children, ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          textSizeClass[size],
          muted ? "text-text-muted" : "text-text-primary",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Text.displayName = "Text"

// Heading Component
type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: "h1" | "h2" | "h3" | "h4"
  display?: boolean
}

const headingSizeByLevel: Record<NonNullable<HeadingProps["level"]>, string> = {
  h1: "text-heading-1",
  h2: "text-heading-2",
  h3: "text-heading-3",
  h4: "text-heading-4",
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level: Component = "h2", display = false, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={clsx(
          "font-bold text-text-primary",
          headingSizeByLevel[Component],
          display && "font-display",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

// Button Component
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "transparent"
  size?: "small" | "medium" | "large"
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "medium",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex gap-2 items-center justify-center rounded-radius-md font-medium transition-colors duration-standard ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 disabled:bg-disabled-surface disabled:text-disabled",
          variant === "primary" && "bg-primary text-surface-elevated hover:bg-primary-hover active:bg-primary-active",
          variant === "secondary" &&
            "bg-surface-elevated text-text-primary border border-border hover:bg-ink-100",
          variant === "transparent" &&
            "bg-transparent text-interactive hover:bg-ink-100",
          // Minimum 44x44px touch target (DESIGN_SYSTEM.md §B11), regardless
          // of visual size — "small" keeps a smaller visual footprint via
          // padding/font-size, but never drops below 44px min-height.
          size === "small" && "min-h-[44px] px-3 text-caption",
          size === "medium" && "min-h-[44px] px-4 text-body",
          size === "large" && "min-h-[48px] px-6 text-body-lg",
          className
        )}
        {...props}
      >
        {isLoading ? "Loading…" : children}
      </button>
    )
  }
)
Button.displayName = "Button"

// Container Component
type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, elevated = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-radius-md p-4",
          elevated ? "bg-surface-elevated shadow-elevation-1" : "bg-surface",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

// Badge Component
type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: "success" | "danger" | "information" | "warning" | "neutral" | "accent"
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color = "neutral", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center rounded-radius-full px-2 py-1 text-caption font-medium",
          color === "success" && "bg-success-tint text-success",
          color === "danger" && "bg-danger-tint text-danger",
          color === "information" && "bg-information-tint text-information",
          color === "warning" && "bg-warning-tint text-warning",
          color === "neutral" && "bg-ink-100 text-text-secondary",
          // Accent (Gold) is a premium marker only — always on a dark
          // ground, per DESIGN_SYSTEM.md's explicit Gold Usage rule.
          color === "accent" && "bg-ink-900 text-accent",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// IconBadge Component
type IconBadgeProps = HTMLAttributes<HTMLSpanElement>

export const IconBadge = forwardRef<HTMLSpanElement, IconBadgeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-radius-full bg-ink-100 p-1 text-text-secondary",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
IconBadge.displayName = "IconBadge"

// IconButton Component
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-radius-md min-h-[44px] min-w-[44px] p-2 text-text-primary",
          "hover:bg-ink-100 transition-colors duration-micro ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

// Label Component
type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx("text-caption font-medium text-text-secondary", className)}
        {...props}
      >
        {children}
      </label>
    )
  }
)
Label.displayName = "Label"

// Input Component
//
// Labels are always visible above the field, never placeholder-only
// (DESIGN_SYSTEM.md §B9) — the `label` prop renders one, it is never
// substituted with a placeholder as the only affordance.
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <Label htmlFor={id}>{label}</Label>}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={clsx(
            "flex min-h-[44px] w-full rounded-radius-sm border bg-surface-elevated px-3 py-2 text-body text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled-surface",
            error ? "border-danger" : "border-border",
            className
          )}
          {...props}
        />
        {/* Errors appear directly below the field, in plain language
            (DESIGN_SYSTEM.md §B9) — never a generic "invalid input". */}
        {error && (
          <p id={id ? `${id}-error` : undefined} role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Table Components
type TableProps = TableHTMLAttributes<HTMLTableElement>

const TableRoot = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={clsx("w-full caption-bottom text-body", className)}
        {...props}
      >
        {children}
      </table>
    )
  }
)
TableRoot.displayName = "Table"

type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={clsx("[&_tr]:border-b [&_tr]:border-divider", className)}
        {...props}
      >
        {children}
      </thead>
    )
  }
)
TableHeader.displayName = "TableHeader"

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={clsx("[&_tr:last-child]:border-0", className)}
        {...props}
      >
        {children}
      </tbody>
    )
  }
)
TableBody.displayName = "TableBody"

type TableRowProps = HTMLAttributes<HTMLTableRowElement>

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={clsx(
          "border-b border-divider transition-colors hover:bg-ink-100",
          className
        )}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
TableRow.displayName = "TableRow"

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement>

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={clsx(
          "h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </th>
    )
  }
)
TableHead.displayName = "TableHead"

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={clsx(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  }
)
TableCell.displayName = "TableCell"

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  HeaderCell: TableHead,
  Cell: TableCell,
})

// RadioGroup Components
type RadioGroupProps = HTMLAttributes<HTMLDivElement>

const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
RadioGroupRoot.displayName = "RadioGroup"

type RadioGroupItemProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="radio"
          id={id}
          className={clsx(
            "h-4 w-4 border-border text-primary focus-visible:ring-2 focus-visible:ring-focus",
            className
          )}
          {...props}
        />
        {label && <Label htmlFor={id}>{label}</Label>}
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
})

// Checkbox Component
type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={clsx(
            "h-4 w-4 rounded-radius-sm border-border text-primary focus-visible:ring-2 focus-visible:ring-focus",
            className
          )}
          {...props}
        />
        {label && <Label htmlFor={id}>{label}</Label>}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"
