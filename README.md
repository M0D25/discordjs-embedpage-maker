# discordjs-embedpage-maker

A EmbedPage Maker For Discord.js

# Demo!

![Demo](https://raw.githubusercontent.com/xhayper/discordjs-embedpage-maker/master/demo.gif)

# This class extends MessageEmbed!

So you can use all of MessageEmbed functions which can be read [here](https://discord.js.org/#/docs/main/stable/class/MessageEmbed)

# Additional Function

\#.setFooterData(text, icon) | Set Footer Data, It can use a variable too.<br>
\#.setTitleData(text) | Same as setFooterData, But it set the title.<br>
\#.setReactionData(reactionDataObject) | Set the reaction data, You need to put in a specify Object.<br>
\#.run(Discord.Message) | Run the embed page

# Variables
`{dataLength}` Data size.<br>
`{currentPage}` The page that you're currently on.<br>
`{maxPage}` How many page are there.

# Objects

reactionData
```
reactionData {
    prevPage = Discord.Emoji | Discord.ReactionEmoji | String;
    exitPage = Discord.Emoji | Discord.ReactionEmoji | String;
    nextPage = Discord.Emoji | Discord.ReactionEmoji | String;
}
 ```

# Example

```js
let Discord = require("discord.js"),
    embedPageMaker = require("discordjs-embedpage-maker"),
    client = new Discord.Client();

client.on("message", (msg) => {
    if (msg.author.bot) return;
   if (msg.content.startsWith("testembed")) {
       let embedPage = new embedPageMaker(client)
           .setColor("BLUE") //You can use MessageEmbed's Function!
           .setTitleData("My Embed Page! [{dataLength}]") //And Maker's Function!
           .setFooterData("Pages [{currentPage}/{maxPage}]")
           .setData([1, 2, 3, 4, 5, 6, 7 ,8 ,9 ,10, 11, 12, 13])
           .run(msg);
   }
});

client.login("token");
```
