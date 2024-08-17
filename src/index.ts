// cSpell:ignore giphy, kriston, wassup
import { Message, Client, GatewayIntentBits, Partials } from "discord.js"
import express, { Response, Request } from "express"
import dotenv from "dotenv"
import path from "path"
import { handleCreate } from "./commandHandlers/messageCreate"

dotenv.config()
const app = express()
const port = process.env.PORT ?? 8080

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/", (_: Request, res: Response) => {
    res.render("index")
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
    handleCreate(message)
})
