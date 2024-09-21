export type ResyUser = {
    id: string,
    token: string,
    em_address: string,
    first_name: string,
    last_name: string,
    payment_methods: ResyPaymentMethod[]
}

export type ResyPaymentMethod = {
    id: string,
    display: string
}

export type ResyRestaurant = {
    id: string,
    name: string
    priceRange: number,
    location: string,
    slug: string,
    image: string | null,
    minPartySize: number,
    maxPartySize: number
}