import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HelpSupport() {
  const router = useRouter();
  const { colors } = useTheme();

  const faqs = [
    {
      question: "How do I borrow a book?",
      answer: "Click on any book in the home or search tab, then tap the 'Borrow' button. You can keep books for up to 14 days."
    },
    {
      question: "Can I extend my borrowing period?",
      answer: "Yes! Go to 'My Books' tab, find your borrowed book, and tap 'Extend'. Note that there is a limit on the number of extensions."
    },
    {
      question: "How do I return a book?",
      answer: "Visit the library and show your digital ID in the app to the librarian, or use the 'Return' button if you've physically returned it."
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.question, { color: colors.primary }]}>{faq.question}</Text>
            <Text style={[styles.answer, { color: colors.text }]}>{faq.answer}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Contact Us</Text>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.surface }]}
          onPress={() => Linking.openURL('mailto:support@mad-library.com')}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="mail" size={22} color={colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email Support</Text>
            <Text style={[styles.contactValue, { color: colors.textMuted }]}>support@mad-library.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.surface, marginTop: 12 }]}
          onPress={() => Linking.openURL('https://wa.me/6285756479594')}
        >
          <View style={[styles.iconCircle, { backgroundColor: `#25D36620` }]}>
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp Support</Text>
            <Text style={[styles.contactValue, { color: colors.textMuted }]}>+62 857 5647 9594</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  faqCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactValue: {
    fontSize: 13,
    marginTop: 2,
  },
});
