import { Checkbox, Label } from "@modules/common/components/ui"
import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  id?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  id,
  'data-testid': dataTestId
}) => {
  // A hardcoded "checkbox" id previously collided whenever more than one
  // instance rendered on the same page (e.g. one "set as default" checkbox
  // per saved address) — each instance now needs its own id.
  const inputId = id || name || "checkbox"

  return (
    <div className="flex items-center space-x-2 ">
      <Checkbox
        className="text-base-regular flex items-center gap-x-2"
        id={inputId}
        role="checkbox"
        checked={checked}
        readOnly
        aria-checked={checked}
        onClick={onChange}
        name={name}
        data-testid={dataTestId}
      />
      <Label
        htmlFor={inputId}
        className="!transform-none !txt-medium"
      >
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
