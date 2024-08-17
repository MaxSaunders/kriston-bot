// cSpell:ignore giphy, kriston, wassup
import { Message, Client, GatewayIntentBits, Partials } from "discord.js"
import express, { Response, Request } from "express"
import dotenv from "dotenv"

import { multiIncludes, queryGiphy } from "./utils"

dotenv.config()
const app = express()
const port = process.env.PORT ?? 8080

app.get("/", (_: Request, res: Response) => {
    res.send("Hello Node.js on App Engine Standard!")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
})

client.login(process.env.DISCORD_TOKEN)

client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return

    const { content, channel, author } = message
    const messageContent = content.toLowerCase()

    if (
        multiIncludes(
            content,
            ["hi", "hello", "hey", "sup", "wassup", "yo"],
            ["bot", "kriston-bot", "ai"]
        )
    ) {
        channel.send(`Hey there ${author}`)
        return
    }

    if (messageContent.includes("/ping")) {
        channel.send(`Pong!`)
        return
    }

    if (messageContent.includes("/poll")) {
        const [question, answers, duration = "1", allowMultiSelect = "false"] = messageContent
            .replace("/poll", "")
            .split("/")
            .map((i) => i.trim())
        if (
            !question ||
            !answers ||
            isNaN(parseInt(duration)) ||
            (allowMultiSelect.toLowerCase() !== "false" &&
                allowMultiSelect.toLowerCase() !== "true")
        ) {
            channel.send(
                "Please send poll command in the following format:\n`/poll <question> / <answers separated by comma> / <duration (in hours) : optional | default = 1> / <allowMultiSelect: optional | default = false>`"
            )
            return
        }
        channel.send({
            poll: {
                question: { text: question },
                answers: answers.split(",").map((a) => ({ text: a.trim() })),
                allowMultiselect: allowMultiSelect.toLowerCase() === "true",
                duration: parseInt(duration),
            },
        })
        return
    }

    if (messageContent.includes("/sb")) {
        const response = await queryGiphy("spongebob")
        channel.send(response)
        return
    }

    if (messageContent.includes("/anime")) {
        const response = await queryGiphy("anime")
        channel.send(response)
        return
    }

    if (messageContent.includes("/escanor")) {
        const response = await queryGiphy("escanor", 100)
        channel.send(response)
        return
    }
})

// if (messageContent.includes("/play")) {
// }
// EmbedBuilder()
