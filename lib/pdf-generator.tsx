import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  field: {
    marginBottom: 8,
    flexDirection: "row",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    width: 150,
  },
  value: {
    fontSize: 12,
    flex: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    marginVertical: 10,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20,
  },
});

interface ApplicationData {
  sectorNumber: string;
  roadNumber: string;
  plotNumber: string;
  plotSize: string;
  ownershipProofType: string;
  ownerNameEnglish: string;
  ownerNameBangla: string;
  contactNumber: string;
  nidNumber: string;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  paymentMethod: string;
  membershipFee: number;
  bkashTransactionId?: string;
  bkashAccountNumber?: string;
  bankAccountNumberFrom?: string;
}

interface ApplicationPDFProps {
  data: ApplicationData;
}

const ApplicationPDF: React.FC<ApplicationPDFProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Purbachal Newtown Society</Text>
        <Text style={styles.title}>Membership Application Form</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Plot Information</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Sector Number:</Text>
          <Text style={styles.value}>{data.sectorNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Road Number:</Text>
          <Text style={styles.value}>{data.roadNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Plot Number:</Text>
          <Text style={styles.value}>{data.plotNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Plot Size:</Text>
          <Text style={styles.value}>{data.plotSize} Katha</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Ownership Proof Type:</Text>
          <Text style={styles.value}>{data.ownershipProofType}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>Owner Information</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Name (English):</Text>
          <Text style={styles.value}>{data.ownerNameEnglish}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>নাম (বাংলা):</Text>
          <Text style={styles.value}>{data.ownerNameBangla}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{data.contactNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>NID Number:</Text>
          <Text style={styles.value}>{data.nidNumber}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Present Address:</Text>
          <Text style={styles.value}>{data.presentAddress}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Permanent Address:</Text>
          <Text style={styles.value}>{data.permanentAddress}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>Payment Information</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{data.paymentMethod}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Membership Fee:</Text>
          <Text style={styles.value}>BDT {data.membershipFee}</Text>
        </View>
        {data.paymentMethod === "BKASH" && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>bKash Transaction ID:</Text>
              <Text style={styles.value}>{data.bkashTransactionId}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>bKash Account Number:</Text>
              <Text style={styles.value}>{data.bkashAccountNumber}</Text>
            </View>
          </>
        )}
        {data.paymentMethod === "BANK" && (
          <View style={styles.field}>
            <Text style={styles.label}>Sender Account Number:</Text>
            <Text style={styles.value}>{data.bankAccountNumberFrom}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 10, textAlign: "center", marginTop: 50 }}>
          Application submitted on {new Date().toLocaleDateString("en-GB")}
        </Text>
      </View>
    </Page>
  </Document>
);

export default ApplicationPDF;
