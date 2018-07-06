
const Discord = require("discord.js");
const ms = require("ms");
const fs = require("fs");
const colors = require("./colors.json");
const botconfig = require("./botconfig.json");

const bot = new Discord.Client({disableEveryone: true});

let coins = require("./coins.json")
let xp = require("./xp.json")
let warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"))

bot.on("channelDelete", async channel => {

    console.log(`${channel.name} has been created`)

    let sChannel = channel.guild.channels.find(`name`, "events")
    sChannel.send(`${channel} has been created`)

})

bot.on("guildMemberRemove", async member =>{
    console.log(`${member.id} left the server!`)

    let welcomechannel = member.guild.channels.find(`name`, "welcome_leave");
    let lrandom = Math.floor(Math.random()* 5) + 1;
    //creating random leave message with if else statement
    if(lrandom === 1){
        welcomechannel.send(`Sad to see you leave ${member}.`)
    }else if (lrandom === 2){
        welcomechannel.send(`Coast is clear everyone, ${member} has left the server.`)
    }else if(lrandom === 3){
        welcomechannel.send(`GOOD RIDDANCE. ${member} has left the server.`)
    }else if(lrandom === 4){
        welcomechannel.send(`Why have you left us ${member}, please come back!`)
    }else{
        welcomechannel.send(`Get your pitchforks, ${member} has abandon us!`)
    };
})

bot.on("guildMemberAdd", async member => {
    console.log(`${member.id} Joined The Server!`)


    let welcomechannel = member.guild.channels.find(`name`, "welcome_leave");    
let jrandom = Math.floor(Math.random()* 5) + 1;
//creating a custom and random join message
if(jrandom === 1){
    welcomechannel.send(`Looks like ***${member}*** has joined the server!`)
}else if(jrandom === 2){
    welcomechannel.send(`OH NO. Looks like ***${member}*** has joined the server!`)
}else if(jrandom === 3){
    welcomechannel.send(`No need to fear, for ***${member}*** is here!`)
}else if(jrandom === 4){
    welcomechannel.send(`Everyone hide! ***${member}*** is here!!`)
}else if(jrandom === 5){
    welcomechannel.send(`${member} HAS ARRIVED TO THE PARTY!`)
}else if(jrandom === 6){
    welcomechannel.send(`HIDE UR MEMES. ***${member}*** has joined thet server`)
}

});

bot.on("ready", async () => {
 console.log(`${bot.user.username} is online! `);
 bot.user.setActivity(" with Complex Code! | !help ")
}); 


bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let prefixes = JSON.parse(fs.readFileSync("./prefix.json", "utf8"))

    if(!prefixes[message.guild.id]){
        prefixes[message.guild.id] ={
            prefixes: botconfig.prefix
        };
    }

    let prefix = prefixes[message.guild.id].prefixes;
    console.log(prefix)

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    if(cmd === `${prefix}warn`){

        //warn <@user#id Reason>
        if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.reply("***You maynot warn this user***");
        let wUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!wUser) return message.reply("***You must provide a user.***")
        if(wUser.hasPermission("MANAGE_MESSAGES")) return message.reply("***You may not warn this user***")
        let wReason = args.join(" ").slice(22);

        if(!warns[wUser.id]) warns[wUser.id] = {
            warns: 0
        };

        warns[wUser.id], warns++;

        fs.writeFile("./warnings.json", JSON.stringify(warns), err => {
           if (err) console.log(err);
        });

        let warnEmbed = new Discord.RichEmbed()
        .setDescription("Warns")
        .setAuthor(message.author.username)
        .setColor(colors.red)
        .addField("Warned User", `<@{wUser.id}>`)
        .addField("Warned In", message.channel)
        .addField("Number of Warnings", warns[wUser.id].warns)
        .addField("Reason", wReason);

        let warnchannel = message.guild.channels.find(`name`, "incidents");
        if(!warnchannel) return message.reply("***Must create an 'incidents' channel.***");

        warnchannel.send(warnEmbed);

        if(warns[wUser.id].warns == 2){
            let muterole = message.guild.roles.find(`name`, "[~] Muted");
            if(!muterole) return message.reply("***You must create the '[~] Muted' role***");

            let wMuteTime = "2d";
            await(wUser.addRole(muterole.id));
            message.channel.send(`${wUser.tag} has been muted for 2 days.`)

            setTimeout(function(){
                wUser.removeRole(muterole.id)
                message.channel.reply(`${wUser.tag} has been unmuted.`)
            })
        }
        if(warns[wUser.id].warns == 4){
            message.guild.member(wUser).kick(reason)
            message.channel.send(`${wUser.tag} Has Been Kicked.`)
        };


    }

    if(cmd === "!setprefix"){
        //!setprefix <symbol>

        if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("🚫***You can not do that.***");
        if(!args[0] || args[0 == "helpme"]) return message.reply("Usage: !prefix <prefered prefix> *Only one is reccomended*");

        let prefixes = JSON.parse(fs.readFileSync("./prefix.json", "utf8"));

        prefixes[message.guild.id] = {
            prefixes: args[0]
        };

        fs.writeFile("./prefix.json", JSON.stringify(prefixes), (err) =>{
            if(err) console.log(err)
        })

        let prefixEmbed = new Discord.RichEmbed()
        .setColor(colors.green)
        .setTitle("Prefix Set!")
        .setDescription(`Set to ${args[0]}`);

        message.channel.send(prefixEmbed);

    }

    if(cmd === `${prefix}clear`){
        //!clear <number>
        if(!message.member.hasPermission("ADMINISTRATOR"))return message.reply("You cannot do that");
        if(!args[0])return message.channel.send("Usage: Clear <Number>");

        message.channel.bulkDelete(args[0]).then(() =>{
            message.channel.send(`Cleared ${args[0]}`).then(msg => msg.delete(5000))
        });
    }

    if(cmd === `${prefix}say`){
        //!say <Word> {input}
        //<word> {output}
        if(!message.member.hasPermission("MANAGE_MESSAGES"))return message.reply("You cannot do that");
        let bmessage = args.join(" ");
        message.delete().catch()
        message.channel.send(bmessage);

    }

    if(cmd === `${prefix}8ball`){
        //!8ball <question>
        if(!args[2]) return message.reply("🚫***You must ask a full question.***")
        let replies = ["***Yes***", "***No***", "***I dont know***", "***Maybe***", "***Ask again later***."]
        let result = Math.floor((Math.random() * replies.length))
        let question = args.slice(1).join(" ");

        let ballembed = new Discord.RichEmbed()
        .setAuthor(message.author.tag)
        .setColor(colors.green)
        .addField("Question", question)
        .addField("Answer", replies[result])

        message.channel.send(ballembed);
    
    }
    if(cmd === `${prefix}whois`){
        let whoUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    
    if(!whoUser){
        return message.channel.send("You must define a user.")
    }
    
let wembed = new Discord.RichEmbed()
.setAuthor(whoUser.user.tag, whoUser.user.avatarURL)
.addField("Account Created", whoUser.user.createdAt, true)
.addField('Joined This Server', message.guild.members.find("id", whoUser.id).joinedAt, true)
.addField("User ID", whoUser.id, true)
.setColor(colors.green)
.setFooter("Searched User");
message.channel.send(wembed);

}

    if(cmd === `${prefix}info`){
        
        let sicon = message.guild.iconURL;

        let icembed = new Discord.RichEmbed()
        .setTitle("Complex studios info")
        .setColor("RANDOM")
        .addField("Info", "A PM with more info has been sent to you.")
        
        let infoembed = new Discord.RichEmbed()
        .setTitle("***Complex Studios info***")
        .setColor(colors.green)
        .addField("***About***", "This server is mainly a server to have fun and to talk to make friends! We dont main a game, we play all sorts of games. We just like to have a fun time!")
        .addField("***Reports***", "Reports are only seen by people that have authorizeation to go into the staff chat> You report will be taken seriously if it is a serious report. If there is anything that you would like to talk about in private, please pm the staff.")
        .addField("***Kicks and Bans***", "If you have been banned on our server then most likely u have done something bad, if u wnat to appeal plz dm the someone that can help. Same goes with mutes")
        .setFooter("Complex studios specific")
    
        message.channel.send(icembed);
        message.author.send(infoembed);
        return;

    }

    if (cmd === `${prefix}application`) {

		let sembed = new Discord.RichEmbed()
            .setDescription("Application template")
            .setColor(colors.green)
            .addField( "***Template***", "A PM with more information has been sent to you")
            .setFooter("application template")
		let aembed = new Discord.RichEmbed()
			.setAuthor(message.author.id)
			.setColor(colors.green)
			.addField("Requirement 1", "Must take the application seriously (For the server owners out ther you must have an 'applications' channel and exactly that)")
			.addField("Requirement 2", "Must list The following: What role (if you dont know the roles, ask a fellow staff on your server), how long you have been in the server, why you want that role, and how active you are.")
			.setFooter("Bot was made by InsaneSkillz27#9243");

		message.channel.send(sembed);
		message.author.send(aembed);
		return;
	}

	

        if(cmd === `${prefix}apply`){

            let aUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
            if(!aUser) return message.guild.member("Couldn't find user");
            let aReason = args.join(" ").slice(22);
         

        let applyembed = new Discord.RichEmbed()
        .setAuthor(message.author.username)
        .setColor(colors.green)
        .addField("Applicant", `${aUser} With ID: ${aUser.id}`)
        .addField("Application: ", aReason)
        .setFooter("Any aplications that are not taken seriously will be taken a such!");
        
        let applicationchannel = message.guild.channels.find(`name`, "applications");
        if(!applicationchannel) return message.channel.send("Couldn't find the applications channel.");

        message.delete().catch(O_o=>{});
        applicationchannel.send(applyembed);

        return;
    }

    if(!coins[message.author.id]){ //this is checking to see if they have any coins
        coins[message.author.id] = {
            coins: 0
        }
    }

    let coinAmt = Math.floor(Math.random() * 15) + 1; //this is getting a number from 1 to 15
    let baseAmt = Math.floor(Math.random() * 15) + 1;
    console.log(`${coinAmt} ; ${baseAmt}`)

    if(coinAmt === baseAmt){
        coins[message.author.id] ={
            coins: coins[message.author.id].coins + coinAmt
        };
        fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
            if (err) console.log(err)
        });
    let coinembed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setColor(colors.green)
    .addField("💰", `${coinAmt} Coins added!`);
   
    message.channel.send(coinembed).then(msg => {msg.delete(2000)});
}

