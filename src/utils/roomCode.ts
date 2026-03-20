// src/utils/roomCode.ts

/**
 * Generates a unique room code for owners.
 * Format: KB-[4 random uppercase chars/numbers]
 * Example: KB-4A2D
 */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like I, O, 0, 1
  let result = 'KB-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
