"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 57,
    paddingLeft: 70,
    paddingRight: 57,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#000000",
  },
  absender: {
    fontSize: 10,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  empfaengerBlock: {
    marginBottom: 30,
    lineHeight: 1.6,
  },
  datumZeichen: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    fontSize: 10,
  },
  aktenzeichen: {
    fontSize: 10,
    marginBottom: 20,
    color: "#333",
  },
  betreff: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
    textDecoration: "underline",
  },
  anrede: {
    marginBottom: 15,
  },
  textBlock: {
    marginBottom: 20,
    textAlign: "justify",
  },
  gruss: {
    marginBottom: 50,
  },
  unterschrift: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    width: 200,
    fontSize: 10,
  },
  anlage: {
    marginTop: 20,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 70,
    right: 57,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 5,
  },
});

export interface LetterPDFData {
  absenderName: string;
  absenderStrasse: string;
  absenderPlzOrt: string;
  absenderEmail: string;
  empfaengerName: string;
  empfaengerAdresse: string;
  datum: string;
  aktenzeichen: string;
  bescheiddatum: string;
  schreibentypLabel: string;
  letter: string;
}

const PLACEHOLDER_STRASSE = "[Ihre Straße und Hausnummer]";
const PLACEHOLDER_PLZ_ORT = "[PLZ Ort]";
const PLACEHOLDER_BEHOERDE_ADRESSE = "[Adresse der Behörde eintragen]";

export default function LetterPDF({ data }: { data: LetterPDFData }) {
  const absenderStrasse = data.absenderStrasse || PLACEHOLDER_STRASSE;
  const absenderPlzOrt = data.absenderPlzOrt || PLACEHOLDER_PLZ_ORT;
  const empfaengerAdresse = data.empfaengerAdresse || PLACEHOLDER_BEHOERDE_ADRESSE;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Absender */}
        <View style={styles.absender}>
          <Text>{data.absenderName}</Text>
          <Text>{absenderStrasse}</Text>
          <Text>{absenderPlzOrt}</Text>
          <Text>{data.absenderEmail}</Text>
        </View>

        {/* Empfänger */}
        <View style={styles.empfaengerBlock}>
          <Text>{data.empfaengerName}</Text>
          <Text>{empfaengerAdresse}</Text>
        </View>

        {/* Datum + Unser Zeichen */}
        <View style={styles.datumZeichen}>
          <Text>Datum: {data.datum}</Text>
          <Text>Aktenzeichen: {data.aktenzeichen}</Text>
        </View>

        {/* Betreff */}
        <View style={styles.betreff}>
          <Text>
            {data.schreibentypLabel}: Aktenzeichen {data.aktenzeichen}
          </Text>
          <Text>Bescheid vom {data.bescheiddatum}</Text>
        </View>

        {/* Anrede */}
        <View style={styles.anrede}>
          <Text>Sehr geehrte Damen und Herren,</Text>
        </View>

        {/* Generierter Text */}
        <View style={styles.textBlock}>
          <Text>{data.letter}</Text>
        </View>

        {/* Gruß + Unterschrift */}
        <View style={styles.gruss}>
          <Text>Mit freundlichen Grüßen</Text>
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text>{"\n\n\n"}</Text>
        </View>
        <View style={styles.unterschrift}>
          <Text>{data.absenderName}</Text>
        </View>

        {/* Anlage */}
        <View style={styles.anlage}>
          <Text>Anlage: Kopie des Bescheids vom {data.bescheiddatum}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Erstellt mit BescheidRecht.de | Dieser Entwurf ersetzt keine Rechtsberatung (§ 2 RDG)
          </Text>
        </View>
      </Page>
    </Document>
  );
}
