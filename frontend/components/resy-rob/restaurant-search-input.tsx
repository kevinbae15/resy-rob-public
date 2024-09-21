"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { debounce } from 'lodash';
import gql from "graphql-tag";
import { print } from 'graphql';
import { getAccessToken } from "@/utils/cookie-helper";
import { useRouter } from "next/navigation";
import { ResyRestaurant } from "../../../common/types/resyObjects";
import RestaurantDropdownItem from "./restaurant-dropdown-item";

type RestaurantSearchInputProps = {
  onRestaurantSelect: (restaurant: ResyRestaurant) => void
}

export default function RestaurantSearchInput({
  onRestaurantSelect: handleRestaurantSelect
}: RestaurantSearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [restaurantOptions, setRestaurantOptions] = useState<any>([])
  const haveSomeRestaurantOptions = restaurantOptions.length > 0;
  // let accessToken;
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.push("/access")
    }
  })

  const debouncedSearch = useCallback(
    debounce(async (nextValue) => await fetchSearchResults(nextValue), 300),
    []
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: nextValue } = event.target;
    debouncedSearch(nextValue);
  };

  async function fetchSearchResults(input: string) {
    if (input.trim() === "") {
      return setRestaurantOptions([])
    }

    const query = gql`
      query SearchForRestaurants($filter: GetRestaurantFilter!) {
        getRestaurants(filter: $filter) {
          id
          name
          priceRange
          location
          slug
          image
        }
      }
    `

    const body = {
      query: print(query),
      variables: {
        filter: {
          name: input
        }
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
      console.error(response)
      return
    }

    setRestaurantOptions(response.data.getRestaurants)
  }

  function handleRestaurantSelectLocal(restaurant: ResyRestaurant) {
    setRestaurantOptions([])
    handleRestaurantSelect(restaurant)
  }

  return (
    <>
      <div className="flex justify-center transform -translate-y-20 w-full">
        <div className="relative w-3/5">
          <input
            ref={inputRef}
            className={`peer block w-full  border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 ${haveSomeRestaurantOptions ? 'rounded-tl-md rounded-tr-md' : 'rounded-md'}`}
            placeholder="Search for a restaurant"
            onChange={handleSearch}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] transform -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          {haveSomeRestaurantOptions && (
            <div className="absolute left-0 w-full bg-white border border-t-0 border-gray-200" x-show="isOpen">
              <ul>
                {restaurantOptions.map((restaurant: ResyRestaurant) => (
                  <RestaurantDropdownItem key={restaurant.id} onClick={() => { handleRestaurantSelectLocal(restaurant) }} restaurant={restaurant} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div >
    </>
  )
}
