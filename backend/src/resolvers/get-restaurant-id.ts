import { ContextType } from "../..";
import { ResyRestaurant } from "../../../common/types/resyObjects";

type ArgInput = {
    filter: {
        city?: string,
        name: string
    }
}

export async function getRestaurants(_parent: any, { filter }: ArgInput, ctx: ContextType): Promise<ResyRestaurant[]> {
    return await ctx.dataSources.resy.getRestaurants(filter.city ?? null, filter.name)
}