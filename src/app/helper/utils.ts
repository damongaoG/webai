import { KeywordData } from "../views/dashboard/components/content/main-content/interfaces/keyword.interface";

export const splitArray = (array: Array<any>, chunkSize: number) => {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(1)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));
};

/**
 * Parse keywords string from API response into KeywordData array
 * @param keywordsString - String with keywords separated by newlines and/or commas
 * @returns Array of KeywordData objects
 */
export const parseKeywordsToData = (keywordsString: string): KeywordData[] => {
  if (!keywordsString || keywordsString.trim() === "") {
    return [];
  }

  // Split by newlines first, then by commas, and clean up
  const keywords = keywordsString
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .flatMap((line) => line.split(","))
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);

  // Remove duplicates and convert to KeywordData objects
  const uniqueKeywords = [...new Set(keywords)];

  return uniqueKeywords.map((keyword, index) => ({
    id: `keyword-${index + 1}`,
    text: keyword,
    isSelected: false,
  }));
};

//countdown

const currentDate = new Date();
const eventDate = currentDate.setDate(currentDate.getDate() + 4);

export const calculateTimeToEvent = () => {
  const currentDate = new Date();

  const timeRemaining = eventDate - currentDate.getTime();

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};
