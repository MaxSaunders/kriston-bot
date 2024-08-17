// cSpell:ignore giphy
import axios from "axios"
import { MessagePayload } from "discord.js"

export const getRandomInt = (max: number = 1000) => {
    return Math.floor(Math.random() * max)
}

export const multiIncludes = (message: string, ...args: string[][]) => {
    return args.every((values) => {
        return values.find((match) => {
            return message.toLowerCase().includes(match)
        })
    })
}

export const queryGiphy = async (search: string, limit = 500): Promise<MessagePayload> => {
    const randomIndex = getRandomInt(limit)
    return axios({
        method: "get",
        url: `https://api.giphy.com/v1/gifs/search`,
        params: {
            api_key: process.env.GIPHY_API_KEY,
            q: search,
            limit: 1,
            offset: randomIndex,
        },
    }).then((response) => {
        const giphyObject = response.data?.data?.[0]
        if (giphyObject?.url) {
            return giphyObject.url
        } else if (response.data.meta.status === "429") {
            return "OOPS!, too many requests to the API, please wait a while. (We are using the free version)"
        } else {
            return "Something went wrong, please try again!"
        }
    })
}
