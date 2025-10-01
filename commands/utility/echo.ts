import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { Command } from "../../types/commands.ts"

const data = new SlashCommandBuilder()
  .setName("echo")
  .setDescription("Replies with what you say!")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("The message to echo")
      .setRequired(true)
      .setMinLength(1)
  )
  .addChannelOption((option) =>
    option.setName("channel").setDescription("The channel to echo into")
  )
  .addBooleanOption((option) =>
    option
      .setName("ephemeral")
      .setDescription("Whether or not the echo should be ephemeral")
  )
  .addAttachmentOption((option) =>
    option.setName("attachment").setDescription("The attachment to echo")
  )

async function execute(interaction: ChatInputCommandInteraction) {
  const message =
    interaction.options.getString("message") ?? "No message provided"
  const channel = interaction.options.getChannel("channel")
  const isEphemeral = interaction.options.getBoolean("ephemeral")
  const attachment = interaction.options.getAttachment("attachment")

  let flags: Array<number> = []
  if (isEphemeral) {
    flags.push(MessageFlags.Ephemeral)
  }
  await interaction.deferReply({
    flags,
  })
  if (channel !== null && "isTextBased" in channel && channel.isTextBased()) {
    console.log("Sending message to channel")

    await channel.send({
      content: message,
      files: attachment ? [attachment] : undefined,
    })
    await interaction.editReply({
      content: `Message sent to ${channel.name}`,
    })
  } else {
    console.log("No channel provided")
    await interaction.editReply({
      content: message,
      flags,
      files: attachment ? [attachment] : undefined,
    })
  }
}

export default {
  data,
  execute,
} as Command
