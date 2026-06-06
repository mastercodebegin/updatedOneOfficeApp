import * as React from 'react';
import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import {
  deleteFile,
} from '../utilies/Utilities';

import {
  getLocalData,
  setLocalData,
} from '../utilies/storageUtility';

import { asyncStorageKeyName } from '../utilies/Constants';

import { updateSelectedFiles } from '../screen/dashboard/FileSlice';

import { PdfIcon } from '../assets/GlobalImages';

import { useTheme } from '../screen/theme/useTheme';

import CustomSpinner from './CustomSpinner';
import CustomEmptyState from './CustomEmptyState';
import CommonFolderView from './CommonFolderView';

interface S {
  searchValue: string;
  onReLoad: Function;
  isLoading: boolean;
  pdfFiles: Array<any>;
  selectedSort: string;
  viewMode: 'list' | 'folder';
}

const ReadSystemFile = forwardRef((props: S, ref) => {

  const {
    searchValue,
    pdfFiles,
    onReLoad,
    isLoading,
    selectedSort,
    viewMode,
  } = props;

  const dispatch = useDispatch();

  const { theme } = useTheme();

  const { selectedFiles } = useSelector(
    (state: any) => state.FileSlice,
  );

  const [pdfData, setPdfData] = useState([]);

  useImperativeHandle(ref, () => ({
    async readPdfFiles() {
      console.log('reload files');
    },
  }));

  useEffect(() => {
    setPdfData(pdfFiles);
  }, [pdfFiles]);

  const sanitizeFilesForRedux = file => {
    return {
      id: file.id,
      name: file.name,
      path: file.path,
      size: file.size,

      mtime: file.mtime
        ? new Date(
            file.mtime,
          ).toISOString()
        : null,
    };
  };
  const onPressItem = item => {
    dispatch(
      updateSelectedFiles(
        sanitizeFilesForRedux(
          item,
        ),
      ),
    );
  };
  const onLongPress = item => {
    dispatch(
      updateSelectedFiles(
        sanitizeFilesForRedux(
          item,
        ),
      ),
    );
  };
  const deleteFileHandler = item => {

    const allFiles = JSON.parse(
      getLocalData(
        asyncStorageKeyName.ALL_FILES,
      ),
    );

    const updatedFiles =
      allFiles.pdfFiles.filter(
        file =>

          !(

            file.name ===
              item.name &&

            file.path ===
              item.path

          ),
      );

    deleteFile(item.path);

    setLocalData(
      asyncStorageKeyName.ALL_FILES,

      JSON.stringify({

        ...allFiles,

        pdfFiles:
          updatedFiles,

      }),
    );

    setPdfData(
      updatedFiles,
    );
  };

  return (

    <SafeAreaView
      style={{
        flex: 1,

        backgroundColor:
          theme.bgContainor,
      }}>

      {/* <CustomSpinner
        isLoading={true}
      /> */}

      {pdfData.length === 0 ? (

        <CustomEmptyState
          onPressReload={
           ()=> onReLoad()
          }
        />

      ) : (

        <CommonFolderView
          files={pdfData}
          viewMode={viewMode}
          searchValue={searchValue}
          selectedSort={selectedSort}
          icon={PdfIcon}
          screenName="PdfViewer"
          onPressItem={
            onPressItem
          }

          onLongPress={
            onLongPress
          }

          onPressDeleteFile={
            deleteFileHandler
          }

        />

      )}

    </SafeAreaView>

  );
});

export default React.memo(
  ReadSystemFile,
);

const styles =
StyleSheet.create({});