import { HTMLInputTypeAttribute, RefObject } from "react";
import Tooltip from "./tooltip";

type Props = {
  name: string,
  Icon?: JSX.Element | null,
  placeholder?: string | null,
  isLoading: boolean,
  inputRef?: RefObject<HTMLInputElement> | null,
  errorMessage?: string | null
  type?: HTMLInputTypeAttribute
  label?: string
  minNumber?: number
  maxNumber?: number
  toolTipText?: string
}

export default function Input({
  name,
  placeholder,
  Icon,
  isLoading,
  inputRef,
  errorMessage,
  type,
  label,
  minNumber,
  maxNumber,
  toolTipText
}: Props) {
  return (
    <>
      <div className="flex flex-col mb-4 relative">
        {label && (
          <label htmlFor={name} className="flex items-center gap-1">
            {label}
            {toolTipText && <Tooltip text={toolTipText} />}
          </label>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            name={name}
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
            placeholder={placeholder ?? ""}
            disabled={isLoading}
            type={type}
            min={minNumber}
            max={maxNumber}
          />
          {Icon && (
            <Icon.type
              className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900"
            />
          )}
        </div>
        <div>{errorMessage}</div>
      </div>
    </>

  )
}