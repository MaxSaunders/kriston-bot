// cSpell:ignore giphy
import axios from "axios"
import { MessagePayload, User } from "discord.js"

export const getRandomInt = (max: number = 1000) => Math.floor(Math.random() * max)
export const getRandomPositiveInt = (max: number = 10) => Math.floor(Math.random() * (max - 1) + 1)

export const stringIsNan = (entry: string) => isNaN(parseInt(entry))

export const multiIncludes = (message: string, ...args: string[][]) => {
    return args.every((values) => {
        return values.some((match) => {
            return message.toLowerCase().includes(match)
        })
    })
}

export const queryGiphySafe = async (search: string): Promise<MessagePayload> => {
    return axios({
        method: "get",
        url: `https://api.giphy.com/v1/gifs/search`,
        params: {
            api_key: process.env.GIPHY_API_KEY,
            q: search,
            limit: 500,
            offset: 0,
        },
    }).then((response) => {
        const resultsLimit = response.data?.data.length
        const randomIndex = getRandomInt(resultsLimit)
        const giphyObject = response.data?.data?.[randomIndex]

        if (giphyObject?.url) {
            return giphyObject.url
        } else if (response.data.meta.status === "429") {
            return "OOPS!, too many requests to the API, please wait a while. (We are using the free version)"
        } else {
            return "Something went wrong, please try again!"
        }
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

export const generateProfaneMessage = (user: User) => {}

export const generateMessageByLine = (messageArray: string[]): string =>
    messageArray.reduce((message, entry) => `${message}\n${entry}`, "")

export const generateMessageTable = (messageArray: string[][]): string => {
    const maxSizes: number[] = []
    const bufferSize = 2
    const bufferChar = " "
    let result = ""

    messageArray.forEach((row) => {
        row.forEach((col, colIndex) => {
            if (!maxSizes[colIndex] || maxSizes[colIndex] < col.length) {
                maxSizes[colIndex] = col.length
            }
        })
    })

    messageArray.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            const colSize = maxSizes[colIndex]

            if (colIndex !== 0) {
                result += `|${bufferChar}`
            }

            if (colIndex === col.length - 1) {
                result += `${col.padEnd(colSize, bufferChar)}`
            } else {
                result += `${col.padEnd(colSize + bufferSize, bufferChar)}`
            }
        })

        if (rowIndex !== messageArray.length - 1) {
            result += "\n"
            // result += "\n---------------------------------------\n"
        }
    })

    return result
}
