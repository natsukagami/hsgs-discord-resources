package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/natsukagami/hsgs-discord-resources/hsgsbot"
	"github.com/pkg/errors"
)

func main() {
	client, err := discordgo.New("Bot " + os.Getenv("TOKEN"))
	if err != nil {
		panic(errors.WithStack(err))
	}

	client.AddHandler(hsgsbot.Welcome)
	client.AddHandler(hsgsbot.AssignRoles)
	client.AddHandler(hsgsbot.Ping)

	err = client.Open()
	if err != nil {
		panic(errors.WithStack(err))
	}

	// Wait here until CTRL-C or other term signal is received.
	fmt.Println("HSGSbot is now running.  Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc

	// Cleanly close down the Discord session.
	client.Close()
}
