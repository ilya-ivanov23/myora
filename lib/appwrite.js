import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';
import uuid from 'react-native-uuid';

// Конфигурация Appwrite
export const Config = {
    endpoint: 'https://cloud.appwrite.io/v1', // API URL
    platform: 'com.idprod23.myora', // Платформа (для React Native)
    projectId: '67325836001a059fb129', // ID проекта в Appwrite
    databaseId: '673259f00005105c4fee', // ID базы данных
    userCollectionId: '67325a1c002257654206', // ID коллекции пользователей
    videoCollectionId: '67325a49001a481e2b04', // ID коллекции видео
    storageId: '67325bbf000a5e55cb4d', // ID хранилища (опционально)
};

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId,
} = Config;

// Инициализация SDK
const client = new Client();
client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

let session = null; // Храним информацию о сессии

// Функция для генерации уникального userId
function generateUniqueUserId() {
    let userId = uuid.v4().replace(/-/g, '');
    console.log("Generated userId (raw):", userId);

    const regex = /^[a-zA-Z0-9._-]+$/;
    const isValid = regex.test(userId) && userId.length <= 36 && !/^[._-]/.test(userId);

    if (!isValid) {
        console.error("Generated userId is INVALID:", userId);
        userId = generateUniqueUserId(); // Рекурсивный вызов
        console.log("Regenerated userId:", userId);
    } else {
        console.log("Generated userId (valid):", userId);
    }
    return userId;
}

// Альтернативная функция генерации userId (гарантированно рабочая)
function generateUniqueUserIdAlternative() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 30; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log("Generated userId (alternative):", result);
    return result;
}


export async function createUser(email, password, username) {
    try {
        // Выберите один из способов генерации userId:
        // const userId = generateUniqueUserId(); // С проверкой и uuid
        const userId = generateUniqueUserIdAlternative(); // Альтернативный способ (рекомендуется)

        console.log("Final userId before create:", userId); // Логирование перед create

        const newAccount = await account.create(userId, email, password, username);
        if (!newAccount) throw new Error('Account creation failed');

        session = await account.createSession(email, password);
        if (!session) throw new Error('Session creation failed');

        const avatarUrl = avatars.getInitials(username);

        const newUser = await databases.createDocument(
            databaseId,
            userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
            }
        );

        return newUser;
    } catch (error) {
        console.error("Error during user creation:", error);
        console.error("Error details:", error.response);
        console.error("Error stack:", error.stack);
        throw new Error(error.message || 'Error during user creation');
    }
}

// Функция для входа в систему
export const signIn = async (email, password) => {
    try {
        session = await account.createSession(email, password);
        console.log('User signed in successfully');
        return session;
    } catch (error) {
        console.error('Error during sign-in:', error);
        throw new Error(error.message || 'Error during sign-in');
    }
}

// Функция получения информации о текущем аккаунте
export async function getAccount() {
    try {
        if (!session) {
            console.warn('No active session found.');
            return null;
        }
        return await account.get();
    } catch (error) {
        if (error.code === 401) {
            console.error('User not authenticated:', error.message);
            session = null; // Очищаем информацию о сессии
            await signOut();
        } else {
            console.error('Error getting account:', error);
        }
        return null;
    }
}

// Получение текущего пользователя
export const getCurrentUser = async () => {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) {
            console.warn('No account found. User is likely not logged in.');
            return null;
        }

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser.documents.length) {
            console.warn('User document not found in database.');
            return null;
        }

        return currentUser.documents[0];
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

// Функция для выхода из системы
export const signOut = async () => {
    try {
        await account.deleteSession('current');
        session = null; // Очищаем информацию о сессии
        console.log('User logged out successfully');
    } catch (error) {
        if (error.code === 401) {
            console.log('No active session to delete. Already logged out.');
        } else {
            console.error('Error during logout:', error);
        }
    }
}

// Получение всех постов
export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId);
        return posts.documents;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error(error.message || 'Error fetching posts');
    }
}

// Получение последних постов
export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        );
        return posts.documents;
    } catch (error) {
        console.error('Error fetching latest posts:', error);
        throw new Error(error.message || 'Error fetching latest posts');
    }
}

// Поиск постов
export const searchPosts = async (searchQuery) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.search('title', searchQuery)]
        );
        return posts.documents;
    } catch (error) {
        console.error('Error searching posts:', error);
        throw new Error(error.message || 'Error searching posts');
    }
}

// Получение постов пользователя
export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId)]
        );
        return posts.documents;
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw new Error(error.message || 'Error fetching user posts');
    }
}