//!coins
if(!coins[message.author.id]){ 
    coins[message.author.id] = {
        coins: 0
    };
}

if(cmd === `${prefix}coins`){
let uCoins = coins[message.author.id].coins;

let cembed = new Discord.RichEmbed()
.setAuthor(message.author.username)
.setColor(colors.green) 
.addField("💰", uCoins);

return message.channel.send(cembed).then(mes => {msg.delete(5000)});
}

let xpAdd = Math.floor(Math.random()* 15) + 1;
console.log(xpAdd);

if(!xp[message.author.id]){
    xp[message.author.id] ={
        xp: 0,
        level: 1
    }
    
}


let curxp = xp[message.author.id].xp;
let curlvl = xp[message.author.id].level;
let nxtLvl = xp[message.author.id].level * 300;
xp[message.author.id].xp = curxp + xpAdd;
if(nxtLvl <= xp[message.author.id].xp){
    xp[message.author.id].level = curlvl + 1;
   let lvlup = new Discord.RichEmbed()
   .setTitle("Level Up!")
   .setColor(colors.green)
   .addField("New Level", curlvl + 1);

   message.channel.send(lvlup).then(msg => {msg.delete(5000)});
}
fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
    if(err) console.log(err)
});


if(cmd === `${prefix}level`){
   
    let nxtLvlXp = curlvl * 300;
    let difference = nxtLvlXp - curxp;

    //!level

    let levelEmbed = new Discord.RichEmbed()
   
   .setAuthor(message.author.username)
   .setColor(colors.green)
   .addField("Level", curlvl, true)
   .addField("XP", curxp, true)
   .setFooter(`${difference} Till next level!`, message.author.displayAvatarURL);

    message.channel.send(levelEmbed).then(msg => {msg.delete(5000)});
};

   if(cmd === `${prefix}servers`){
   
    let serverembed = new Discord.RichEmbed()
    
    .setDescription("**Recommend Servers**")
    .setColor(colors.red)
    .addField("Server 1", "https://discord.gg/8FkW55U \n ```This is my(Insaneskillz#9243) main server```")
    .addField("Server 2", "https://discord.gg/QZAu8ZC \n ```This is my secondary gaming server (No specific game)```")
    .addField("Server 3", "https://discord.gg/ \n ```This is a great coding server!```")
    .addField("Server 4", "https://discord.gg/58EmMGQ \n ```This is a great bot testing server```")
    .addField("Server 5", "https://discord.gg/8gpJkdu \n ```This is a general chat server```")
    .addField("Server 6", "https://discord.gg/eAQVXDq \n ```This is a gaming discord (no specific game)```")
    .addField("Want your server on here?", "If so than contact me (Insaneskillz27#9243)")
    .addField("Created by", "Insaneskillz27#9243");
   
    return message.author.send(serverembed);
}
   
    if(cmd === `${prefix}ping`){
        message.channel.send("***Pinging...***").then(sent =>{
            sent.edit(`${bot.pings[0]}ms server response time, ${sent.createdTimestamp - message.createdTimestamp}ms for the round trip!`).catch(console.error);
        })
    }


   if(cmd === `${prefix}help`){
    
    let bicon = bot.user.displayAvatarURL; 

    let hembed2 = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setColor(colors.green)
    .addField("***Help***", "A private message with more info has been sent to you.")
    .setFooter("Complex v2's botinfo")


    let hembed3 = new Discord.RichEmbed()
    .setTitle("Help", "This bot is my first bot, if there are any problems or errors let me know join my server and let me know: https://discord.gg/8FkW55U")
    .setColor(colors.green)
    .addField(  "***Cmd Info***", "This bot has 18 overall commands and 0 are currently in development. This bot also has ***custom*** join and leave messages. For this function you must make sure that you have a channel called 'welcome_leave' and you must trun off the join messages that discord auto-sends.")
    .setFooter("If a command has `<>` in it then it is required!");
    
    let hembed4 = new Discord.RichEmbed()
    .setTitle("*Fun/Informative commands*")
    .setColor(colors.green)
    .addField(`***${prefix}ping***`, "This command shows you your ping.")
    .addField(`***${prefix}roll***`, "This command will roll you a six sided die, what will you get?")
    .addField(`***${prefix}8ball <question>*** `, "For this command you must ask a full question. The bot picks from an array of multiple differnet answers.")
    .addField(`***${prefix}say <word>***`, "This command will make the bot say whatever you input into it. Use this wisely.")
    .setFooter("Bot is still in development.");
    
    let hembed = new Discord.RichEmbed()
       
       .setDescription("Commands")
       .setThumbnail(bot.user.displayAvatarURL)
       .setColor(colors.blue)
       .addField("Hello!", "Hello " + message.author.username +  " I am Complex v2 and these are my commands!\n")
       .addField("Command 1:", `***${prefix}roll*** \nThis command will roll a six-sided die for you. What will you get?`)
       .addField("Command 2:", `***${prefix}tempmute <@user#id time (Ex: 1d)>*** \nThis command will temporarily mute a user for a set amount of time.`)
       .addField("Command 3:", `***${prefix}kick <@user#id reason>*** \nThis command will kick the mentioned user and send the kick report to the announcements channel.`)
       .addField("Command 4:", `***${prefix}ban <@user#id reason>*** \nThis command will ban the mentioned user and send the ban report to the announcements channel.`)
       .addField("Command 5:", `***${prefix}report <@user#id reason>*** \nThis command report the mentioned user and send it to the incedents channel.`)
       .addField("Command 6:", `***${prefix}srvinfo*** \nThis command will display the server info (!srvinfo).`)
       .addField("Command 7:", `***${prefix}botinfo*** \nThis command will give you the bot informantion (!botinfo).`)
       .addField("Command 8:", `***${prefix}ping*** \nThis command will show you your ping`)
       .addField("Command 9:", `***${prefix}servers*** \nThis command will give you a list of all my prefered and just in general good servers.`)
       .addField("Command 10:", `***${prefix}coins*** \nThis command lets you see your coins (and yes we do have a coin system)`)
       .addField("Command 11:", `***${prefix}level*** \nThis command will let you see your level, how much xp you have and how much untill the next level`)
       .addField("Command 12:", `***${prefix}application*** \nThis will show you the format for you application. MUST SEE BEFORE YOU APPLY!`)
       .addField("Command 13:", `***${prefix}apply <@yourself#id reason>*** \nThis command will allow you to apply for a role on the server, it will send the application to the applications channel. For more info on what to put do !applications`)
       .addField("Command 14:", `***${prefix}whois <@user#id>*** \nThis command will show you a variety of thing about the user that you mention, such as when they were registered, thier id and much more!`)
       .addField("Command 15:", `***${prefix}8ball <full question>*** \nThis will answer you question that you input, with a variety if different answers.`)
       .addField("Command 16:", `***${prefix}say <Word>*** \nThis will make the bot say whatever you input into it. Use this wisely`)
       .addField("Command 17:", `***${prefix}clear <number>*** \nThis command will bulk delete the amount of messages that you input into the command.`)
       .addField("Command 18:", `***${prefix}setprefix <desired prefix>*** \nThis command will set the bot prefix to any prefix that you want. *Only 1 character is reccomended!*`)
       .addField("Info", "This bot is still in development. Also if a command does not work contact me (Insaneskillz27#9243)")
       .setFooter("Bot was made by Insaneskillz27#9243");
  
       message.author.send(hembed3);
       message.author.send(hembed);
       message.author.send(hembed4);
       message.channel.send(hembed2);
       return;


   }
   
    // !roll (Will give any number between 1-6m, which are the number of the dice, if it rolls a zero then it says to roll again).
    if(cmd === `${prefix}roll`){
        let rnumber = Math.floor(Math.random()* 6)
        if(rnumber === 1){
            message.channel.send("You rolled a 1!")
        }else if(rnumber === 2){
            message.channel.send("You rolled a 2!")
        }else if(rnumber === 3){
            message.channel.send("You rolled a 3!")
        }else if(rnumber === 4){
            message.channel.send("You rolled a 4!")
        }else if(rnumber === 5){
            message.channel.send("You rolled a 5!")
        }else if(rnumber === 6){
            message.channel.send("You rolled a 6!")
        }else{
            message.channel.send("the dice fell under the table, never to be seen again. Roll again.")
        };
        
    };


