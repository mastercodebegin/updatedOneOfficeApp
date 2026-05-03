import { useGoogleAuth } from "src/customhooks/useGoogleAuth";
import { asyncStorageKeyName, CONSTANT } from "../utilies/Constants";
import { getLocalData, removeLocalData, setLocalData } from "../utilies/storageService";
import { AuthService } from "../service/AuthService";
import axios from 'axios'
import { FolderLocalService } from "./folderLocalService";
import { getImageUriByOS } from "../../src/utilies/Utilities";
import RNFetchBlob from "rn-fetch-blob";


export const GoogleDriveService = {



    async getOrCreateGDriveFolderName() {
        const name = CONSTANT.DRIVE_FOLDER_NAME;
        const driveFolderId =
            getLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID) || '';

        console.log('getOrCreateGDriveFolderName driveFolderId', driveFolderId);

        return await this.withAuthRetry(async (token: string) => {
            const existing = await FolderLocalService.getGoogleDriveFolderFromDB();

            if (existing) {
                console.log('return from local');
                return existing;
            }

            // ✅ Build query manually (fetch does NOT support params)
            const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
                query
            )}`;

            console.log('query=====', query);

            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('res=====', res);
            // 🔥 fetch doesn't throw on error
            if (res.status === 401) {
                console.log('res=====from status', res);
                return res
            }

            const data = await res.json();

            console.log('folder data ====', data);

            // ✅ Folder exists
            if (data.files?.length > 0) {
                const folderId = data.files[0].id;

                setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, folderId);

                const allFolders = await FolderLocalService.getAllFolders();

                if (allFolders.length > 0) {
                    await FolderLocalService.updateFolderById({
                        id: allFolders[0].id,
                        driveFolderId: folderId,
                    });
                }

                return folderId;
            }

            // ✅ Create folder
            const createRes = await fetch(
                'https://www.googleapis.com/drive/v3/files',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        mimeType: 'application/vnd.google-apps.folder',
                    }),
                }
            );

            if (!createRes.ok) {
                const text = await createRes.text();
                console.log('Create folder failed:', text);
                throw new Error('Create folder failed');
            }

            const createData = await createRes.json();

            console.log('createData--', createData);

            setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, createData.id);

            return createData.id;
        });
    },

async downloadFile(fileId: string) {
  return await this.withAuthRetry(async (accessToken) => {
    console.log('driveFileId',fileId);
    
    try {
      const dir = CONSTANT.SAVED_DOCUMENTS_PATH;

      const exists = await RNFetchBlob.fs.isDir(dir);
      if (!exists) {
        await RNFetchBlob.fs.mkdir(dir);
      }

      // ✅ STEP 1: Get metadata
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!metaRes.ok) {
        const err = await metaRes.text();
        console.log("META ERROR:", err);
        return metaRes
      }

      const meta = await metaRes.json();
      console.log("META:", meta);

      // ✅ STEP 2: Decide extension + URL
      let fileName = meta.name || `file_${Date.now()}`;
      let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

      if (meta.mimeType?.includes("google-apps")) {
        // handle Google Docs properly
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;

        // force extension
        if (!fileName.endsWith(".pdf")) {
          fileName = fileName + ".pdf";
        }
      }

      const path = `${dir}/${fileName}`;

      // ✅ STEP 3: Download
      const res = await RNFetchBlob.config({
        fileCache: true,
        path,
      }).fetch("GET", url, {
        Authorization: `Bearer ${accessToken}`,
      });

      const status = res.info().status;
      console.log("DOWNLOAD STATUS:", status);

      // ❌ VERY IMPORTANT
      if (status !== 200) {
        const errorText = await res.text();
        console.log("DOWNLOAD ERROR RESPONSE:", errorText);

        // cleanup wrong file
        await RNFetchBlob.fs.unlink(path).catch(() => {});

        throw new Error(`Download failed with status ${status}`);
      }

      // ✅ STEP 4: Validate file size
      const stat = await RNFetchBlob.fs.stat(path);
      console.log("FILE SIZE:", stat.size);

      if (Number(stat.size) < 1000) {
        const text = await res.text();
        console.log("SMALL FILE CONTENT:", text);

        await RNFetchBlob.fs.unlink(path).catch(() => {});
        throw new Error("Downloaded file is invalid (too small)");
      }

      console.log("FILE DOWNLOADED OK:", path);
      return path;

    } catch (error) {
      console.log("Download error:", error);
      throw error;
    }
  });
},

    // async uploadImage(file: { name: string }, folderId: string) {

    //     console.log('fileUri>>>>>>>>>>>>>>', file);
    //     const fileUri = getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + file.name)

    //     console.log('fileUri>>>>>>>>>>>>>>', fileUri);
    //     console.log('folderId>>>>>>>>>>>>>>', folderId);

    //     return await this.withAuthRetry(async (accessToken) => {
    //         try {
    //             const metadata = {
    //                 name: `${file.name}`,
    //                 parents: [folderId],
    //             };

    //             const formData = new FormData();

    //             formData.append("metadata", {
    //                 string: JSON.stringify(metadata),
    //                 type: "application/json",
    //             });


    //             formData.append("file", {
    //                 uri: fileUri,
    //                 type: "image/jpeg",
    //                 name: "photo.jpg",
    //             });

    //             const res = await fetch(
    //                 "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    //                 {
    //                     method: "POST",
    //                     headers: {
    //                         Authorization: `Bearer ${accessToken}`,
    //                     },
    //                     body: formData,
    //                 }
    //             );

    //             const data = await res.json();

    //             console.log("Upload response:", data);

    //             return data;

    //         } catch (error) {
    //             console.log("Upload error:", error);
    //             throw error;
    //         }
    //     });
    // },
    async uploadImage(file: { name: string }, folderId: string) {

        console.log('fileUri>>>>>>>>>>>>>>', file);
        const fileUri = getImageUriByOS(CONSTANT.SAVED_DOCUMENTS_PATH + file.name)
        const accessToken = getLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN) || ''

        console.log('fileUri>>>>>>>>>>>>>>', fileUri);
        console.log('accessToken>>>>>>>>>>>>>>', accessToken);
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

                return data;

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
            const res = await apiCall(accessToken);
            console.log('res=======>>>>>>>.', res);
            console.log('res=======', res?.error?.code);
            if (res?.error?.code === 401) {
                // optional: refresh if you implement it later
                console.log('Token expired, refreshing token...');
                const newToken = await AuthService.refreshAccessToken();
                return await apiCall(newToken);
            }
          else  if (res?.status === 401) {
                // optional: refresh if you implement it later
                console.log('Token expired, refreshing token...');
                const newToken = await AuthService.refreshAccessToken();
                return await apiCall(newToken);
            }
            return res
        } catch (e: any) {
            console.log('erorr=========',e);
            

            throw e;
        }
    },

}