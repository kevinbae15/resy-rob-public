'use client';

import { ReactNode } from "react";
import { RestaurantProvider } from "../context/restaurantContext";


export function Providers({ children }: { children: ReactNode }) {
    return (
        <RestaurantProvider>{children}</RestaurantProvider>
    );
}