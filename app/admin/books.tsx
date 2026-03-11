import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FACULTY_OPTIONS = [
  { label: "Filsafat", value: "Filsafat" },
  { label: "Fkep (Keperawatan)", value: "Fkep" },
  { label: "FKIP (Keguruan & Ilmu Pendidikan)", value: "FKIP" },
  { label: "Filkom (Ilmu Komputer)", value: "Filkom" },
  { label: "Pertanian", value: "Pertanian" },
  { label: "Arsitek", value: "Arsitek" },
];

export default function ManageBooks() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    faculty: "",
    floor: "Floor 3",
    section: "Section A",
    shelfLocation: "",
    coverImage: "📚",
  });

  const [showFacultyPicker, setShowFacultyPicker] = useState(false);

  // Queries
  const books = useQuery(api.books.getBooks, {}) ?? [];

  // Mutations
  const addBook = useMutation(api.admin.addBook);
  const updateBook = useMutation(api.admin.updateBook);
  const deleteBook = useMutation(api.admin.deleteBook);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      faculty: "",
      floor: "Floor 2",
      section: "Section A",
      shelfLocation: "",
      coverImage: "📚",
    });
    setEditingBook(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.author || !formData.faculty || !formData.shelfLocation) {
      Alert.alert("Error", "Title, Author, Faculty, and Shelf Location are required");
      return;
    }

    try {
      await addBook({
        title: formData.title,
        author: formData.author,
        faculty: formData.faculty,
        floor: formData.floor,
        section: formData.section,
        shelfLocation: formData.shelfLocation,
        category: "General",
        description: "",
        coverImage: formData.coverImage,
        totalCopies: 1,
        availableCopies: 1,
        isbn: "N/A",
        publisher: "Library Press",
        publishedYear: new Date().getFullYear(),
        pages: 100,
        language: "Indonesian",
        isEbook: false,
      });
      Alert.alert("Success", "Book added successfully");
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save book");
    }
  };

  const openEdit = (book: any) => {
    Alert.alert("Info", "Edit feature is disabled in simple mode");
  };

  const handleDelete = (bookId: Id<"books">, title: string) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBook({ bookId });
              Alert.alert("Success", "Book deleted successfully");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete book");
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Search Bar */}
      <View style={[styles.headerSearch, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.bg }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search title or author..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bookCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.bookCover, { backgroundColor: colors.border }]}>
              <Text style={styles.coverEmoji}>{item.coverImage}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.bookAuthor, { color: colors.textMuted }]}>{item.author}</Text>
              <View style={styles.stockInfo}>
                <Ionicons name="cube-outline" size={14} color={colors.primary} />
                <Text style={[styles.stockText, { color: colors.text }]}>
                  {item.availableCopies} / {item.totalCopies} available
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.primary + "20" }]}
                onPress={() => openEdit(item)}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.danger + "20" }]}
                onPress={() => handleDelete(item._id, item.title)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Book Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBg}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add New Book
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.text }]}>Title</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Book Title"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Author</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.author}
                onChangeText={(text) => setFormData({ ...formData, author: text })}
                placeholder="Author Name"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Faculty</Text>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={() => setShowFacultyPicker(!showFacultyPicker)}
              >
                <Text style={[styles.pickerButtonText, { color: formData.faculty ? colors.text : colors.textMuted }]}>
                  {formData.faculty || "Select Faculty"}
                </Text>
                <Ionicons
                  name={showFacultyPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {showFacultyPicker && (
                <View style={[styles.pickerContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <ScrollView showsVerticalScrollIndicator={true} style={styles.pickerScrollView}>
                    {FACULTY_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.pickerOption}
                        onPress={() => {
                          setFormData({ ...formData, faculty: option.value });
                          setShowFacultyPicker(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                          {option.label}
                        </Text>
                        {formData.faculty === option.value && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={[styles.label, { color: colors.text }]}>Shelf Location</Text>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.labelSmall, { color: colors.text }]}>Floor</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={formData.floor}
                    onChangeText={(text) => setFormData({ ...formData, floor: text })}
                    placeholder="Floor 2"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.labelSmall, { color: colors.text }]}>Section</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={formData.section}
                    onChangeText={(text) => setFormData({ ...formData, section: text })}
                    placeholder="Section A"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.labelSmall, { color: colors.text }]}>Shelf</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={formData.shelfLocation}
                    onChangeText={(text) => setFormData({ ...formData, shelfLocation: text })}
                    placeholder="A-101"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Cover Emoji</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={formData.coverImage}
                onChangeText={(text) => setFormData({ ...formData, coverImage: text })}
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Book</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSearch: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  coverEmoji: {
    fontSize: 30,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookAuthor: {
    fontSize: 13,
    marginTop: 2,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  pickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    overflow: "hidden",
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
