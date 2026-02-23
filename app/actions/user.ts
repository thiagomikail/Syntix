"use server";

import fs from "fs";
import path from "path";
import { AnalysisResult } from "@/types/analysis";

const DATA_DIR = path.join(process.cwd(), "data", "users");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface SavedIdea {
    id: string;
    timestamp: string;
    text: string;
    analysis: AnalysisResult;
}

export interface UserData {
    username: string;
    history: SavedIdea[];
}

export async function getUserData(username: string): Promise<UserData> {
    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(DATA_DIR, `${safeUsername}.json`);

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
    }

    // Create new user file if not exists
    const newUser: UserData = {
        username,
        history: []
    };

    fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2));
    return newUser;
}

export async function saveIdea(username: string, ideaText: string, analysis: AnalysisResult): Promise<UserData> {
    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(DATA_DIR, `${safeUsername}.json`);

    const userData = await getUserData(username);

    const newIdea: SavedIdea = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        text: ideaText,
        analysis
    };

    // Add to beginning of history
    userData.history.unshift(newIdea);

    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
    return userData;
}

export async function deleteIdea(username: string, ideaId: string): Promise<UserData> {
    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(DATA_DIR, `${safeUsername}.json`);

    const userData = await getUserData(username);

    userData.history = userData.history.filter(idea => idea.id !== ideaId);

    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
    return userData;
}
