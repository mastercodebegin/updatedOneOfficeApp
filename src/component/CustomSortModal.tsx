import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useMemo } from 'react'
import { scaledSize, VECTOR_ICON_LIBRARIES } from '../../src/utilies/Utilities';
import { useTheme } from '../../src/screen/theme/useTheme';
import { Theme } from '../../src/screen/theme/ThemeConfig';


interface CustomSortModalProps {
    data:Array<any>,
    isvisible: boolean;  // You can add props here if needed, such as:
    onPressApply: (sort: string) => void; // visible: boolean;
    onPressClear: () => void; // onClose: () => void;
    onPressClose: () => void; // onApply: (selectedSort: string) => void;
}


export default function CustomSortModal(props: CustomSortModalProps) {
    const { isvisible,data, onPressApply, onPressClear, onPressClose } = props;
    const [isShowSortModal, setIsShowSortModal] = React.useState(false);
    const [selectedSort, setSelectedSort] = React.useState('');
    const { mode, theme } = useTheme();

    const styles = useMemo(() => {
        return createStyles(theme, mode)
    }, [theme])

    return (
        <Modal
            visible={isvisible}
            transparent
            animationType="fade"
            onRequestClose={() =>
                onPressClose()
            }>

            <View style={styles.modalOverlay}>

                <View style={styles.sortModalContainer}>

                    {/* Header */}
                    <View style={styles.headerRow}>

                        <Text style={styles.sortTitle}>
                            Sort by
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                                onPressClose()
                            }
                            style={styles.closeBtn}>

                            <VECTOR_ICON_LIBRARIES.Ionicons
                                name="close"
                                size={22}
                                color={
                                    theme.primaryTextColor
                                }
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Options */}
                    {data.map(item => {
                        const isSelected =
                            selectedSort === item.id;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setSelectedSort(
                                        item.id,
                                    );
                                    onPressApply(item.id)
                                    setIsShowSortModal(
                                        false,
                                    );
                                }}
                                style={styles.sortRow}>

                                <View
                                    style={[
                                        styles.radioOuter,

                                        isSelected && {
                                            borderColor:
                                                theme.themeColor,
                                        },
                                    ]}>

                                    {isSelected && (
                                        <View
                                            style={
                                                styles.radioInner
                                            }
                                        />
                                    )}
                                </View>

                                <Text
                                    style={
                                        styles.sortLabel
                                    }>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    {/* Footer */}
                    <View style={styles.footerRow}>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                                setSelectedSort('');
                                onPressClear();
                            }}
                            style={styles.clearButton}>

                            <Text style={styles.clearText}>
                                Clear
                            </Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                onPressApply(selectedSort)
                            }
                            style={styles.applyButton}>

                            <Text style={styles.applyText}>
                                Apply
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </View>

        </Modal>
    )
}

const createStyles = (theme: Theme, mode: string) => StyleSheet.create({
    modalOverlay: {
        flex: 1,

        backgroundColor: 'rgba(0,0,0,0.45)',

        justifyContent: 'center',

        paddingHorizontal: scaledSize(20),
    },
    sortModalContainer: {
        width: '98%',

        backgroundColor:
            theme.bgContainor,

        borderRadius: scaledSize(6),

        paddingTop: scaledSize(18),

        paddingBottom: scaledSize(18),

        paddingHorizontal: scaledSize(18),

        borderWidth: scaledSize(1),

        borderColor: theme.borderColor,
    },

    headerRow: {
        flexDirection: 'row',

        alignItems: 'center',

        justifyContent:
            'space-between',

        marginBottom: scaledSize(20),
    },

    sortTitle: {
        fontSize: scaledSize(18),

        fontWeight: '700',

        color: theme.primaryTextColor,
    },

    closeBtn: {
        width: scaledSize(30),

        height: scaledSize(30),

        borderRadius: scaledSize(16),

        justifyContent: 'center',

        alignItems: 'center',

        backgroundColor:
            theme.buttonBGColor,
    },

    sortRow: {
        flexDirection: 'row',

        alignItems: 'center',

        marginBottom: scaledSize(20),
        paddingVertical: scaledSize(6),
    },

    radioOuter: {
        width: scaledSize(20),

        height: scaledSize(20),

        borderRadius: scaledSize(12),

        borderWidth: scaledSize(1),

        borderColor: '#B8BDC9',

        justifyContent: 'center',

        alignItems: 'center',
    },

    radioInner: {
        width: scaledSize(10),

        height: scaledSize(10),

        borderRadius: scaledSize(5),

        backgroundColor:
            theme.themeColor,
    },

    sortLabel: {
        marginLeft: scaledSize(14),

        fontSize: scaledSize(12),

        color: theme.primaryTextColor,

        fontWeight: '500',
    },
    footerRow: {
        flexDirection: 'row',

        justifyContent: 'flex-end',

        marginTop: 10,

        paddingTop: 12,

        borderTopWidth: 1,

        borderTopColor: theme.borderColor,
    },

    clearButton: {
        height: scaledSize(40),

        paddingHorizontal: scaledSize(20),

        borderRadius: scaledSize(12),

        justifyContent: 'center',

        alignItems: 'center',

        backgroundColor:
            theme.buttonBGColor,

        marginRight: scaledSize(10),
    },

    clearText: {
        fontSize: scaledSize(12),

        fontWeight: '600',

        color: theme.primaryTextColor,
    },

    applyButton: {
        height: 44,

        paddingHorizontal: 22,

        borderRadius: 12,

        justifyContent: 'center',

        alignItems: 'center',

        backgroundColor:
            theme.themeColor,
    },

    applyText: {
        fontSize: 15,

        fontWeight: '700',

        color: theme.secondaryTextColor,
    },
})