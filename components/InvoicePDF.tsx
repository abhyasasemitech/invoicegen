import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    fontSize: 12,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
    padding: 10,
    borderBottom: '1px solid #ddd',
  },
  table: {
    display: 'flex',
    width: '100%',
    borderCollapse: 'collapse',
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid #ddd',
    padding: 5,
  },
  column: {
    flex: 1,
    textAlign: 'left',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 10,
  }
});

// Create Invoice Document Component
interface InvoiceProps {
  invoiceNum: string;
  date: string;
  client_name: string;
  client_address: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
  note: string;
}

const InvoicePDF: React.FC<InvoiceProps> = ({
  invoiceNum,
  date,
  client_name,
  client_address,
  description,
  quantity,
  rate,
  total,
  note,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ABHYASA SEMICON TECHNOLOGIES</Text>
        <Text>D.no 48-14-31/1, 2nd Floor, Akhila Arcade, Rama Talkies Road, Visakhapatnam, AP, India</Text>
        <Text>Email: abhyasasemitech@gmail.com | Phone: +91-9438062982</Text>
      </View>

      <View style={styles.section}>
        <Text>Invoice #: {invoiceNum}</Text>
        <Text>Date: {date}</Text>
      </View>
      
      <View style={styles.section}>
        <Text>Billed To:</Text>
        <Text>{client_name}</Text>
        <Text>{client_address}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.column}>Description</Text>
          <Text style={styles.column}>Quantity</Text>
          <Text style={styles.column}>Unit Price</Text>
          <Text style={styles.column}>Total</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.column}>{description}</Text>
          <Text style={styles.column}>{quantity}</Text>
          <Text style={styles.column}>&#8377; {rate}</Text>
          <Text style={styles.column}>&#8377; {total}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text>Total Amount: &#8377; {total}</Text>
      </View>
      
      <View style={styles.section}>
        <Text>Note: {note}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for choosing Abhyasa Semicon Technologies for your VLSI training!</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
