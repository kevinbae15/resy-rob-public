import { ContextType } from "../.."

type ArgInput = {
    id: string,
    reservationToken: string
}

export async function setReservationTokenOnReservationSnipe(_parent: any, { id, reservationToken }: ArgInput, ctx: ContextType): Promise<void> {
    return await ctx.dataSources.reservationSnipe.setReservationToken(id, reservationToken);
}