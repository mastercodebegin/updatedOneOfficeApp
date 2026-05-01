import { useGoogleAuth } from "src/customhooks/useGoogleAuth";
import { asyncStorageKeyName } from "../utilies/Constants";
import { getLocalData, removeLocalData, setLocalData } from "../utilies/storageService";
import { AuthService } from "../service/AuthService";
import axios from 'axios'
import { FolderLocalService } from "./folderLocalService";


export const GoogleDriveService = {



    async getOrCreateGDriveFolderName(accessToken: string, name: string) {
        console.log('getOrCreateGDriveFolderName', accessToken);

        return await this.withAuthRetry(accessToken, async (accessToken: string) => {
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
                        Authorization: `Bearer ${accessToken}`,
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
                        Authorization: `Bearer ${accessToken}`,
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

    async withAuthRetry(accessToken: string, apiCall: (token: string) => Promise<any>
    ) {
        try {
            console.log('accessToken in withAuthRetry', accessToken);

            return await apiCall(accessToken);

        } catch (e: any) {
            if (e?.response?.status === 401) {
                // optional: refresh if you implement it later
                console.log('Token expired, refreshing token...');
                const newToken = await AuthService.refreshAccessToken();
                return await apiCall(newToken);
            }

            throw e;
        }
    },
    async uploadImage(fileUri: string, accessToken: string, folderId: string) {

        console.log('fileUri>>>>>>>>>>>>>>', fileUri);
        console.log('accessToken>>>>>>>>>>>>>>', accessToken);
        console.log('folderId>>>>>>>>>>>>>>', folderId);

        return await this.withAuthRetry(accessToken, async (accessToken) => {
            try {
                const metadata = {
                    name: `photo_${Date.now()}.jpg`,
                    parents: [folderId],
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

                if (!data?.id) {
                    throw new Error("No driveId returned");
                }

                return data.id;

            } catch (error) {
                console.log("Upload error:", error);
                throw error;
            }
        });
    },

    async deleteFolder(accessToken: string, folderId: string) {
        return await this.withAuthRetry(accessToken, async (accessToken) => {
            const res = await fetch(
                `https://www.googleapis.com/drive/v3/files/${folderId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
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