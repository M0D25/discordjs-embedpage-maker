let Discord = require("discord.js"),
    embedPageMaker = require("discordjs-embedpage-maker"),
    client = new Discord.Client();

client.on("message", (msg) => {
    if (msg.author.bot) return;
    if (msg.content.startsWith("testembed")) {
        let embedPage = new embedPageMaker(client)
            .setColor("BLUE")
            .setTitleData("My Embed Page! [{dataLength}]")
            .setFooterData("Pages [{currentPage}/{maxPage}]")
            .setData([1, 2, 3, 4, 5, 6, 7 ,8 ,9 ,10, 11, 12, 13])
            .run(msg);
    }
});

client.login("token");