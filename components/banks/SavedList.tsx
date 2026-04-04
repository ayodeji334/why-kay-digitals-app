import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

interface Beneficiary {
  id: number;
  uuid: string;
  identifier: string;
  meta: {
    account_name: string;
    bank_code: string;
    account_number: string;
    bank_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  savedBeneficiaries: Beneficiary[];
  selectedBeneficiary: number | null;
  handleSelectBeneficiary: (beneficiary: Beneficiary) => void;
  onViewAll?: () => void;
}

export default function SavedBeneficiariesList({
  savedBeneficiaries,
  selectedBeneficiary,
  handleSelectBeneficiary,
  onViewAll,
}: Props) {
  if (!savedBeneficiaries || savedBeneficiaries.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: Beneficiary }) => {
    const isSelected = selectedBeneficiary === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected ? styles.cardSelected : styles.cardDefault,
        ]}
        onPress={() => handleSelectBeneficiary(item)}
      >
        <View style={styles.row}>
          {/* <View style={styles.avatar}>
            <User width={20} height={20} stroke="#16a34a" />
          </View> */}
          <View style={styles.info}>
            <View style={styles.rowBetween}>
              <Text style={styles.name}>{item.meta.account_name}</Text>
              <Text style={styles.lastUsed}>
                {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.details} numberOfLines={1}>
              {item.meta.bank_name} • {item.meta.account_number}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Saved Beneficiaries</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={savedBeneficiaries}
        keyExtractor={item => item.uuid}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    color: "#6b7280", // gray-500
  },
  viewAll: {
    fontSize: 12,
    color: "#2563eb", // blue-600
    fontWeight: "500",
  },
  card: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardDefault: {
    borderColor: "#e5e7eb", // gray-200
    backgroundColor: "#fff",
  },
  cardSelected: {
    borderColor: "#16a34a", // green-600
    backgroundColor: "#f0fdf4", // green-50
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7", // green-100
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  lastUsed: {
    fontSize: 10,
    color: "#9ca3af", // gray-400
  },
  details: {
    fontSize: 12,
    color: "#6b7280", // gray-500
  },
});
