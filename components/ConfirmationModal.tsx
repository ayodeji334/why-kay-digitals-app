import React, { Dispatch, SetStateAction } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { formatAmount } from "../libs/formatNumber";
import CustomIcon from "./CustomIcon";
import { DangerIcon } from "../assets";
import { COLORS } from "../constants/colors";

export default function ConfirmationModal({
  showConfirmModal,
  setShowConfirmModal,
  data,
  handleProceed,
}: {
  data: any;
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<React.SetStateAction<boolean>>;
  handleProceed: () => void;
}) {
  return (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            paddingVertical: 30,
            paddingHorizontal: 20,
            width: "100%",
            alignItems: "center",
          }}
        >
          <View style={{ paddingBottom: 10 }}>
            <CustomIcon source={DangerIcon} size={35} />
          </View>
          <Text
            style={{
              fontFamily: getFontFamily("800"),
              fontSize: normalize(23),
              marginTop: 10,
            }}
          >
            Confirm Transaction
          </Text>

          <Text
            style={{
              marginTop: 10,
              textAlign: "center",
              fontSize: normalize(18),
              fontFamily: getFontFamily(400),
              color: "#000",
              maxWidth: 190,
            }}
          >
            You are about to transfer {formatAmount(data?.amount ?? 0)}. This is
            a large amount. Please confirm that you want to proceed with this
            transaction.
          </Text>

          <TouchableOpacity
            onPress={handleProceed}
            style={{
              backgroundColor: COLORS.primary,
              width: "100%",
              paddingVertical: 14,
              borderRadius: 50,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontFamily: getFontFamily("800"),
                fontSize: normalize(18),
              }}
            >
              Yes, Proceed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowConfirmModal(false)}
            style={{
              backgroundColor: "#e8e8e8ff",
              width: "100%",
              paddingVertical: 14,
              borderRadius: 50,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "#1A1A1A",
                textAlign: "center",
                fontFamily: getFontFamily("800"),
                fontSize: normalize(16),
              }}
            >
              No, Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
