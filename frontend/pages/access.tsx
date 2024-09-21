import Input from "../components/common/input";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import gql from "graphql-tag";
import { print } from 'graphql';
import { useRef, useState } from "react";
import { ACCESS_TOKEN_COOKIE_NAME, setCookie } from "../utils/cookie-helper";
import Form from "../components/common/form";

const ACCESS_CODE_FIELD = "accessCode"

export default function Access() {
  // TODO: if already set, lets go to the next page
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const router = useRouter();

  async function handleSubmit(formData: Record<string, FormDataEntryValue>) {
    setIsLoading(true);
    const accessCode = formData[ACCESS_CODE_FIELD]

    const mutation = gql`
      mutation GainAccessToRobOnWebApp($password: String!) {
        gainAccessToRob(password: $password) {
          token
          tokenExpiresAt
        }
      }
    `

    const body = {
      query: print(mutation),
      variables: {
        password: accessCode ?? ""
      }
    }

    const response = await (await fetch(process.env.NEXT_PUBLIC_ROB_GQL_API_URL ?? "https://api.robbitybobbity.com/graphql/", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    })).json()

    if (response.errors) {
      setErrorMessage(response.errors[0].message)
      setIsLoading(false);
      return
    }

    // Setting the access token in a cookie for later retrieval
    const token = response.data.gainAccessToRob.token
    const tokenExpiresAt = response.data.gainAccessToRob.tokenExpiresAt
    setCookie(ACCESS_TOKEN_COOKIE_NAME, token, tokenExpiresAt)

    router.push("/resy-rob/restaurant")
  }


  return (
    <div className="flex justify-center transform -translate-y-20 w-full">
      <Form
        onSubmit={handleSubmit}
        isLoading={isLoading}
      >
        <Input
          name={ACCESS_CODE_FIELD}
          placeholder="Access code"
          Icon={<LockClosedIcon />}
          isLoading={isLoading}
          errorMessage={errorMessage}
          inputRef={inputRef}
          type="password"
        />
      </Form>
    </div>
  );

}
