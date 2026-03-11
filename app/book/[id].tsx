import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { LoadingView } from "@/components/States";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { userId } = useAuth();

  const book = useQuery(api.books.getBookById, id ? { bookId: id as Id<"books"> } : "skip");

  const borrowBook = useMutation(api.borrowings.borrowBook);
  const reserveForPickup = useMutation(api.borrowings.reserveForPickup);
  const addToFavorites = useMutation(api.favorites.addToFavorites);
  const removeFromFavorites = useMutation(api.favorites.removeFromFavorites);

  const [isReserving, setIsReserving] = useState(false);

  const isFavorite = useQuery(
    api.favorites.isFavorite,
    userId && id ? { userId, bookId: id as Id<"books"> } : "skip"
  );

  const handleBorrow = async () => {
    if (!book || !userId) return;

    setIsBorrowing(true);
    try {
      await borrowBook({ userId, bookId: book._id });
      Alert.alert(
        "Success! 📚",
        `Book borrowed! Please pick up at:\n${book.floor}, ${book.section}, Shelf ${book.shelfLocation}\n\nDue date: 14 days from today`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to borrow book");
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleReserve = async () => {
    if (!book || !userId) return;

    setIsReserving(true);
    try {
      await reserveForPickup({ userId, bookId: book._id });
      Alert.alert(
        "Reserved! ✅",
        `Book reserved for 48 hours!\n\nPick up at:\n${book.floor}, ${book.section}, Shelf ${book.shelfLocation}\n\nShow this confirmation at the pickup counter.`
      );
    } catch (error: any) {
      console.error("Reserve error:", error);
      
      // Handle specific error messages
      let errorMessage = "Failed to reserve book";
      if (error.message.includes("already reserved")) {
        errorMessage = "❌ This book is already reserved by another user.\n\nPlease choose a different book or try again later.";
      } else if (error.message.includes("not available")) {
        errorMessage = "❌ This book is currently not available.\n\nAll copies are borrowed or reserved.";
      } else if (error.message.includes("already have a reservation")) {
        errorMessage = "ℹ️ You already have a reservation for this book.\n\nCheck My Books → Reserved tab.";
      }
      
      Alert.alert("Reservation Failed", errorMessage);
    } finally {
      setIsReserving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!book || !userId) return;

    try {
      if (isFavorite) {
        await removeFromFavorites({ userId, bookId: book._id });
        Alert.alert("Success", "Removed from favorites");
      } else {
        await addToFavorites({ userId, bookId: book._id });
        Alert.alert("Success", "Added to favorites");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update favorites");
    }
  };

  if (!book) {
    return <LoadingView message="Loading book details..." />;
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover Header */}
      <View style={[styles.coverHeader, { backgroundColor: colors.gradients.primary[0] }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.coverEmoji}>{book.coverImage}</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? colors.danger : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* Book Info */}
      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <View style={styles.ratingRow}>
          <View style={[styles.ratingBadge, { backgroundColor: colors.border }]}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {book.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.ratingCount, { color: colors.textMuted }]}>
            ({book.totalRatings} ratings)
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.categoryText, { color: colors.textMuted }]}>
              {book.category}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
        <Text style={[styles.author, { color: colors.textMuted }]}>by {book.author}</Text>

        {/* Shelf Location - For Physical Library */}
        {book.floor && book.section && book.shelfLocation && (
          <View style={[styles.shelfLocationCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={styles.shelfHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={[styles.shelfTitle, { color: colors.text }]}>Find in Library</Text>
            </View>
            <View style={styles.shelfDetails}>
              <View style={styles.shelfRow}>
                <Ionicons name="layers" size={16} color={colors.textMuted} />
                <Text style={[styles.shelfText, { color: colors.text }]}>{book.floor}</Text>
              </View>
              <View style={styles.shelfRow}>
                <Ionicons name="grid" size={16} color={colors.textMuted} />
                <Text style={[styles.shelfText, { color: colors.text }]}>{book.section}</Text>
              </View>
              <View style={styles.shelfRow}>
                <Ionicons name="bookmark" size={16} color={colors.textMuted} />
                <Text style={[styles.shelfText, { color: colors.text }]}>Shelf {book.shelfLocation}</Text>
              </View>
            </View>
            <View style={[styles.shelfNote, { backgroundColor: `${colors.primary}10` }]}>
              <Ionicons name="information-circle" size={14} color={colors.primary} />
              <Text style={[styles.shelfNoteText, { color: colors.primary }]}>
                Visit the library to access this book
              </Text>
            </View>
          </View>
        )}

        {/* Availability */}
        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor: isAvailable
                ? `${colors.success}20`
                : `${colors.danger}20`,
            },
          ]}
        >
          <Ionicons
            name={isAvailable ? "checkmark-circle" : "close-circle"}
            size={18}
            color={isAvailable ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.availabilityText,
              { color: isAvailable ? colors.success : colors.danger },
            ]}
          >
            {isAvailable ? `${book.availableCopies} copies available` : "Currently unavailable"}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {isAvailable ? (
          book.isReserved ? (
            // Book is reserved by someone else
            <TouchableOpacity
              style={[styles.reserveButton, { backgroundColor: colors.border }]}
              disabled
            >
              <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
              <Text style={[styles.reserveButtonText, { color: colors.textMuted }]}>
                Reserved by Others
              </Text>
            </TouchableOpacity>
          ) : (
            // Book available for reservation
            <TouchableOpacity
              style={[styles.reserveButton, { backgroundColor: colors.primary }]}
              onPress={handleReserve}
              disabled={isReserving}
            >
              {isReserving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="bookmark" size={20} color="#fff" />
              )}
              <Text style={styles.reserveButtonText}>
                {isReserving ? "Reserving..." : "Reserve for Pickup"}
              </Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={[styles.reserveButton, { backgroundColor: colors.border }]}
            disabled
          >
            <Text style={[styles.reserveButtonText, { color: colors.textMuted }]}>
              Not Available
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Book Details */}
      <View style={[styles.detailsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About this book</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {book.description}
        </Text>

        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.metadataText, { color: colors.textMuted }]}>
              {book.publishedYear}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.metadataText, { color: colors.textMuted }]}>
              {book.pages} pages
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="language-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.metadataText, { color: colors.textMuted }]}>
              {book.language}
            </Text>
          </View>
        </View>

        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Ionicons name="business-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.metadataText, { color: colors.textMuted }]}>
              {book.publisher}
            </Text>
          </View>
        </View>

        <View style={[styles.isbnRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.isbnLabel, { color: colors.textMuted }]}>ISBN</Text>
          <Text style={[styles.isbnValue, { color: colors.text }]}>{book.isbn}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverHeader: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  coverEmoji: {
    fontSize: 120,
  },
  infoSection: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 13,
    marginLeft: 8,
  },
  categoryBadge: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    marginBottom: 16,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: "500",
  },
  actionsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  reserveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  borrowButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  borrowButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  readButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsSection: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: 13,
  },
  metadataRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  isbnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  isbnLabel: {
    fontSize: 13,
  },
  isbnValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Shelf Location Styles
  shelfLocationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  shelfHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  shelfTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  shelfDetails: {
    marginBottom: 12,
  },
  shelfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  shelfText: {
    fontSize: 14,
    fontWeight: "500",
  },
  shelfNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  shelfNoteText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  // Progress Styles
  progressSection: {
    margin: 20,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarLarge: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFillLarge: {
    height: 10,
    borderRadius: 5,
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  pageInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  pageDivider: {
    fontSize: 15,
    fontWeight: "500",
    paddingBottom: 12,
  },
  updateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

