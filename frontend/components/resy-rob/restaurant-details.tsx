import { useRestaurantContext } from "@/context/restaurantContext"
import Button, { ButtonHover } from "../common/button";

type RestaurantDetailsProps = {
    onRestaurantConfirm: () => void
}

export default function RestaurantDetails({ onRestaurantConfirm: handleRestaurantConfirm }: RestaurantDetailsProps) {
    const { restaurant } = useRestaurantContext();
    return (
        <>
            <div className="flex justify-center transform -translate-y-80 w-full">
                <div className="relative w-3/5">
                    <div className="absolute left-0 mt-1 w-full h-full">
                        {restaurant && (
                            <>
                                <div className="flex flex-col items-center w-full relative overflow-hidden">
                                    <h1 className="font-semibold text-2xl">{restaurant.name}</h1>
                                    <p className="text-sm text-gray-500">{"$".repeat(restaurant.priceRange)}</p>
                                    <p className="text-sm text-gray-500">{restaurant.location}</p>
                                </div>

                                <div className="flex mt-6 justify-center items-center gap-2">
                                    <Button onClick={handleRestaurantConfirm} label="Confirm" hover={ButtonHover.green} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}