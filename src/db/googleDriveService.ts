import { useGoogleAuth } from "src/customhooks/useGoogleAuth";
import { asyncStorageKeyName, CONSTANT } from "../utilies/Constants";
import { getLocalData, removeLocalData, setLocalData } from "../utilies/storageService";
import { AuthService } from "../service/AuthService";
import axios from 'axios'
import { FolderLocalService } from "./folderLocalService";
import { getImageUriByOS } from "../../src/utilies/Utilities";
import  RNFetchBlob  from "rn-fetch-blob";


export const GoogleDriveService = {



    async getOrCreateGDriveFolderName() {
        const name = CONSTANT.DRIVE_FOLDER_NAME
        // const accessToken = getLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN) || ''
        const driveFolderId = getLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID) || ''
        console.log('getOrCreateGDriveFolderName driveFolderId', driveFolderId);
        // console.log('getOrCreateGDriveFolderName', accessToken);

        return await this.withAuthRetry(async (accessToken: string) => {
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
            console.log('folder created on gdrive ====', res);

            const data = res.data; // axios already parses JSON
            console.log('folder data ====', data);

            // Step 3: If folder exists → return ID
            if (data.files?.length > 0) {
                setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, data.files[0].id)
                const allFolders = await FolderLocalService.getAllFolders()
                console.log('allFolders>>>', allFolders)
                if (allFolders.length > 0) {
                    console.log('updated folder drive id ======', { id: allFolders[0].id, driveFolderId: data.files[0].id });

                    await FolderLocalService.updateFolderById({ id: allFolders[0].id, driveFolderId: data.files[0].id })

                }
                return data.files[0].id;
            }
            console.log('DRIVE_FOLDER_ID>>>>>>>>>.', data);
            if (!data?.files?.[0]?.id) {
                setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, data.files.id)
                return data.files.id
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
            setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, createData.id)

            // axios automatically throws error for non-2xx
            return createData.id;
        });
    },

    async downloadFile(fileId: string) {
        console.log('drivefiled====', fileId);

        return await this.withAuthRetry(async (accessToken) => {
            try {
                const dir = CONSTANT.SAVED_DOCUMENTS_PATH;

                // ✅ ensure folder exists
                const exists = await RNFetchBlob.fs.isDir(dir);
                if (!exists) {
                    await RNFetchBlob.fs.mkdir(dir);
                }

                const fileName = `file_${Date.now()}.jpg`;
                const path = `${dir}/${fileName}`;

                const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

                const res = await RNFetchBlob.config({
                    fileCache: true,
                    path: path,
                }).fetch("GET", url, {
                    Authorization: `Bearer ${accessToken}`,
                });

                console.log("FILE DOWNLOADED");
                console.log("Saved at:", res.path());

                return res.path();

            } catch (error) {
                console.log("Download error:", error);
            }
        })
    },

    async uploadImage(file: { name: string }, folderId: string) {

        console.log('fileUri>>>>>>>>>>>>>>', file);
        const fileUri = getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + file.name)

        console.log('fileUri>>>>>>>>>>>>>>', fileUri);
        console.log('folderId>>>>>>>>>>>>>>', folderId);

        return await this.withAuthRetry(async (accessToken) => {
            try {
                const metadata = {
                    name: `${file.name}`,
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
        return await this.withAuthRetry(async (accessToken) => {
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
    },


    async withAuthRetry(apiCall: (token: string) => Promise<any>) {
        try {
            const accessToken: any = getLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN) || ''
            console.log('withAuthRetry accessToken', accessToken);
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

}