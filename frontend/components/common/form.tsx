import { Children, FormEvent, ReactNode, isValidElement, useRef } from "react"

type Props = {
    onSubmit: (formData: Record<string, FormDataEntryValue>) => Promise<void>,
    isLoading: boolean,
    errorMessage?: string | null
    children: ReactNode
}

export default function Form({
    onSubmit: handleSubmitProp,
    errorMessage,
    children
}: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const localHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef?.current) {
            const formData = new FormData(formRef.current);
            const data: Record<string, FormDataEntryValue> = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            handleSubmitProp(data)
        }
    };

    return (
        <>
            <div className="relative w-3/5">
                <form onSubmit={localHandleSubmit} ref={formRef}>
                    {Children.toArray(children).filter((child) => {
                        return isValidElement(child)
                    })}
                </form>
            </div>
            {errorMessage && (
                <div className="mt-1">
                    <p className="text-red-500 py-2 px-4 rounded-md">{errorMessage}</p>
                </div>
            )}
        </>
    )
}