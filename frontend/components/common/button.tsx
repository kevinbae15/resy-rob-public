import { ButtonHTMLAttributes } from "react"

export enum ButtonHover {
    green = "hover:border-green-600 hover:text-green-600"
}

type ButtonProps = {
    label: string
    onClick?: () => void
    hover?: ButtonHover
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"]
}

export default function Button({
    label,
    onClick,
    hover,
    type
}: ButtonProps) {
    return (
        <button type={type} className={`w-20 border px-3 py-2 rounded-md text-xs text-gray-700 hover:shadow-md ${hover ?? ""}`} onClick={onClick}>
            {label}
        </button>
    )
}