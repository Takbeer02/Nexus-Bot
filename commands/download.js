const StreamHandler = require('../modules/streamHandler');
const path = require('path');
const fs = require('fs');

module.exports = {
    config: {
        name: "stdl",
        version: "1.0.0",
        author: "NexusTeam",
        countDown: 5,
        role: 0,
        shortDescription: "Download file from URL",
        longDescription: "Download a file from URL and send it",
        category: "utility",
        guide: "{prefix}download [url]"
    },

    async execute({ api, event, args }) {
        const { threadID, messageID } = event;
        if (!args[0]) {
            return api.sendMessage("Please provide a URL to download!", threadID, messageID);
        }

        const url = args[0];
        
        try {
            // First check file info
            const fileInfo = await StreamHandler.getFileInfo(url);
            
            // Check file size (max 25MB)
            if (fileInfo.size > 25 * 1024 * 1024) {
                return api.sendMessage("❌ File too large (max 25MB)", threadID, messageID);
            }

            // Create temporary file path
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            
            const tempPath = path.join(tempDir, `${StreamHandler.randomString(8)}.${fileInfo.extension}`);

            // Send downloading message
            api.sendMessage("⏳ Downloading file...", threadID, messageID);

            // Download file
            await StreamHandler.downloadFile(url, tempPath);

            // Send file
            await api.sendMessage(
                { 
                    body: `✅ Downloaded: ${fileInfo.filename}\n📦 Size: ${(fileInfo.size/1024/1024).toFixed(2)}MB`,
                    attachment: fs.createReadStream(tempPath)
                },
                threadID,
                messageID
            );

            // Clean up temp file
            fs.unlinkSync(tempPath);

        } catch (error) {
            return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    }
};
