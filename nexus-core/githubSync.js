const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

let octokit = null;
let githubConfig = null;

/**
 * Initialize the GitHub integration
 * @param {Object} config - GitHub configuration
 */
function initGithub(config = {}) {
  try {
    if (!config.enabled) {
      logger.info('GitHub integration disabled');
      return;
    }
    
    if (!config.token) {
      logger.warn('GitHub token not provided. Some features will be limited to public repositories.');
    }
    
    // Create Octokit instance
    octokit = new Octokit({
      auth: config.token || undefined,
      userAgent: 'NexusBot',
    });
    
    githubConfig = config;
    logger.info('GitHub integration initialized');
    
    // Test the connection
    testGithubConnection();
  } catch (error) {
    logger.error('Failed to initialize GitHub:', error.message);
  }
}

/**
 * Test the GitHub connection
 */
async function testGithubConnection() {
  try {
    if (!octokit || !githubConfig) {
      logger.warn('GitHub not initialized');
      return false;
    }
    
    const { owner, repo } = githubConfig;
    
    if (!owner || !repo) {
      logger.warn('GitHub owner or repo not configured');
      return false;
    }
    
    // Try to get the repository info
    await octokit.repos.get({
      owner,
      repo
    });
    
    logger.info(`Successfully connected to GitHub repository: ${owner}/${repo}`);
    return true;
  } catch (error) {
    logger.error('GitHub connection test failed:', error.message);
    return false;
  }
}

/**
 * Push a file to GitHub
 * @param {string} filePath - Path to the file to push
 * @param {string} commitMessage - Commit message
 */
async function pushToGithub(filePath, commitMessage) {
  try {
    if (!octokit || !githubConfig) {
      logger.warn('GitHub not initialized');
      return false;
    }
    
    const { owner, repo, branch = 'main' } = githubConfig;
    
    if (!owner || !repo) {
      logger.warn('GitHub owner or repo not configured');
      return false;
    }
    
    // Read the file content
    const content = fs.readFileSync(filePath);
    const contentEncoded = Buffer.from(content).toString('base64');
    
    // Get the relative path for GitHub
    const fileName = path.basename(filePath);
    const targetPath = `backups/${fileName}`;
    
    // Check if file exists
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: targetPath,
        ref: branch
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist yet, that's fine
      sha = undefined;
    }
    
    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: targetPath,
      message: commitMessage,
      content: contentEncoded,
      sha,
      branch
    });
    
    logger.info(`Successfully pushed ${fileName} to GitHub`);
    return true;
  } catch (error) {
    logger.error('Failed to push to GitHub:', error.message);
    return false;
  }
}

/**
 * Push directory to GitHub
 * @param {string} dirPath - Path to directory to push
 * @param {string} commitMessage - Commit message
 */
async function pushDirectoryToGithub(dirPath, commitMessage) {
    try {
        if (!octokit || !githubConfig) {
            logger.warn('GitHub not initialized');
            return false;
        }
        
        const { owner, repo, branch = 'main' } = githubConfig;
        
        // Read all files in directory recursively
        const files = getAllFiles(dirPath);
        
        for (const file of files) {
            const content = fs.readFileSync(file);
            const contentEncoded = Buffer.from(content).toString('base64');
            
            // Get relative path for GitHub
            const relativePath = path.relative(process.cwd(), file);
            
            // Create or update file
            try {
                const { data } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: relativePath,
                    ref: branch
                });
                
                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: relativePath,
                    message: `${commitMessage} - ${relativePath}`,
                    content: contentEncoded,
                    sha: data.sha,
                    branch
                });
            } catch (error) {
                // File doesn't exist, create it
                await octokit.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: relativePath,
                    message: `${commitMessage} - ${relativePath}`,
                    content: contentEncoded,
                    branch
                });
            }
        }
        
        logger.info(`Successfully pushed directory ${dirPath} to GitHub`);
        return true;
    } catch (error) {
        logger.error('Failed to push directory to GitHub:', error.message);
        return false;
    }
}

/**
 * Get all files in directory recursively
 * @param {string} dirPath - Directory path
 * @returns {string[]} Array of file paths
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    
    return arrayOfFiles;
}

/**
 * Push database backup to GitHub
 * @param {string} dbPath - Path to the database file
 */
async function syncDatabaseBackup(dbPath) {
  try {
    if (!octokit || !githubConfig) {
      logger.warn('GitHub not initialized');
      return false;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `database-backup-${timestamp}.db`;
    
    return await pushToGithub(dbPath, `Database backup ${timestamp}`);
  } catch (error) {
    logger.error('Failed to sync database backup:', error.message);
    return false;
  }
}

module.exports = {
  initGithub,
  pushToGithub,
  testGithubConnection,
  syncDatabaseBackup,
  pushDirectoryToGithub,
  getAllFiles
};
