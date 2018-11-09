package hsgsbot

import (
	"fmt"
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/pkg/errors"
)

// Some IDs
const (
	WelcomeChannel   = "373492917056307201"
	RulesChannel     = "373492778262593537"
	TicketBoxChannel = "373492965546393600"
	SayHiChannel     = "384708850336530444"

	MembersRole = "375320646202294273"
)

var roleMap = map[string]string{
	"mathematics": "373499448049008640",
	"informatics": "373499498913333248",
	"physics":     "373499556773756929",
	"chemistry":   "373499604580171776",
	"biology":     "373499654207307777",
	"hq":          "373500378118881280",
	"not hsgs":    "375317898564075520",
}

var roleTranslate = map[string]string{
	"mathematics": "Chuyên Toán",
	"informatics": "Chuyên Tin",
	"physics":     "Chuyên Lý",
	"chemistry":   "Chuyên Hóa",
	"biology":     "Chuyên Sinh",
	"hq":          "Chất Lượng Cao",
	"not hsgs":    "một trường nào đó không phải Tổng Hợp",
}

// Welcome displays a welcome message in the member list.
func Welcome(s *discordgo.Session, mem *discordgo.GuildMemberAdd) {
	m, err := s.ChannelMessageSend(
		WelcomeChannel,
		fmt.Sprintf("Chào mừng <@!%s> đến với mái nhà Tổng Hợp trên Discord! Xin hãy đọc qua <#%s> và làm theo hướng dẫn để bắt đầu tham gia vào các hoạt động của server!",
			mem.User.ID,
			RulesChannel,
		),
	)
	if err != nil {
		log.Println(errors.WithStack(err))
		return
	}
	s.MessageReactionAdd(m.ChannelID, m.ID, "🎶")
}

// AssignRoles just gives roles to everyone needed.
func AssignRoles(s *discordgo.Session, m *discordgo.MessageCreate) {
	if m.ChannelID != TicketBoxChannel {
		// Ignore the command
		return
	}

	mem, err := s.GuildMember(m.GuildID, m.Author.ID)
	if err != nil {
		log.Println(errors.WithStack(err))
		return
	}

	for _, role := range mem.Roles {
		if role == MembersRole {
			return // Ignore people with member role
		}
	}

	if !strings.HasPrefix(m.Content, ".hi iam ") {
		return // Ignore non-commands
	}

	wantedRole := strings.ToLower(m.Content[len(".hi iam "):])

	if role, ok := roleMap[wantedRole]; ok {
		if err := s.GuildMemberRoleAdd(m.GuildID, m.Author.ID, role); err != nil {
			log.Println(errors.WithStack(err))
			return
		}
		if err := s.GuildMemberRoleAdd(m.GuildID, m.Author.ID, MembersRole); err != nil {
			log.Println(errors.WithStack(err))
			return
		}

		s.ChannelMessageSend(SayHiChannel, fmt.Sprintf("@tất-cả-mọi-người hãy say hi với %s, một thành viên mới đến từ **%s** nha! 😉", m.Author.Mention(), roleTranslate[wantedRole]))
	} else {
		s.ChannelMessageSend(m.ChannelID, fmt.Sprintf("%s, Mã khối không hợp lệ. Xin hãy thử lại! 😭", m.Author.Mention()))
	}
}
