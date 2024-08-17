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

const commandChar = process.env.COMMAND_CHAR ?? "-"
const allowedTypes: number[] = [MessageType.Default, MessageType.Reply].map((i) => i.valueOf())

export const handleCreate = async (message: Message) => {
    if (
        message.webhookId ||
        message.author?.bot ||
        !message.channel ||
        !allowedTypes.includes(message.type.valueOf())
    )
        return false

    const commandCheck = (command: string) => messageContent.includes(`${commandChar}${command}`)

    if (message.author.bot) return

    const { content, channel, author } = message
    const messageContent = content.toLowerCase()

    if (multiIncludes(content, PROFANITY, BOT_NAMES)) {
        message.reply(`That's not very nice, ${author}`)
        return
    }

    if (multiIncludes(content, GREETINGS, BOT_NAMES)) {
        message.reply(`Hey there ${author}`)
        return
    }

    if (commandCheck(`ping`)) {
        message.reply(`Pong!`)
        return
    }

    if (commandCheck("poll")) {
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

    if (commandCheck("roll")) {
        const maxNumber = messageContent.replace(`${commandChar}roll`, "").trim()

        if (!maxNumber) {
            message.reply(
                `Please send roll command in the following format:\n\n${commandChar}roll <maxNumber>`
            )
            return
        }

        if (stringIsNan(maxNumber)) {
            message.reply("Given string is not a valid number")
            return
        }

        const result = getRandomPositiveInt(parseInt(maxNumber))
        message.reply(`:game_die: You rolled a: ${result} :game_die:`)
        return
    }

    // Gif Commands

    if (commandCheck("sb")) {
        const response = await queryGiphy("spongebob")
        channel.send(response)
        return
    }

    if (commandCheck("anime")) {
        const response = await queryGiphy("anime")
        channel.send(response)
        return
    }

    if (commandCheck("yugioh") || commandCheck("yu-gi-oh")) {
        const response = await queryGiphySafe("yugioh")
        channel.send(response)
        return
    }

    if (commandCheck("escanor")) {
        const response = await queryGiphySafe("escanor")
        channel.send(response)
        return
    }

    if (commandCheck("teams")) {
        const [numberOfTeams, ...people] = message.content
            .replace(`${commandChar}teams`, "")
            .trim()
            .split(" ")

        if (stringIsNan(numberOfTeams) || people.length < 2) {
            channel.send(
                `Please send teams information in the following format:\n\n${inlineCode(
                    `${commandChar}teams <number of teams> <people separated by a space>`
                )}`
            )
            return
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

        generateTeamMessage()
    }

    // Help commands

    if (commandCheck("help")) {
        const message = generateMessageByLine([
            `${author}\n`,
            "Available Commands:",
            codeBlock(
                generateMessageTable([
                    [`${commandChar}ping`, "Ping the server to check for readiness"],
                    [`${commandChar}poll`, "Create a poll with custom questions and answers"],
                    [`${commandChar}teams`, "Generate random teams"],
                    [`${commandChar}sb`, "Post a random spongebob gif"],
                    [`${commandChar}anime`, "Post a random anime gif"],
                    [`${commandChar}escanor`, "Post a random Escanor gif"],
                    [`${commandChar}help`, "Get a list of the available commands for this bot"],
                ])
            ),
        ])
        channel.send(message)
    }
}

// if (commandCheck("play")) {
// }
// EmbedBuilder()
