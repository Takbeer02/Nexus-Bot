const logger = require('../nexus-core/logger');
const messageUtils = require('../nexus-core/messageUtils');
const dbManager = require('../nexus-core/dbManager');
const config = require('../config.json');

module.exports = {
  config: {
    name: "groupEvent",
    version: "1.0.0",
    author: "NexusTeam",
    description: "Handles group events like member add/remove"
  },

  async execute({ api, event }) {
    if (!event || typeof event !== 'object') {
      logger.warn('Received invalid group event');
      return;
    }

    try {
      // Only handle relevant event types
      if (event.type !== "event") return;

      const { threadID, logMessageType, logMessageData } = event;

      // Member added to group
      if (logMessageType === "log:subscribe") {
        const addedUserIDs = logMessageData.addedParticipants.map(user => user.userFbId);

        // Skip if the bot was added
        if (addedUserIDs.includes(api.getCurrentUserID())) return;

        // Get user info of added participants
        const userInfo = await new Promise((resolve, reject) => {
          api.getUserInfo(addedUserIDs, (err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        });

        // Format welcome message with mentions
        const mentions = addedUserIDs.map(id => ({
          id: id,
          tag: `@${userInfo[id].firstName || 'User'}`
        }));

        const welcomeText = `Welcome to the group ${mentions.map(m => m.tag).join(', ')}! 👋`;

        // Send welcome message with properly formatted mentions
        await messageUtils.sendMessage(
          api,
          messageUtils.createMention(welcomeText, mentions),
          threadID
        );

        // --- Sync all users and admins for this thread ---
        const threadInfo = await api.getThreadInfo(threadID);
        const participants = threadInfo.participantIDs || [];
        if (participants.length > 0) {
          const userInfos = await api.getUserInfo(participants);
          for (const userID of participants) {
            const userName = userInfos[userID]?.name || 'Unknown User';
            await dbManager.createUser(userID, userName);
          }
        }
        if (global.permissionManager && threadInfo.adminIDs) {
          await global.permissionManager.refreshThreadAdmins(api, threadID);
        }
      }

      // Member removed from group
      if (logMessageType === "log:unsubscribe") {
        const removedUserID = logMessageData.leftParticipantFbId;

        // Skip if the bot was removed
        if (removedUserID === api.getCurrentUserID()) return;

        // Get user info of removed participant
        const userInfo = await new Promise((resolve, reject) => {
          api.getUserInfo(removedUserID, (err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        });

        const name = userInfo[removedUserID]?.name || 'Someone';

        // Send goodbye message
        await api.sendMessage(`${name} has left the group. 👋`, threadID);

        // --- Sync all users and admins for this thread ---
        const threadInfo = await api.getThreadInfo(threadID);
        const participants = threadInfo.participantIDs || [];
        if (participants.length > 0) {
          const userInfos = await api.getUserInfo(participants);
          for (const userID of participants) {
            const userName = userInfos[userID]?.name || 'Unknown User';
            await dbManager.createUser(userID, userName);
          }
        }
        if (global.permissionManager && threadInfo.adminIDs) {
          await global.permissionManager.refreshThreadAdmins(api, threadID);
        }
      }

      // Handle different event types
      switch (logMessageType) {
        case 'log:thread-name':
          if (!threadID || !logMessageData.name) break;

          try {
            await dbManager.updateGroupInfo(threadID, { name: logMessageData.name });
            api.sendMessage(`Group name changed to: ${logMessageData.name}`, threadID);
          } catch (err) {
            logger.error('Error handling name change:', err);
          }
          break;

        case 'log:thread-icon':
          if (!threadID) break;
          api.sendMessage(`Group icon has been updated! 🖼️`, threadID);
          break;

        case 'log:thread-color':
          if (!threadID) break;
          api.sendMessage(`Chat theme color has been changed! 🎨`, threadID);
          break;

        case 'log:thread-call':
          if (!threadID || !logMessageData.event) break;

          const callMessage = logMessageData.event === 'group_call_started'
            ? `A group call has started! 📞`
            : `The group call has ended! 📞`;
          api.sendMessage(callMessage, threadID);
          break;

        case 'log:thread-admins':
        case 'log:thread-approval-mode':
        case 'log:thread-admins-change':
          // --- Sync all users and admins for this thread ---
          if (threadID) {
            const threadInfo = await api.getThreadInfo(threadID);
            const participants = threadInfo.participantIDs || [];
            if (participants.length > 0) {
              const userInfos = await api.getUserInfo(participants);
              for (const userID of participants) {
                const userName = userInfos[userID]?.name || 'Unknown User';
                await dbManager.createUser(userID, userName);
              }
            }
            if (global.permissionManager && threadInfo.adminIDs) {
              await global.permissionManager.refreshThreadAdmins(api, threadID);
            }
          }
          break;
      }
    } catch (error) {
      logger.error("Error in groupEvent handler:", error);
    }
  }
};
