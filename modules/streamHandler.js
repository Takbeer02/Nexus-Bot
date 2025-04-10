const axios = require('axios');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../utils/logger');

class StreamHandler {
    /**
     * Get file extension from mime type
     * @param {string} mimeType - The mime type
     * @returns {string} File extension
     */
    static getExtFromMimeType(mimeType) {
        const mimeTypes = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'audio/mp4': 'm4a',
            'application/pdf': 'pdf',
            'text/plain': 'txt'
        };
        return mimeTypes[mimeType] || 'unknown';
    }

    /**
     * Generate random string for filenames
     * @param {number} length - Length of random string
     * @returns {string} Random string
     */
    static randomString(length) {
        return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex')
            .slice(0, length);
    }

    /**
     * Get stream from URL with improved error handling
     * @param {string} url - URL to get stream from
     * @param {string} [pathName] - Custom path name
     * @param {Object} [options] - Axios options
     * @returns {Promise<Object>} Stream object with path property
     */
    static async getStreamFromURL(url = "", pathName = "", options = {}) {
        // Handle optional pathName
        if (!options && typeof pathName === "object") {
            options = pathName;
            pathName = "";
        }

        try {
            // Validate URL
            if (!url || typeof url !== "string") {
                throw new Error(`Invalid URL: URL must be a string`);
            }

            // Add timeout if not specified
            if (!options.timeout) {
                options.timeout = 30000; // 30 seconds default timeout
            }

            // Add user agent if not specified
            if (!options.headers?.['User-Agent']) {
                options.headers = {
                    ...options.headers,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
                };
            }

            // Make request
            const response = await axios({
                url,
                method: "GET",
                responseType: "stream",
                ...options,
                validateStatus: null // Allow any status code
            });

            // Check status code
            if (response.status !== 200) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            // Generate path name if not provided
            if (!pathName) {
                const ext = response.headers["content-type"] 
                    ? '.' + this.getExtFromMimeType(response.headers["content-type"])
                    : ".unknown";
                    
                pathName = this.randomString(10) + ext;
            }

            // Add path and metadata to stream
            response.data.path = pathName;
            response.data.filename = path.basename(pathName);
            response.data.mime = response.headers["content-type"];
            response.data.size = parseInt(response.headers["content-length"]) || 0;

            return response.data;

        } catch (error) {
            // Enhanced error handling
            let errorMessage = 'Error downloading stream: ';
            
            if (error.response) {
                // Server responded with error
                errorMessage += `Server responded with status ${error.response.status}`;
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                errorMessage += 'Request timed out';
            } else if (error.code === 'ENOTFOUND') {
                // DNS error
                errorMessage += 'Could not resolve hostname';
            } else {
                // Other errors
                errorMessage += error.message;
            }

            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Download stream to file
     * @param {string} url - URL to download from
     * @param {string} outputPath - Path to save file
     * @param {Object} [options] - Download options
     * @returns {Promise<string>} Path to downloaded file
     */
    static async downloadFile(url, outputPath, options = {}) {
        try {
            const stream = await this.getStreamFromURL(url, path.basename(outputPath), options);
            
            return new Promise((resolve, reject) => {
                const writer = fs.createWriteStream(outputPath);
                
                stream.pipe(writer);
                
                writer.on('finish', () => resolve(outputPath));
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }

    /**
     * Get file info from URL without downloading
     * @param {string} url - URL to check
     * @returns {Promise<Object>} File information
     */
    static async getFileInfo(url) {
        try {
            const response = await axios.head(url);
            
            return {
                mime: response.headers["content-type"],
                size: parseInt(response.headers["content-length"]) || 0,
                filename: path.basename(url),
                extension: this.getExtFromMimeType(response.headers["content-type"])
            };
        } catch (error) {
            throw new Error(`Failed to get file info: ${error.message}`);
        }
    }
}

module.exports = StreamHandler;