if(cmd === `${prefix}tempmute`){

    //!tempmute @user#id time (ex 1h(1 hour))

    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!tomute) return message.reply("🚫 ***You must mention 1 user.***");
    if(tomute.hasPermission("ADMINISTRATOR")) return message.reply("🚫***You may not mute this specific user.***");
    let muterole = message.guild.roles.find(`name`, "[~] Muted")
    //start of createrole
    if(!muterole){
       try{
        muterole = await message.guild.createRole({
            name: "[~] Muted", 
            color: "#000000",
            permissions:[]
        })
        message.guild.channel.forEach(async (channel, id) => {
            await channel.overwritePermissions(muterole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });
        });
       }catch(e){
           console.log(e.stack);
       }
    }
    //end of createrole
    let mutetime = args[1];
    if(!mutetime) return message.reply("🚫***you must put in a form of time(in the form of s/m/h/d).***");

    await (tomute.addRole(muterole.id));
    message.reply(`<@${tomute.id}> has been muted for ${ms(mutetime)}`);

    setTimeout(function(){
        tomute.removeRole(muterole.id);
        message.channel.send(`<@${tomute.id}> has been unmuted`);
    }, ms(mutetime));
}

if(cmd === `${prefix}kick`){

    //!kick @user#id reason

    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.send("🚫***You must mention a user.***");
    let kReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("🚫***You are not able to kick this user.***")
    if(kUser.hasPermission("ADMINISTRATOR")) return message.channel.send("🚫***You are not able to kick this user.***")

    let kickembed = new Discord.RichEmbed()    
    .setDescription("Kick")
    .setColor("#d81717")
    .addField("Kicked User", `${kUser} with ID: ${kUser.id} `)
    .addField("Kicked By", `<@${message.author.id}> with ID: ${message.author.id}`)
    .addField("Kicked In", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", kReason);
    
    let kickChannel = message.guild.channels.find( `name`, "announcements");
    if(!kickChannel) return message.channel.send("🚫***You must create an 'announcements' text channel***");

    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickembed);
   
   return;
}

