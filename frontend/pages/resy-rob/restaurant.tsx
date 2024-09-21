"use client"

import RestaurantSearchInput from "../../components/resy-rob/restaurant-search-input";
import { ResyRestaurant } from "../../../common/types/resyObjects"
import RestaurantDetails from "../../components/resy-rob/restaurant-details";
import { useRouter } from "next/navigation";
import { RestaurantContextType, useRestaurantContext } from "../../context/restaurantContext";
import { RESY_TOKEN_COOKIE_NAME, getCookieValue, getResyToken } from "@/utils/cookie-helper";

export default function Page() {
  const { restaurant, setRestaurant } = useRestaurantContext() as RestaurantContextType;
  const router = useRouter()

  function handleRestaurantSelect(restaurant: ResyRestaurant) {
    setRestaurant(restaurant)
  }

  function handleRestaurantConfirm() {
    if (getResyToken()) {
      router.push("/resy-rob/snipe")
    } else {
      router.push("login/")
    }
  }

  return (
    <>
      {/* A special input with a dropdown */}
      {restaurant && <RestaurantDetails onRestaurantConfirm={handleRestaurantConfirm} />}
      <RestaurantSearchInput onRestaurantSelect={handleRestaurantSelect} />
    </>
  );
}
