import { ResyRestaurant } from "../../../common/types/resyObjects"

type RestaurantDropdownItemProps = {
    onClick: () => void
    restaurant: ResyRestaurant
}

export default function RestaurantDropdownItem({
    onClick: handleClickProp,
    restaurant
}: RestaurantDropdownItemProps) {
    return (
        <>
            <li onClick={handleClickProp} className="flex items-center border-b border-gray-200 w-full h-20 relative overflow-hidden hover:underline hover:cursor-pointer">
                <div className="w-1/2 relative">
                    <img src={restaurant.image ?? ""} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, .7) 40%, rgba(255, 255, 255, 1) 100%)' }}></div>
                </div>
                <div className="flex-1 -ml-1 z-10">
                    <h3 className="font-semibold">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">{"$".repeat(restaurant.priceRange)} {restaurant.location} </p>
                </div>
            </li>
        </>
    )
}