if(cmd === `${prefix}ban`){
    
    //cmd = !ban @user#id Reason
    
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send("🚫***You must mention a user.***");
    let bReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("🚫***Complex v2 is not able to kick this user***")
    if(bUser.hasPermission("ADMINISTRATOR")) return message.channel.send("🚫***You are not able to kick this user.***")

    let banembed = new Discord.RichEmbed()    
    .setDescription("THE BAN HAMMER HAS BEEN DROPPED")
    .setColor("#d81717")
    .addField("Banned User", `${bUser} with ID: ${bUser.id} `)
    .addField("Banned By", `<@${message.author.id}> with ID: ${message.author.id}`)
    .addField("Banned In", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", bReason);
    
    let banChannel = message.guild.channels.find( `name`, "announcements");
    if(!banChannel) return message.channel.send("🚫***You mut create an 'announcements' text channel***");
   
    message.guild.member(bUser).ban(bReason);
    banChannel.send(banembed);
   
    return;
}

    if(cmd === `${prefix}report`){
        
       // cmd = !report @user#id reason
       
        let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!rUser) return message.guild.member("🚫***You must mention a user.***");
        let reason = args.join(" ").slice(22);

        let reportembed = new Discord.RichEmbed()
        .setDescription("Reports")
        .setColor("#d81717")
        .addField("Reported User", `${rUser} with id: ${rUser.id}`)
        .addField("Reporting By", `${message.author} with ID: ${message.author.id}`)
        .addField("Channel Reported", message.channel)
        .addField("Time", message.createdAt)
        .addField("Reason", reason);

        let reportschannnel = message.guild.channels.find(`name`, "incidents");
        if(!reportschannnel) return message.channel.send("🚫***You must create an 'incidents' text channel.***");

        message.delete().catch(O_o=>{});
        reportschannnel.send(reportembed);

        return;
    }
//cmd = !srvinfo
    if(cmd === `${prefix}srvinfo`){
        
        let sicon = message.guild.iconURL;
        let serverembed = new Discord.RichEmbed()
        .setDescription("This is the server's info:")
        .setColor("#d81717")
        .setThumbnail(sicon)
        .addField("Server Name", message.guild.name)
        .addField("Created On", message.guild.createdAt)
        .addField("You Joined", message.member.joinedAt)
        .addField("Total Members", message.guild.memberCount);
        
        return message.channel.send(serverembed);
    }
//cmd = !botinfo
    if(cmd === `${prefix}botinfo`){

        let bicon = bot.user.displayAvatarURL;
        let botembed = new Discord.RichEmbed()
        .setDescription("This is Complex v2's Bot Info: ")
        .setColor("#d81717")
        .setThumbnail(bicon)
        .addField("Bot Name", bot.user.username)
        .addField("Created on", bot.user.createdAt)
        .setFooter(" Bot made by Insaneskillz27#9243")
        return message.channel.send(botembed);
    }
    
})

bot.login(process.env.BOT_TOKEN);