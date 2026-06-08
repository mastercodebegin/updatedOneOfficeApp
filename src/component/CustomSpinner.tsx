import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import Spinner from 'react-native-loading-spinner-overlay';
import { scaledSize } from '../utilies/Utilities';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomProgressBar from './CustomProgressBar';
import { Fonts } from '../assets/fonts/GlobalFonts';

interface S {
  isLoading: boolean;
  text?: string;
  progress?: number;
  filesFound?: number;
  foundFiles?: { name: string }[];
  onRescan?: () => void;
  onContinue?: () => void;
}

export default function CustomSpinner(props: S) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const showProgress = props.progress !== undefined && props.progress >= 0;
  const isComplete = props.progress === 100;
  const { onRescan, onContinue } = props;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return { name: 'file-pdf-box', color: '#F44336' };
      case 'docx':
      case 'doc':
        return { name: 'file-word-box', color: '#2196F3' };
      case 'xlsx':
      case 'xls':
        return { name: 'file-excel-box', color: '#4CAF50' };
      default:
        return { name: 'file-document-outline', color: '#A1A1AA' };
    }
  };

  const renderFoundFile = ({ item }: { item: { name: string } }) => {
    const icon = getFileIcon(item.name);
    return (
      <View style={styles.fileRow}>
        <MaterialCommunityIcons name={icon.name} size={scaledSize(22)} color={icon.color} />
        <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
        <MaterialCommunityIcons name="check-circle" size={scaledSize(20)} color="#34C759" />
      </View>
    );
  };

  return (
    <Spinner
      visible={props.isLoading}
      animation="fade"
      overlayColor="rgba(0, 0, 0, 0.7)"
      customIndicator={
        <View style={[styles.box, isComplete && styles.glow]}>
          {showProgress ? (
            <View style={styles.progressContent}>
              <View style={styles.headerSection}>
                <MaterialCommunityIcons name="file-search-outline" size={scaledSize(28)} color="#A1A1AA" />
                <Text style={styles.progressTitle}>Scanning Files...</Text>
                <Text style={styles.descriptiveText}>Searching documents in your storage...</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.filesSection}>
                <Text style={styles.filesFoundText}>{`${props.filesFound || 0} files found`}</Text>
                <FlatList
                  data={props.foundFiles || []}
                  renderItem={renderFoundFile}
                  keyExtractor={(item, index) => `${item.name}-${index}`}
                  style={styles.fileList}
                  contentContainerStyle={{ paddingBottom: 4 }}
                />
              </View>

              <View style={styles.progressSection}>
                <CustomProgressBar progress={props.progress || 0} />
                <Text style={styles.progressPercentage}>{`${props.progress || 0}% complete`}</Text>
              </View>

              {isComplete && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={onRescan}>
                    <MaterialCommunityIcons name="refresh" size={scaledSize(18)} color="#A1A1AA" />
                    <Text style={styles.secondaryButtonText}>Rescan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onContinue}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={scaledSize(20)} color="#34C759" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <>
              <ActivityIndicator
                size="large"
                color="#FFFFFF"
              />
              <Text style={styles.text}>{props.text || 'Loading...'}</Text>
            </>
          )}
        </View>
      }
    />
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  box: {
    width: '90%',
    maxWidth: scaledSize(340),
    borderRadius: scaledSize(28),
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaledSize(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  glow: {
    shadowColor: '#34C759',
    shadowOpacity: 0.7,
    shadowRadius: 15,
  },
  text: {
    marginTop: scaledSize(20),
    fontSize: scaledSize(14),
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  progressContent: {
    alignItems: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: scaledSize(20),
  },
  progressTitle: {
    fontSize: scaledSize(19),
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: scaledSize(12),
    fontFamily: Fonts.bold,
  },
  descriptiveText: {
    fontSize: scaledSize(13),
    color: '#A1A1AA',
    marginTop: scaledSize(4),
    fontFamily: Fonts.regular,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A2A2A',
    marginBottom: scaledSize(20),
  },
  filesSection: {
    width: '100%',
    marginBottom: scaledSize(20),
  },
  filesFoundText: {
    fontSize: scaledSize(13),
    color: '#A1A1AA',
    fontFamily: Fonts.medium,
    marginBottom: scaledSize(12),
    textAlign: 'left',
  },
  fileList: {
    maxHeight: scaledSize(120),
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: scaledSize(8),
    paddingVertical: scaledSize(8),
    paddingHorizontal: scaledSize(10),
    marginBottom: scaledSize(6),
  },
  fileName: {
    flex: 1,
    color: '#E4E4E7',
    fontSize: scaledSize(12),
    fontFamily: Fonts.regular,
    marginLeft: scaledSize(8),
    marginRight: scaledSize(8),
  },
  progressSection: {
    width: '100%',
  },
  progressPercentage: {
    marginTop: scaledSize(12),
    fontSize: scaledSize(13),
    color: '#A1A1AA',
    fontWeight: '500',
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: scaledSize(24),
    paddingTop: scaledSize(20),
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaledSize(48),
    backgroundColor: '#2A2A2A',
    borderRadius: scaledSize(14),
    marginRight: scaledSize(8),
  },
  secondaryButtonText: {
    color: '#A1A1AA',
    fontSize: scaledSize(14),
    fontWeight: '600',
    marginLeft: scaledSize(8),
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaledSize(48),
    borderWidth: 1.5,
    borderColor: '#34C759',
    borderRadius: scaledSize(14),
    marginLeft: scaledSize(8),
  },
  primaryButtonText: {
    color: '#34C759',
    fontSize: scaledSize(14),
    fontWeight: '600',
    marginRight: scaledSize(8),
  },
});