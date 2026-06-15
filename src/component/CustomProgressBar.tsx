import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useMemo } from 'react'
import { scaledSize } from '../utilies/Utilities';
import { useTheme } from '../screen/theme/useTheme';
import { Theme } from '../screen/theme/ThemeConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Progress from 'react-native-progress';
import { Fonts } from '../assets/fonts/GlobalFonts';
import CustomSpinner from './CustomSpinner';

interface CustomProgressBarProps {
    progress: number;
    title?: string;
    subtitle?: string;
    destinationPath?: string; // New prop for backup path
    filesFound?: number;
    foundFiles?: { name: string }[];
    onRescan?: () => void;
    onContinue?: () => void;
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = (props) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const isComplete = props.progress === 100; // Check if progress is 100
    const { onRescan, onContinue, progress, filesFound, foundFiles, title, subtitle, destinationPath } = props;
    const isBackup = title?.includes('Backup');

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
        <View style={[styles.box, isComplete && styles.glow]}>
            <View style={styles.progressContent}>
                <View style={styles.headerSection}>
                    <MaterialCommunityIcons name={title?.includes('Backup') || title?.includes('Import') ? "cloud-upload-outline" : "file-search-outline"} size={scaledSize(28)} color={theme.primaryTextColor} />
                    <Text style={styles.progressTitle}>{title || 'Scanning Files...'}</Text>
                    {subtitle && <Text style={styles.descriptiveText}>{subtitle}</Text>}
                    {isBackup && destinationPath && isComplete && <Text style={styles.destinationPathText}>Saved to: {destinationPath.split('/').slice(-2).join('/')}</Text>}
                </View>

                <View style={styles.divider} />
                {foundFiles && // Only show files section if the prop is provided
                <View style={styles.filesSection}>
                    <Text style={styles.filesFoundText}>{`${filesFound || 0} files found`}</Text>

                    <FlatList
                        data={foundFiles}
                        renderItem={renderFoundFile}
                        keyExtractor={(item, index) => `${item.name}-${index}`}
                        style={styles.fileList}
                        contentContainerStyle={{ paddingBottom: 4 }}
                        ListEmptyComponent={
                            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                {/* <ActivityIndicator size="small" color={theme.themeColor} /> */}
                                </View>
                        }
                    />
                </View>}

                <View style={styles.progressSection}>
                    <Progress.Bar
                        indeterminate={!isComplete && (progress === 0 || !foundFiles)}
                        progress={(progress || 0) / 100}
                        width={scaledSize(220)}
                        height={10}
                        animated={true}
                        borderRadius={5}
                        color={theme.themeColor}
                        unfilledColor={theme.bgColor}
                        borderColor={theme.borderColor}
                        useNativeDriver={true}
                    />
                    <Text style={styles.progressPercentage}>{`${progress || 0}% complete`}</Text>
                </View>

                {isComplete && onContinue && onRescan && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={onRescan}>
                            <MaterialCommunityIcons name={isBackup ? "close" : "refresh"} size={scaledSize(isBackup ? 20 : 18)} color={theme.themeColor} />
                            <Text style={styles.secondaryButtonText}>{isBackup ? "Close" : "Rescan"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onContinue}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.primaryButtonText}>Continue</Text>
                            <MaterialCommunityIcons name="arrow-right" size={scaledSize(20)} color={theme.themeColor} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    box: {
        width: '90%',
        maxWidth: scaledSize(340),
        borderRadius: scaledSize(28),
        backgroundColor: theme.bgContainor,
        alignItems: 'center',
        justifyContent: 'center',
        padding: scaledSize(24),
        shadowColor: theme.bgColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 15,
    },
    glow: {
        shadowColor: theme.themeColor,
        shadowOpacity: 0.7,
        shadowRadius: 15,
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
        fontSize: scaledSize(16),
        color: theme.primaryTextColor,
        // fontWeight: '600',
        letterSpacing: 0.5,
        marginTop: scaledSize(12),
        fontFamily: Fonts.bold,
    },
    descriptiveText: {
        fontSize: scaledSize(13),
        color: theme.primaryTextColor,
        marginTop: scaledSize(4),
        fontFamily: Fonts.regular,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: theme.borderColor,
        marginBottom: scaledSize(20),
    },
    filesSection: {
        width: '100%',
        marginBottom: scaledSize(20),
    },
    filesFoundText: {
        fontSize: scaledSize(13),
        color: theme.primaryTextColor,
        fontFamily: Fonts.regular,
        marginBottom: scaledSize(12),
        textAlign: 'left',
    },
    fileList: {
        height: scaledSize(120),
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.bgColor,
        borderRadius: scaledSize(8),
        paddingVertical: scaledSize(8),
        paddingHorizontal: scaledSize(10),
        marginBottom: scaledSize(6),
    },
    fileName: {
        flex: 1,
        color: theme.primaryTextColor,
        fontSize: scaledSize(12),
        fontFamily: Fonts.regular,
        marginLeft: scaledSize(8),
        marginRight: scaledSize(8),
    },
    progressSection: {
        width: '100%',
        alignItems: 'center',
    },
    progressPercentage: {
        marginTop: scaledSize(12),
        fontSize: scaledSize(13),
        color: theme.primaryTextColor,
        fontWeight: '500',
        fontFamily: Fonts.regular,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: scaledSize(24),
        paddingTop: scaledSize(20),
        borderTopWidth: 1,
        borderColor: theme.borderColor,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: scaledSize(48),
        // backgroundColor: theme.buttonBGColor,
        borderRadius: scaledSize(14),
        marginRight: scaledSize(8),
        // borderWidth: 1,
        borderColor: theme.borderColor
    },
    secondaryButtonText: {
        color: theme.primaryTextColor,
        fontSize: scaledSize(14),
        fontFamily:Fonts.regular,
        letterSpacing:.5,
        // fontWeight: '500',
        marginLeft: scaledSize(8),
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: scaledSize(48),
        // borderWidth: 1.5,
        borderColor: theme.themeColor,
        borderRadius: scaledSize(10),
        marginLeft: scaledSize(8),
    },
    primaryButtonText: {
        color: theme.primaryTextColor,
        fontSize: scaledSize(14),
        // fontWeight: '500',
        letterSpacing:.5,
        fontFamily: Fonts.regular,
        marginRight: scaledSize(8),
    },
    destinationPathText: {
        fontSize: scaledSize(11),
        color: theme.secondaryTextColor,
        fontFamily: Fonts.regular,
        marginTop: scaledSize(8),
        textAlign: 'center',
        paddingHorizontal: scaledSize(10),
    },
});

export default CustomProgressBar;