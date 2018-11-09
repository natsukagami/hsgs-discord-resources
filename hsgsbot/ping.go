package hsgsbot

import "github.com/bwmarrin/discordgo"

// Ping proves that the bot is alive
func Ping(s *discordgo.Session, m *discordgo.MessageCreate) {
	if m.Type != discordgo.MessageTypeDefault || m.GuildID != "" || m.Content != ".ping" {
		// Not a normal private message?
		return
	}

	s.ChannelMessageSend(m.ChannelID, "Ping ping cái gì, đi ra chỗ khác chơi để bà bán hàng 😠💢💢")
}
