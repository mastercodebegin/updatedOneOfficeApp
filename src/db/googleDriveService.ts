import { useGoogleAuth } from "src/customhooks/useGoogleAuth";
import { asyncStorageKeyName } from "../utilies/Constants";
import { getLocalData, removeLocalData, setLocalData } from "../utilies/storageService";
import { AuthService } from "../service/AuthService";
import axios from 'axios'
import { FolderLocalService } from "./folderLocalService";


export const GoogleDriveService = {



    async getOrCreateGDriveFolderName(name: string) {
        return await this.withAuthRetry(async (token) => {
            const existing = await FolderLocalService.getGoogleDriveFolderFromDB();
            console.log('existing', existing);

            if (existing) {
                console.log('return from local');

                return existing; // ✅ fast, no API call

            }

            const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            console.log('query=====', query);

            const res = await axios.get(
                "https://www.googleapis.com/drive/v3/files",
                {
                    params: { q: query }, // axios will encode automatically ✅
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = res.data; // axios already parses JSON

            // Step 3: If folder exists → return ID
            if (data.files?.length > 0) {
                
                return data.files[0].id;
            }

            // Step 4: Create folder
            const createRes = await axios.post(
                "https://www.googleapis.com/drive/v3/files",
                {
                    name,
                    mimeType: "application/vnd.google-apps.folder",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const createData = createRes.data;

            console.log("createData--", createData);
            // setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, createData.id)

            // axios automatically throws error for non-2xx
            return createData.id;
        });
    },

    async withAuthRetry(apiCall: (token: string) => Promise<any>) {
        console.log('withAuthRetry started-------');

        try {
            const token = await AuthService.getAccessToken();
            // console.log("TOKEN RECEIVED:", token); // ✅ correct place

            return await apiCall(token);

        } catch (e: any) {
            console.log('error-------', e);
            
            // Axios error status is inside e.response.status
            if (e?.response?.status === 401) {
                console.log('error 401-------', e);
                const newToken = await AuthService.refreshAccessToken();
                return await apiCall(newToken);
            }

            console.log("withAuthRetry err", e);
            throw e;
        }
    },

    async uploadImage(fileUri: string, accessToken: string, GoogleDriveFolderId: string) {
        try {
            const metadata = {
                name: `photo_${Date.now()}.jpg`,
                parents: [GoogleDriveFolderId],
            };

            const formData = new FormData();

            formData.append("metadata", {
                string: JSON.stringify(metadata),
                type: "application/json",
            });

            formData.append("file", {
                uri: fileUri,
                type: "image/jpeg",
                name: "photo.jpg",
            });

            const res = await fetch(
                "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();

            console.log("Upload response:", data);

            return data.id;

        } catch (error) {
            console.log("Upload error:", error);
        }
    },

    async deleteFolder(folderId: string) {
        return await this.withAuthRetry(async (token) => {
            const res = await fetch(
                `https://www.googleapis.com/drive/v3/files/${folderId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete folder");
            }
            removeLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID)
            console.log("🗑️ Folder deleted from Drive:", folderId);
        });
    }

}