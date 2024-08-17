// cSpell:ignore giphy, kriston, wassup, escanor, spongebob, yugioh
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    codeBlock,
    inlineCode,
    Message,
    MessageType,
} from "discord.js"

import {
    generateMessageByLine,
    generateMessageTable,
    getRandomPositiveInt,
    multiIncludes,
    queryGiphy,
    queryGiphySafe,
    stringIsNan,
} from "../utils/utils"
import { BOT_NAMES, GREETINGS, PROFANITY } from "../constants/words"
import { randomTeamGenerator } from "../utils/teamGen"

const allowedTypes: number[] = [MessageType.Default, MessageType.Reply].map((i) => i.valueOf())

export const handleCreate = async (message: Message) => {
    const commandChar = process.env.COMMAND_CHAR ?? "/"

    if (
        message.webhookId ||
        message.author.bot ||
        !message.channel ||
        !allowedTypes.includes(message.type.valueOf())
    )
        return false

    const { content, channel, author } = message
    const c = (command: string) => `${commandChar}${command}`

    const [command] = content
        .trim()
        .split(" ")
        .map((i) => i.trim())
    const getMessageContent = () => content.toLowerCase()

    if (multiIncludes(content, PROFANITY, BOT_NAMES)) {
        return message.reply(`That's not very nice, ${author}`)
    }

    if (multiIncludes(content, GREETINGS, BOT_NAMES)) {
        return message.reply(`Hey there ${author}`)
    }

    // Command controllers

    switch (command) {
        case c("ping"):
            return message.reply(`Pong!`)

        case c("poll"):
            const messageContent = getMessageContent()
            const [question, answers, duration = "1", allowMultiSelect = "false"] = messageContent
                .replace(`${commandChar}poll`, "")
                .trim()
                .split("/")
                .map((i) => i.trim())
            if (
                !question ||
                !answers ||
                stringIsNan(duration) ||
                (allowMultiSelect.toLowerCase() !== "false" &&
                    allowMultiSelect.toLowerCase() !== "true")
            ) {
                message.reply(
                    `Please send poll command in the following format:\n\n${inlineCode(
                        `${commandChar}poll <question> / <answers separated by comma> / <duration (in hours) : optional | default = 1> / <allowMultiSelect: optional | default = false>`
                    )}`
                )
                return
            }
            return channel.send({
                poll: {
                    question: { text: question },
                    answers: answers.split(",").map((a) => ({ text: a.trim() })),
                    allowMultiselect: allowMultiSelect.toLowerCase() === "true",
                    duration: parseInt(duration),
                },
            })

        case c("roll"):
            const maxNumber = getMessageContent().replace(`${commandChar}roll`, "").trim()

            if (!maxNumber) {
                return message.reply(
                    `Please send roll command in the following format:\n\n${commandChar}roll <maxNumber>`
                )
            }

            if (stringIsNan(maxNumber)) {
                return message.reply("Given string is not a valid number")
            }

            const result = getRandomPositiveInt(parseInt(maxNumber))
            return message.reply(`:game_die: You rolled a: ${result} :game_die:`)

        // Gif Commands

        case c("sb"):
            return channel.send(await queryGiphy("spongebob"))

        case c("anime"):
            return channel.send(await queryGiphy("anime"))

        case c("yugioh"):
        case c("yu-gi-oh"):
            return channel.send(await queryGiphySafe("yugioh"))

        case c("escanor"):
            return channel.send(await queryGiphySafe("escanor"))

        case c("teams"):
            const [numberOfTeams, ...people] = message.content
                .replace(`${commandChar}teams`, "")
                .trim()
                .split(" ")

            if (stringIsNan(numberOfTeams) || people.length < 2) {
                return channel.send(
                    `Please send teams information in the following format:\n\n${inlineCode(
                        `${commandChar}teams <number of teams> <people separated by a space>`
                    )}`
                )
            }

            const generateTeamMessage = async (reply?: Message<boolean>) => {
                const teams: string[][] = randomTeamGenerator(parseInt(numberOfTeams), people)
                const teamsByLine = teams.map((team) => team.join(" "))
                const replyMessage = codeBlock(
                    generateMessageByLine(["Here are the teams:\n", ...teamsByLine, "\n"])
                )

                const rerollButton = new ButtonBuilder()
                    .setCustomId("reroll")
                    .setLabel("Reroll Teams")
                    .setStyle(ButtonStyle.Primary)

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rerollButton)

                const response = reply
                    ? await reply.edit({
                          content: replyMessage,
                          components: [row],
                      })
                    : await message.reply({
                          content: replyMessage,
                          components: [row],
                      })

                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: (i) => i.user.id === message.author.id,
                        time: 60_000,
                    })

                    if (confirmation) {
                        generateTeamMessage(response)
                    }
                } catch (e) {
                    await response.edit({
                        content: replyMessage,
                        components: [],
                    })
                }
            }

            return generateTeamMessage()

        // Help commands

        case c("help"):
            const responseMessage = generateMessageByLine([
                `${author}\n`,
                "Available Commands:",
                codeBlock(
                    generateMessageTable([
                        [`${c("ping")}`, "Ping the server to check for readiness"],
                        [`${c("poll")}`, "Create a poll with custom questions and answers"],
                        [`${c("teams")}`, "Generate random teams"],
                        [`${c("sb")}`, "Post a random spongebob gif"],
                        [`${c("anime")}`, "Post a random anime gif"],
                        [`${c("escanor")}`, "Post a random Escanor gif"],
                        [`${c("help")}`, "Get a list of the available commands for this bot"],
                    ])
                ),
            ])
            return channel.send(responseMessage)
    }
    // End of command controllers
}

// if (commandCheck("play")) {
// }
// EmbedBuilder()
