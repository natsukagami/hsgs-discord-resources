/**
 * Various formatting functions
 * @module Formats
 */

const emojiKeywords = require('emojis-keywords');
const emojiArray = require('emojis-list');
const discordEmoji = require('discord-emoji');
const emojis = {};

emojiKeywords.forEach((item, id) => {
	emojis[item] = emojiArray[id];
});

const discordEmojiArray = [];
for (let cat in discordEmoji)
	if (cat !== 'emoji') {
		for (let emo in discordEmoji[cat]) {
			discordEmojiArray.push(discordEmoji[cat][emo]);
		}
	}

/**
 * Parses the duration string and return the number of seconds.
 * @param  {string} str               The duration string.
 * @param  {Number} [currentNumber=0] Internal: Parsed number
 * @param  {Number} [currentTime=0]   Internal: Parsed time
 * @return {Number}                   The number of seconds in the duration.
 */
export function parseTime(str, currentNumber = 0, currentTime = 0) {
	if (!str.length) return currentTime;
	if (/\d/.test(str.charAt(0))) {
		return parseTime(str.slice(1), currentNumber * 10 + Number(str.charAt(0)), currentTime);
	} else {
		if (str.charAt(0) === 's')
			return parseTime(str.slice(1), 0, currentTime + currentNumber);
		currentNumber *= 60;
		if (str.charAt(0) === 'm')
			return parseTime(str.slice(1), 0, currentTime + currentNumber);
		currentNumber *= 60;
		if (str.charAt(0) === 'h')
			return parseTime(str.slice(1), 0, currentTime + currentNumber);
		currentNumber *= 24;
		if (str.charAt(0) === 'D')
			return parseTime(str.slice(1), 0, currentTime + currentNumber);
		currentNumber *= 7;
		if (str.charAt(0) === 'W')
			return parseTime(str.slice(1), 0, currentTime + currentNumber);
		return null; // Invalid time
	}
}

/**
 * Convert time to display-friendly string
 * @param {Number} seconds The duration time
 * @returns {string} The display-friendly string
 */
export function duration(seconds) {
	let now = new Date();
	return require('countdown')(new Date(now.getTime() - seconds * 1000), now).toString();
}
/**
 * Returns the Unicode representation of emoji
 * @param {string} the colon-less name of the emoji
 * @returns {string} the emoji
 */
export function unicodeEmoji(name) {
	if (emojiArray.includes(name)) return name;
	return emojis[`:${name}:`];
}
/**
 * Returns a random emoji.
 * @return {string} The emoji
 */
export function randomEmoji() {
	return discordEmojiArray[Math.trunc(Math.random() * discordEmojiArray.length)];
}