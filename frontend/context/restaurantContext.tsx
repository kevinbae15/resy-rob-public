// DataContext.js
import React, { ReactNode, createContext, useContext, useState } from 'react';
import { ResyRestaurant } from '../../common/types/resyObjects';

export type RestaurantContextType = {
    restaurant: ResyRestaurant | null,
    setRestaurant: (id: ResyRestaurant) => void;
}

const RestaurantContext = createContext<RestaurantContextType>({
    restaurant: null,
    setRestaurant: () => { }
});

type RestaurantData = Omit<RestaurantContextType, "setRestaurant">

// Create a provider component
export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
    const [restaurantData, setRestaurantData] = useState<RestaurantData>({
        restaurant: null
    });

    const setRestaurant = (restaurant: ResyRestaurant): void => {
        setRestaurantData({
            ...restaurantData,
            restaurant
        })
    }

    const value = {
        ...restaurantData,
        setRestaurant
    }

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
};

export const useRestaurantContext = (): RestaurantContextType => useContext(RestaurantContext);
