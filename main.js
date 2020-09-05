let Discord = require('discord.js');

class reactionData  {
    prevPage = Discord.Emoji | Discord.ReactionEmoji | String;
    exitPage = Discord.Emoji | Discord.ReactionEmoji | String;
    nextPage = Discord.Emoji | Discord.ReactionEmoji | String;
}

class embedPageMaker extends Discord.MessageEmbed {
    embedData = {
        running: false,
        originalMessage: Discord.Message,
        embedMessage: Discord.Message,
        footer: "Pages {currentPage}/{maxPage}",
        client: Discord.Client,
        title: "Data [{dataLength}]",
        reactionData: {
            prevPage: "◀",
            exitPage: "✖",
            nextPage: "▶"
        },
        message: Discord.Message,
        displayData: [],
        data: []
    };
    variables = [
        "{dataLength}",
        "{currentPage}",
        "{maxPage}"
    ];
    currentPage = 1;
    embed = this;
    maxPage;
    newText;

    constructor(client, messageEmbed) {
        if(!client instanceof Discord.Client) return;
        messageEmbed instanceof Discord.MessageEmbed ? super(messageEmbed) : super();
        this.embedData.client = client;
    }

    setFooterData(text, icon) {
        this.embedData.footer = text;
        this.embed.setFooter(text, icon);
        return this;
    }

    setTitleData(text) {
        this.embedData.title = text;
        return this;
    }

    setReactionData(data) {
        if (data.prevPage) { this.embedData.reactionData.prevPage = data.prevPage; }
        if (data.exitPage) { this.embedData.reactionData.prevPage = data.exitPage; }
        if (data.nextPage) { this.embedData.reactionData.prevPage = data.nextPage; }
        return this;
    }

    setData(data) {
        if (!data instanceof Object) return this;
        this.embedData.data = data;
        return this;
    }

    async _updateDisplayData() {
        if (!this.currentPage || !this.maxPage || !this.embedData.data || !this.embedData.displayData) return this;
        this.embedData.displayData = [];
        for (let x = (this.currentPage-1)*10; x < (this.currentPage*10)-1; x++) {
            if (!this.embedData.data[x]) break;
            this.embedData.displayData.push(this.embedData.data[x]);
        }
    }

    async _prevPage() {
        if (!this.embedData.running || !this.embedData.embedMessage || !this.embedData.client || this.currentPage <= 1) return this._awaitReaction();
        this.currentPage--;
        await this._updateEmbed();
        await this.embedData.embedMessage.edit(this.embed);
        await this._awaitReaction();
    }

    async _endPage() {
        if (!this.embedData.running || !this.embedData.embedMessage || !this.embedData.client) return this._awaitReaction();
        await this.embedData.embedMessage.delete();
    }

    async _nextPage() {
        if (!this.embedData.running || !this.embedData.embedMessage || !this.embedData.client || this.currentPage >= this.maxPage) return this._awaitReaction();
        this.currentPage++;
        await this._updateEmbed();
        await this.embedData.embedMessage.edit(this.embed);
        await this._awaitReaction();
    }

    async _replaceVariable(text) {
        if (!text instanceof String) return text;
        this.newText = text;
        for (let v in this.variables) {
            if (!v) break;
            let regExp = new RegExp(this.variables[v], "g");
            if (regExp.test(text)) {
                switch (this.variables[v]) {
                    case "{dataLength}":
                        this.newText = this.newText.replace(regExp, this.embedData.data.length);
                        break;
                    case "{currentPage}":
                        this.newText = this.newText.replace(regExp, this.currentPage);
                        break;
                    case "{maxPage}":
                        this.newText = this.newText.replace(regExp, this.maxPage);
                        break;
                    default:
                        this.newText = this.newText.replace(regExp, undefined);
                        break;
                }
            }
        }
        return this.newText;
    }

    async _updateEmbed() {
        await this._updateDisplayData();
        this.embed.setDescription(this.embedData.displayData.join("\n"));
        for (let v in this.variables) {
            if (!v) break;
            let regExp = new RegExp(this.variables[v], "g");
            if (regExp.test(this.embedData.footer)) {
                await this.embed.setFooter(await this._replaceVariable(this.embedData.footer), this.embed.footer.icon_url ? this.embed.footer.icon_url : null);
            }
            if (regExp.test(this.embedData.title)) {
                await this.embed.setTitle(await this._replaceVariable(this.embedData.title));
            }
        }
    }

    async _awaitReaction() {
        if (!this.embedData.running || !this.embedData.embedMessage || !this.embedData.client || this.maxPage <= 1) return this;

        const filter = (reaction, user) => {
            return Object.keys(this.embedData.reactionData).map(e => this.embedData.reactionData[e]).includes(reaction.emoji.name) && user.id === this.embedData.originalMessage.author.id;
        };

        this.embedData.embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();

                if (!Object.keys(this.embedData.reactionData).map(e => this.embedData.reactionData[e]).includes(reaction.emoji.name)) await this._awaitReaction();
                let userReactions = this.embedData.embedMessage.reactions.cache.filter(reaction => reaction.users.cache.has(this.embedData.originalMessage.author.id));
                for (const reaction of userReactions.values()) {
                    await reaction.users.remove(this.embedData.originalMessage.author.id);
                }
                if (reaction.emoji.name === this.embedData.reactionData.prevPage) {
                    await this._prevPage();
                }
                if (reaction.emoji.name === this.embedData.reactionData.exitPage) {
                    await this._endPage();
                }

                if (reaction.emoji.name === this.embedData.reactionData.nextPage) {
                    await this._nextPage();
                }
            })
            .catch (() => { this._endPage(); });
    }

    async run(message) {
        if (!message || !message instanceof Discord.Message) return this;
        this.embedData.running = true;
        this.maxPage = Math.ceil(this.embedData.data.length / 10);
        this.embedData.originalMessage = message;
        await this._updateEmbed();
        this.embedData.embedMessage = await message.channel.send(this.embed);
        if (this.maxPage > 1) {
            for (const e of Object.keys(this.embedData.reactionData)) {
                await this.embedData.embedMessage.react(this.embedData.reactionData[e]);
            }
            await this._awaitReaction();
        }
    }

}

module.exports.reactionData = reactionData;
module.exports = embedPageMaker;