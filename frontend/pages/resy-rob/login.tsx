"use client"

import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import gql from "graphql-tag";
import { print } from 'graphql';
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ACCESS_TOKEN_COOKIE_NAME, RESY_TOKEN_COOKIE_NAME, getAccessToken, getCookieValue, getResyToken, setCookie } from "@/utils/cookie-helper";
import moment from "moment";

export default function Page() {
    // TODO: if already set, lets go to the next page
    // TODO: check for access token
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const router = useRouter();


    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            router.push("/access")
        }

        if (getResyToken()) {
            router.push("/resy-rob/snipe")
        }
    })

    async function handleSubmit(e: HTMLFormElement) {
        e.preventDefault();
        setIsLoading(true);

        const mutation = gql`
            mutation signIntoResyAccountOnWebApp($email: String! $password: String!) {
                signIntoResyAccount(email: $email password: $password) {
                name
                token
                hasPaymentMethod
                }
            }
        `

        const body = {
            query: print(mutation),
            variables: {
                email: emailInputRef.current?.value ?? "",
                password: passwordInputRef.current?.value ?? ""
            }
        }

        const response = await (await fetch(process.env.NEXT_PUBLIC_ROB_GQL_API_URL ?? "https://api.robbitybobbity.com/graphql/", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Access-Token": getAccessToken()!
            }
        })).json()

        if (response.errors) {
            setErrorMessage(response.errors[0].message)
            setIsLoading(false);
            return
        }

        const token = response.data.signIntoResyAccount.token
        // Setting the expiration to 1 hour even though in reality, it lives forever
        const tokenExpiresAt = moment().utc().add(1, "hour").toISOString()
        setCookie(RESY_TOKEN_COOKIE_NAME, token, tokenExpiresAt)

        router.push("/resy-rob/snipe")
    }

    return (
        <>
            <div className="relative w-3/5">
                <form onSubmit={handleSubmit}>
                    {/* TODO form validation */}
                    <input
                        ref={emailInputRef}
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                        placeholder={"Resy Email"}
                        disabled={isLoading}
                    />
                    <UserIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] transform -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    <input
                        ref={passwordInputRef}
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                        placeholder={"Password"}
                        disabled={isLoading}
                        type="password"
                    />
                    <LockClosedIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] transform -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div className="mt-1">
                <p className="text-red-500 py-2 px-4 rounded-md">{errorMessage}</p>
            </div>
        </>
    )
}